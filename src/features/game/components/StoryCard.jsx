import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../../../shared/components/AppText';

/**
 * Hikaye Kartı Komponenti
 * Modern kart tasarımı ile hikaye önizlemesi
 */
const StoryCard = React.memo(({ story, difficulty, onPress, completed = false, favorite = false, onToggleFavorite }) => {
  // Zorluk rengini belirle
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'kolay': return '#2E7D32';
      case 'orta': return '#F9A825';
      case 'zor': return '#C62828';
      default: return '#757575';
    }
  };

  // Kategori ikonunu belirle
  const getCategoryIcon = () => {
    switch (story.kategori) {
      case 'Cinayet': return 'knife';
      case 'Gizem': return 'help-circle';
      case 'Mantık': return 'brain';
      case 'Dram': return 'drama-masks';
      case 'Komedi': return 'emoticon-happy';
      default: return 'book-open-variant';
    }
  };

  // Oyuncu sayısını formatla
  const formatPlayerCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const difficultyColor = getDifficultyColor();

  return (
    <TouchableOpacity 
      style={[styles.card, completed && styles.cardCompleted]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Üst Kısım - İkon ve Başlık */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: difficultyColor + '20' }]}>
          <MaterialCommunityIcons 
            name={story.icon || 'book-open-variant'} 
            size={32} 
            color={difficultyColor} 
          />
        </View>
        
        <View style={styles.headerText}>
          <AppText style={styles.title} numberOfLines={2}>
            {story.baslik}
          </AppText>
          <View style={styles.categoryRow}>
            <MaterialCommunityIcons 
              name={getCategoryIcon()} 
              size={14} 
              color="#B0B0B0" 
            />
            <AppText style={styles.category}>{story.kategori}</AppText>
          </View>
        </View>

        {/* Favori ve Tamamlanma İşaretleri */}
        <View style={styles.badges}>
          {favorite && (
            <TouchableOpacity onPress={(e) => onToggleFavorite?.(story.id, e)}>
              <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
            </TouchableOpacity>
          )}
          {!favorite && onToggleFavorite && (
            <TouchableOpacity onPress={(e) => onToggleFavorite?.(story.id, e)}>
              <MaterialCommunityIcons name="star-outline" size={20} color="#757575" />
            </TouchableOpacity>
          )}
          {completed && (
            <MaterialCommunityIcons name="check-circle" size={20} color="#2E7D32" />
          )}
        </View>
      </View>

      {/* Önizleme Metni */}
      <AppText style={styles.preview} numberOfLines={2}>
        {story.onizleme}
      </AppText>

      {/* Alt Kısım - İstatistikler */}
      <View style={styles.footer}>
        {/* Zorluk Badge */}
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
          <AppText style={styles.difficultyText}>
            {difficulty.toUpperCase()}
          </AppText>
        </View>

        {/* İstatistikler */}
        <View style={styles.stats}>
          {/* Süre */}
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#B0B0B0" />
            <AppText style={styles.statText}>{story.tahminiSure}</AppText>
          </View>

          {/* Oyuncu Sayısı */}
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="account-group" size={14} color="#B0B0B0" />
            <AppText style={styles.statText}>{formatPlayerCount(story.oynayanSayisi)}</AppText>
          </View>
        </View>

        {/* Oynat İkonu */}
        <View style={styles.playButton}>
          <MaterialCommunityIcons name="play-circle" size={28} color={difficultyColor} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

StoryCard.displayName = 'StoryCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCompleted: {
    borderColor: '#2E7D32',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpecialElite',
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    fontSize: 12,
    color: '#B0B0B0',
    fontFamily: 'serif',
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
  preview: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'serif',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'SpecialElite',
    letterSpacing: 0.5,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    marginLeft: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#B0B0B0',
    fontFamily: 'serif',
  },
  playButton: {
    marginLeft: 8,
  },
});

export default StoryCard;
