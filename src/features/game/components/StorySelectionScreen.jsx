import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllStoryMetadata } from '../../../data/stories/storyLoader';
import AppText from '../../../shared/components/AppText';
import { getCompletedStories, getFavoriteStories, toggleFavoriteStory } from '../../../shared/utils/storageManager';
import StoryCard from './StoryCard';

/**
 * Hikaye Seçim Ekranı
 * Kullanıcının hikaye kartlarından seçim yapabileceği ekran
 */
const StorySelectionScreen = ({ difficulty, onBack, onSelectStory, gameMode }) => {
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, completed, favorites
  const [completedStories, setCompletedStories] = useState([]);
  const [favoriteStories, setFavoriteStories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hikayeleri yükle
  const stories = getAllStoryMetadata(difficulty);
  
  // Storage'dan verileri yükle
  useEffect(() => {
    loadStorageData();
  }, []);
  
  const loadStorageData = async () => {
    try {
      setLoading(true);
      const [completed, favorites] = await Promise.all([
        getCompletedStories(),
        getFavoriteStories(),
      ]);
      setCompletedStories(completed);
      setFavoriteStories(favorites);
    } catch (error) {
      console.error('loadStorageData error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Favori toggle
  const handleToggleFavorite = async (storyId, event) => {
    // Event propagation'ı durdur (kartın tıklanmasını engelle)
    event?.stopPropagation();
    
    const newState = await toggleFavoriteStory(storyId);
    
    // State'i güncelle
    if (newState) {
      setFavoriteStories([...favoriteStories, storyId]);
    } else {
      setFavoriteStories(favoriteStories.filter(id => id !== storyId));
    }
  };

  // Filtreleme
  const getFilteredStories = () => {
    if (selectedFilter === 'completed') {
      return stories.filter(s => completedStories.includes(s.id));
    }
    if (selectedFilter === 'favorites') {
      return stories.filter(s => favoriteStories.includes(s.id));
    }
    return stories;
  };

  const filteredStories = getFilteredStories();

  // Zorluk rengini belirle
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'kolay': return '#2E7D32';
      case 'orta': return '#F9A825';
      case 'zor': return '#C62828';
      default: return '#757575';
    }
  };

  const difficultyColor = getDifficultyColor();

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={difficultyColor} />
          <AppText style={{ color: '#B0B0B0', marginTop: 16, fontFamily: 'serif' }}>
            Vakalar yükleniyor...
          </AppText>
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
        
        <View style={styles.headerCenter}>
          <AppText style={styles.headerTitle}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Vakalar
          </AppText>
          <AppText style={styles.headerSubtitle}>
            {filteredStories.length} vaka mevcut
          </AppText>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
        </View>
      </View>

      {/* Filtre Butonları */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <MaterialCommunityIcons 
            name="view-grid" 
            size={18} 
            color={selectedFilter === 'all' ? '#FFFFFF' : '#B0B0B0'} 
          />
          <AppText style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            Tümü
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'favorites' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('favorites')}
        >
          <MaterialCommunityIcons 
            name="star" 
            size={18} 
            color={selectedFilter === 'favorites' ? '#FFD700' : '#B0B0B0'} 
          />
          <AppText style={[styles.filterText, selectedFilter === 'favorites' && styles.filterTextActive]}>
            Favoriler
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'completed' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('completed')}
        >
          <MaterialCommunityIcons 
            name="check-circle" 
            size={18} 
            color={selectedFilter === 'completed' ? '#2E7D32' : '#B0B0B0'} 
          />
          <AppText style={[styles.filterText, selectedFilter === 'completed' && styles.filterTextActive]}>
            Çözülenler
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Hikaye Kartları */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredStories.length > 0 ? (
          filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              difficulty={difficulty}
              completed={completedStories.includes(story.id)}
              favorite={favoriteStories.includes(story.id)}
              onPress={() => onSelectStory(story.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="folder-open" size={64} color="#555555" />
            <AppText style={styles.emptyText}>
              {selectedFilter === 'completed' 
                ? 'Henüz çözülmüş vaka yok'
                : selectedFilter === 'favorites'
                ? 'Henüz favori vaka yok'
                : 'Vaka bulunamadı'}
            </AppText>
          </View>
        )}

        {/* Rastgele Vaka Butonu */}
        {filteredStories.length > 0 && (
          <TouchableOpacity 
            style={[styles.randomButton, { borderColor: difficultyColor }]}
            onPress={() => {
              const randomStory = filteredStories[Math.floor(Math.random() * filteredStories.length)];
              onSelectStory(randomStory.id);
            }}
          >
            <MaterialCommunityIcons name="shuffle-variant" size={24} color={difficultyColor} />
            <AppText style={[styles.randomButtonText, { color: difficultyColor }]}>
              Rastgele Vaka Seç
            </AppText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
    fontFamily: 'SpecialElite',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 2,
    fontFamily: 'serif',
  },
  headerRight: {
    width: 36,
    alignItems: 'flex-end',
  },
  difficultyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterButtonActive: {
    backgroundColor: '#2C2C2C',
    borderColor: '#555555',
  },
  filterText: {
    fontSize: 12,
    color: '#B0B0B0',
    fontFamily: 'SpecialElite',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 16,
    fontFamily: 'serif',
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#1E1E1E',
    marginTop: 8,
    marginBottom: 16,
  },
  randomButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpecialElite',
  },
});

export default StorySelectionScreen;
