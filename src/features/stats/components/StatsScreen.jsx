import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllStoryMetadata, getAllStoryCounts } from '../../../data/stories/storyLoader';
import { getAllStoryStats, getCompletedStories, getUserStats } from '../../../shared/utils/storageManager';

const { width } = Dimensions.get('window');

/**
 * İstatistikler Ekranı
 * Kullanıcının oyun istatistiklerini gösterir
 */
const StatsScreen = ({ onBack }) => {
  const [userStats, setUserStats] = useState(null);
  const [completedStories, setCompletedStories] = useState([]);
  const [storyStats, setStoryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const storyCounts = getAllStoryCounts();
  const totalStories = storyCounts.kolay + storyCounts.orta + storyCounts.zor;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [user, completed, stories] = await Promise.all([
        getUserStats(),
        getCompletedStories(),
        getAllStoryStats(),
      ]);
      setUserStats(user);
      setCompletedStories(completed);
      setStoryStats(stories);
    } catch (error) {
      console.error('loadStats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0dk';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}s ${mins}dk`;
    return `${mins}dk`;
  };

  const getCompletionRate = () => {
    
    const completed = completedStories.length;
    return Math.round(totalStories > 0 ? (completed / totalStories) * 100 : 0);
  };

  const getDifficultyBreakdown = () => {
    const breakdown = { kolay: 0, orta: 0, zor: 0 };
    
    completedStories.forEach(id => {
      if (id >= 101 && id <= 199) breakdown.kolay++;
      else if (id >= 201 && id <= 299) breakdown.orta++;
      else if (id >= 301 && id <= 399) breakdown.zor++;
    });
    
    return breakdown;
  };

  const getFastestStories = () => {
    const stories = [];
    
    Object.entries(storyStats).forEach(([id, stats]) => {
      if (stats.bestTime) {
        // Hikaye metadata'sını bul
        const allMetadata = [
          ...getAllStoryMetadata('kolay'),
          ...getAllStoryMetadata('orta'),
          ...getAllStoryMetadata('zor'),
        ];
        const metadata = allMetadata.find(s => s.id === parseInt(id));
        
        if (metadata) {
          stories.push({
            id: parseInt(id),
            title: metadata.baslik,
            time: stats.bestTime,
            icon: metadata.icon,
          });
        }
      }
    });
    
    return stories.sort((a, b) => a.time - b.time).slice(0, 3);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="chart-line" size={64} color="#90CAF9" />
          <Text style={styles.loadingText}>İstatistikler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const difficultyBreakdown = getDifficultyBreakdown();
  const fastestStories = getFastestStories();
  const completionRate = getCompletionRate();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İstatistikler</Text>
        <TouchableOpacity onPress={loadStats} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={24} color="#B0B0B0" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Genel Özet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Genel Özet</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              icon="trophy"
              label="Çözülen Vaka"
              value={completedStories.length}
              total={totalStories}
              color="#FFD700"
            />
            <StatCard
              icon="clock"
              label="Toplam Süre"
              value={formatTime(userStats?.totalTimePlayed || 0)}
              color="#90CAF9"
            />
            <StatCard
              icon="speedometer"
              label="Ortalama Süre"
              value={formatTime(userStats?.averageTime || 0)}
              color="#A5D6A7"
            />
            <StatCard
              icon="lightbulb"
              label="İpucu Kullanımı"
              value={userStats?.totalHintsUsed || 0}
              color="#FFCC80"
            />
          </View>
        </View>

        {/* Tamamlanma Oranı */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Tamamlanma Oranı</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressPercentage}>{completionRate}%</Text>
              <Text style={styles.progressLabel}>
                {completedStories.length} / {totalStories} vaka çözüldü
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${completionRate}%` }]} />
            </View>
          </View>
        </View>

        {/* Zorluk Dağılımı */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Zorluk Dağılımı</Text>
          <View style={styles.difficultyCard}>
            <DifficultyBar
              label="Kolay"
              count={difficultyBreakdown.kolay}
              total={storyCounts.kolay}
              color="#2E7D32"
            />
            <DifficultyBar
              label="Orta"
              count={difficultyBreakdown.orta}
              total={storyCounts.orta}
              color="#F9A825"
            />
            <DifficultyBar
              label="Zor"
              count={difficultyBreakdown.zor}
              total={storyCounts.zor}
              color="#C62828"
            />
          </View>
        </View>

        {/* Streak */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Günlük Seri</Text>
          <View style={styles.streakCard}>
            <MaterialCommunityIcons name="fire" size={48} color="#FF6B35" />
            <Text style={styles.streakNumber}>{userStats?.streak || 0}</Text>
            <Text style={styles.streakLabel}>gün üst üste</Text>
            {userStats?.streak > 0 && (
              <Text style={styles.streakSubtext}>
                Harika gidiyorsun! Devam et 🎉
              </Text>
            )}
            {userStats?.streak === 0 && (
              <Text style={styles.streakSubtext}>
                Bugün bir vaka çöz ve seriyi başlat!
              </Text>
            )}
          </View>
        </View>

        {/* En Hızlı Çözümler */}
        {fastestStories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ En Hızlı Çözümler</Text>
            <View style={styles.fastestCard}>
              {fastestStories.map((story, index) => (
                <View key={story.id} style={styles.fastestItem}>
                  <View style={styles.fastestRank}>
                    <Text style={styles.fastestRankText}>#{index + 1}</Text>
                  </View>
                  <MaterialCommunityIcons 
                    name={story.icon} 
                    size={24} 
                    color="#B0B0B0" 
                  />
                  <Text style={styles.fastestTitle} numberOfLines={1}>
                    {story.title}
                  </Text>
                  <View style={styles.fastestTime}>
                    <MaterialCommunityIcons name="timer" size={16} color="#90CAF9" />
                    <Text style={styles.fastestTimeText}>
                      {formatTime(story.time)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Boş Durum */}
        {completedStories.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="chart-box-outline" size={80} color="#555555" />
            <Text style={styles.emptyTitle}>Henüz İstatistik Yok</Text>
            <Text style={styles.emptyText}>
              İlk vakayı çöz ve istatistiklerin burada görünsün!
            </Text>
          </View>
        )}

        {/* Alt Boşluk */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * İstatistik Kartı Komponenti
 */
const StatCard = ({ icon, label, value, total, color }) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={32} color={color} />
    <Text style={styles.statValue}>
      {value}
      {total && <Text style={styles.statTotal}>/{total}</Text>}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * Zorluk Çubuğu Komponenti
 */
const DifficultyBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <View style={styles.difficultyItem}>
      <View style={styles.difficultyHeader}>
        <Text style={styles.difficultyLabel}>{label}</Text>
        <Text style={styles.difficultyCount}>
          {count}/{total}
        </Text>
      </View>
      <View style={styles.difficultyBarContainer}>
        <View 
          style={[
            styles.difficultyBar, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontFamily: 'serif',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
    fontFamily: 'SpecialElite',
  },
  refreshButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 12,
    fontFamily: 'SpecialElite',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 48) / 2 - 6,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginTop: 8,
    fontFamily: 'SpecialElite',
  },
  statTotal: {
    fontSize: 18,
    color: '#757575',
  },
  statLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  progressCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#90CAF9',
    fontFamily: 'SpecialElite',
  },
  progressLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    fontFamily: 'serif',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#2C2C2C',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#90CAF9',
    borderRadius: 6,
  },
  difficultyCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  difficultyItem: {
    gap: 8,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: 15,
    color: '#E0E0E0',
    fontFamily: 'serif',
    fontWeight: '600',
  },
  difficultyCount: {
    fontSize: 14,
    color: '#B0B0B0',
    fontFamily: 'SpecialElite',
  },
  difficultyBarContainer: {
    height: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 4,
    overflow: 'hidden',
  },
  difficultyBar: {
    height: '100%',
    borderRadius: 4,
  },
  streakCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 8,
    fontFamily: 'SpecialElite',
  },
  streakLabel: {
    fontSize: 16,
    color: '#B0B0B0',
    marginTop: 4,
    fontFamily: 'serif',
  },
  streakSubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  fastestCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  fastestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#252525',
    borderRadius: 8,
  },
  fastestRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastestRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#121212',
    fontFamily: 'SpecialElite',
  },
  fastestTitle: {
    flex: 1,
    fontSize: 14,
    color: '#E0E0E0',
    fontFamily: 'serif',
  },
  fastestTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
  },
  fastestTimeText: {
    fontSize: 12,
    color: '#90CAF9',
    fontFamily: 'SpecialElite',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 16,
    fontFamily: 'SpecialElite',
  },
  emptyText: {
    fontSize: 14,
    color: '#555555',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'serif',
  },
});

export default StatsScreen;
