import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAchievementProgress, getUserAchievements } from '../../../shared/utils/achievementManager';

/**
 * Başarımlar Ekranı
 */
const AchievementsScreen = ({ onBack }) => {
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState({ unlocked: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [achievementsList, progressData] = await Promise.all([
        getUserAchievements(),
        getAchievementProgress(),
      ]);
      setAchievements(achievementsList);
      setProgress(progressData);
    } catch (error) {
      console.error('loadAchievements error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="trophy" size={64} color="#FFD700" />
          <Text style={styles.loadingText}>Başarılar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Başarılarım</Text>
        <TouchableOpacity onPress={loadAchievements} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={24} color="#B0B0B0" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* İlerleme Kartı */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <MaterialCommunityIcons name="trophy" size={48} color="#FFD700" />
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                {progress.unlocked} / {progress.total}
              </Text>
              <Text style={styles.progressSubtitle}>Başarı Kazanıldı</Text>
            </View>
            <Text style={styles.progressPercentage}>{progress.percentage}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress.percentage}%` }]} />
          </View>
        </View>

        {/* Başarımlar Listesi */}
        <View style={styles.achievementsList}>
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))}
        </View>

        {/* Boş Durum */}
        {achievements.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="trophy-outline" size={80} color="#555555" />
            <Text style={styles.emptyTitle}>Henüz Başarı Yok</Text>
            <Text style={styles.emptyText}>
              Oyun oyna ve başarıları kazan!
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Başarım Kartı
 */
const AchievementCard = ({ achievement }) => {
  const { title, description, icon, color, unlocked } = achievement;

  return (
    <View style={[styles.achievementCard, !unlocked && styles.achievementCardLocked]}>
      <View style={[styles.achievementIcon, { backgroundColor: unlocked ? color : '#2C2C2C' }]}>
        <MaterialCommunityIcons
          name={icon}
          size={32}
          color={unlocked ? '#121212' : '#555555'}
        />
      </View>
      <View style={styles.achievementContent}>
        <Text style={[styles.achievementTitle, !unlocked && styles.achievementTitleLocked]}>
          {title}
        </Text>
        <Text style={[styles.achievementDescription, !unlocked && styles.achievementDescriptionLocked]}>
          {description}
        </Text>
      </View>
      {unlocked && (
        <MaterialCommunityIcons name="check-circle" size={24} color={color} />
      )}
      {!unlocked && (
        <MaterialCommunityIcons name="lock" size={24} color="#555555" />
      )}
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
  progressCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E0E0',
    fontFamily: 'SpecialElite',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 2,
    fontFamily: 'serif',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    fontFamily: 'SpecialElite',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#2C2C2C',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
    fontFamily: 'SpecialElite',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#757575',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#B0B0B0',
    fontFamily: 'serif',
  },
  achievementDescriptionLocked: {
    color: '#555555',
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

export default AchievementsScreen;
