import { getCompletedStories, getUserStats, saveUserStats } from './storageManager';

/**
 * Başarımlar Yöneticisi
 * Achievement/badge sistemi
 */

// Tüm başarımlar
export const ACHIEVEMENTS = {
  first_case: {
    id: 'first_case',
    title: 'İlk Vaka',
    description: 'İlk hikayeni çöz',
    icon: 'trophy',
    color: '#FFD700',
    requirement: (stats) => stats.totalGamesPlayed >= 1,
  },
  speed_demon: {
    id: 'speed_demon',
    title: 'Hız Canavarı',
    description: 'Bir vakayı 5 dakikada çöz',
    icon: 'lightning-bolt',
    color: '#FF6B35',
    requirement: (stats) => stats.fastestTime && stats.fastestTime <= 300,
  },
  no_hints: {
    id: 'no_hints',
    title: 'Aydınlanma',
    description: 'İpucu kullanmadan bir vaka çöz',
    icon: 'lightbulb-on',
    color: '#FFCC80',
    requirement: (stats) => stats.casesWithoutHints >= 1,
  },
  streak_5: {
    id: 'streak_5',
    title: 'Ateş Gibi',
    description: '5 gün üst üste oyna',
    icon: 'fire',
    color: '#FF6B35',
    requirement: (stats) => stats.streak >= 5,
  },
  all_easy: {
    id: 'all_easy',
    title: 'Kolay Uzmanı',
    description: 'Tüm kolay hikayeleri çöz',
    icon: 'check-circle',
    color: '#2E7D32',
    requirement: (stats) => stats.easyCompleted >= 8,
  },
  all_medium: {
    id: 'all_medium',
    title: 'Orta Seviye Dedektif',
    description: 'Tüm orta hikayeleri çöz',
    icon: 'shield-check',
    color: '#F9A825',
    requirement: (stats) => stats.mediumCompleted >= 6,
  },
  all_hard: {
    id: 'all_hard',
    title: 'Efsane Dedektif',
    description: 'Tüm zor hikayeleri çöz',
    icon: 'star',
    color: '#C62828',
    requirement: (stats) => stats.hardCompleted >= 6,
  },
  perfectionist: {
    id: 'perfectionist',
    title: 'Mükemmeliyetçi',
    description: 'Tüm hikayeleri çöz',
    icon: 'crown',
    color: '#FFD700',
    requirement: (stats) => stats.totalGamesPlayed >= 20,
  },
  social_detective: {
    id: 'social_detective',
    title: 'Sosyal Dedektif',
    description: '10 online oyun oyna',
    icon: 'account-group',
    color: '#90CAF9',
    requirement: (stats) => stats.onlineGamesPlayed >= 10,
  },
  hint_master: {
    id: 'hint_master',
    title: 'İpucu Ustası',
    description: '50 ipucu kullan',
    icon: 'lightbulb-group',
    color: '#FFCC80',
    requirement: (stats) => stats.totalHintsUsed >= 50,
  },
  time_lord: {
    id: 'time_lord',
    title: 'Zaman Lordu',
    description: 'Toplam 10 saat oyna',
    icon: 'clock',
    color: '#90CAF9',
    requirement: (stats) => stats.totalTimePlayed >= 36000, // 10 saat = 36000 saniye
  },
  question_master: {
    id: 'question_master',
    title: 'Soru Ustası',
    description: '100 soru sor',
    icon: 'comment-question',
    color: '#A5D6A7',
    requirement: (stats) => stats.totalQuestionsAsked >= 100,
  },
};

/**
 * Kullanıcının başarımlarını kontrol et
 */
export const checkAchievements = async () => {
  try {
    const userStats = await getUserStats();
    const completedStories = await getCompletedStories();
    
    // İstatistikleri hesapla
    const stats = {
      totalGamesPlayed: completedStories.length,
      fastestTime: userStats.fastestTime || null,
      casesWithoutHints: userStats.casesWithoutHints || 0,
      streak: userStats.streak || 0,
      easyCompleted: completedStories.filter(id => id >= 101 && id <= 108).length,
      mediumCompleted: completedStories.filter(id => id >= 201 && id <= 206).length,
      hardCompleted: completedStories.filter(id => id >= 301 && id <= 306).length,
      onlineGamesPlayed: userStats.onlineGamesPlayed || 0,
      totalHintsUsed: userStats.totalHintsUsed || 0,
      totalTimePlayed: userStats.totalTimePlayed || 0,
      totalQuestionsAsked: userStats.totalQuestionsAsked || 0,
    };

    // Yeni kazanılan başarımlar
    const newAchievements = [];
    const unlockedAchievements = userStats.achievements || [];

    for (const achievement of Object.values(ACHIEVEMENTS)) {
      // Zaten kazanılmışsa atla
      if (unlockedAchievements.includes(achievement.id)) continue;

      // Şartı kontrol et
      if (achievement.requirement(stats)) {
        newAchievements.push(achievement);
        unlockedAchievements.push(achievement.id);
      }
    }

    // Yeni başarımlar varsa kaydet
    if (newAchievements.length > 0) {
      await saveUserStats({
        ...userStats,
        achievements: unlockedAchievements,
      });
    }

    return newAchievements;
  } catch (error) {
    console.error('checkAchievements error:', error);
    return [];
  }
};

/**
 * Kullanıcının tüm başarımlarını getir
 */
export const getUserAchievements = async () => {
  try {
    const userStats = await getUserStats();
    const unlockedIds = userStats.achievements || [];

    return Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id),
    }));
  } catch (error) {
    console.error('getUserAchievements error:', error);
    return [];
  }
};

/**
 * Başarım yüzdesini hesapla
 */
export const getAchievementProgress = async () => {
  try {
    const userStats = await getUserStats();
    const unlockedIds = userStats.achievements || [];
    const total = Object.keys(ACHIEVEMENTS).length;
    const unlocked = unlockedIds.length;
    
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
    };
  } catch (error) {
    console.error('getAchievementProgress error:', error);
    return { unlocked: 0, total: 0, percentage: 0 };
  }
};
