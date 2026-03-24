import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Manager
 * AsyncStorage ile veri yönetimi
 */

// Storage Keys
const KEYS = {
  COMPLETED_STORIES: '@completed_stories',
  FAVORITE_STORIES: '@favorite_stories',
  STORY_STATS: '@story_stats',
  USER_STATS: '@user_stats',
  SETTINGS: '@settings',
};

// ============================================================
// TAMAMLANAN HİKAYELER
// ============================================================

/**
 * Tamamlanan hikayeleri al
 * @returns {Promise<Array>} Tamamlanan hikaye ID'leri [101, 102, ...]
 */
export const getCompletedStories = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.COMPLETED_STORIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('getCompletedStories error:', error);
    return [];
  }
};

/**
 * Hikayeyi tamamlandı olarak işaretle
 * @param {number} storyId - Hikaye ID
 * @param {Object} stats - Oyun istatistikleri { time, hintsUsed, difficulty }
 */
export const markStoryCompleted = async (storyId, stats = {}) => {
  try {
    const completed = await getCompletedStories();
    
    // Zaten tamamlanmışsa ekleme
    if (!completed.includes(storyId)) {
      completed.push(storyId);
      await AsyncStorage.setItem(KEYS.COMPLETED_STORIES, JSON.stringify(completed));
    }
    
    // İstatistikleri kaydet
    if (stats) {
      await saveStoryStats(storyId, stats);
    }
    
    return true;
  } catch (error) {
    console.error('markStoryCompleted error:', error);
    return false;
  }
};

/**
 * Hikayenin tamamlanma durumunu kontrol et
 * @param {number} storyId - Hikaye ID
 * @returns {Promise<boolean>}
 */
export const isStoryCompleted = async (storyId) => {
  try {
    const completed = await getCompletedStories();
    return completed.includes(storyId);
  } catch (error) {
    console.error('isStoryCompleted error:', error);
    return false;
  }
};

/**
 * Tamamlanma durumunu sıfırla (hikayeyi tekrar oynamak için)
 * @param {number} storyId - Hikaye ID
 */
export const resetStoryCompletion = async (storyId) => {
  try {
    const completed = await getCompletedStories();
    const filtered = completed.filter(id => id !== storyId);
    await AsyncStorage.setItem(KEYS.COMPLETED_STORIES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('resetStoryCompletion error:', error);
    return false;
  }
};

// ============================================================
// FAVORİ HİKAYELER
// ============================================================

/**
 * Favori hikayeleri al
 * @returns {Promise<Array>} Favori hikaye ID'leri [101, 103, ...]
 */
export const getFavoriteStories = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAVORITE_STORIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('getFavoriteStories error:', error);
    return [];
  }
};

/**
 * Hikayeyi favorilere ekle/çıkar (toggle)
 * @param {number} storyId - Hikaye ID
 * @returns {Promise<boolean>} Yeni durum (true = favoride, false = değil)
 */
export const toggleFavoriteStory = async (storyId) => {
  try {
    const favorites = await getFavoriteStories();
    const index = favorites.indexOf(storyId);
    
    if (index > -1) {
      // Favorilerden çıkar
      favorites.splice(index, 1);
      await AsyncStorage.setItem(KEYS.FAVORITE_STORIES, JSON.stringify(favorites));
      return false;
    } else {
      // Favorilere ekle
      favorites.push(storyId);
      await AsyncStorage.setItem(KEYS.FAVORITE_STORIES, JSON.stringify(favorites));
      return true;
    }
  } catch (error) {
    console.error('toggleFavoriteStory error:', error);
    return false;
  }
};

/**
 * Hikayenin favori durumunu kontrol et
 * @param {number} storyId - Hikaye ID
 * @returns {Promise<boolean>}
 */
export const isStoryFavorite = async (storyId) => {
  try {
    const favorites = await getFavoriteStories();
    return favorites.includes(storyId);
  } catch (error) {
    console.error('isStoryFavorite error:', error);
    return false;
  }
};

// ============================================================
// HİKAYE İSTATİSTİKLERİ
// ============================================================

/**
 * Hikaye istatistiklerini kaydet
 * @param {number} storyId - Hikaye ID
 * @param {Object} stats - { time, hintsUsed, difficulty, completedAt }
 */
export const saveStoryStats = async (storyId, stats) => {
  try {
    const allStats = await getAllStoryStats();
    
    // Hikaye için istatistik yoksa oluştur
    if (!allStats[storyId]) {
      allStats[storyId] = {
        playCount: 0,
        completions: [],
        bestTime: null,
        totalHintsUsed: 0,
      };
    }
    
    // Yeni tamamlama ekle
    allStats[storyId].playCount += 1;
    allStats[storyId].completions.push({
      time: stats.time,
      hintsUsed: stats.hintsUsed || 0,
      difficulty: stats.difficulty,
      completedAt: stats.completedAt || Date.now(),
    });
    
    // En iyi süreyi güncelle
    if (!allStats[storyId].bestTime || stats.time < allStats[storyId].bestTime) {
      allStats[storyId].bestTime = stats.time;
    }
    
    // Toplam ipucu sayısı
    allStats[storyId].totalHintsUsed += (stats.hintsUsed || 0);
    
    await AsyncStorage.setItem(KEYS.STORY_STATS, JSON.stringify(allStats));
    
    // Kullanıcı genel istatistiklerini güncelle
    await updateUserStats(stats);
    
    return true;
  } catch (error) {
    console.error('saveStoryStats error:', error);
    return false;
  }
};

/**
 * Tüm hikaye istatistiklerini al
 * @returns {Promise<Object>} { 101: { playCount, completions, bestTime }, ... }
 */
export const getAllStoryStats = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.STORY_STATS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('getAllStoryStats error:', error);
    return {};
  }
};

/**
 * Belirli bir hikayenin istatistiklerini al
 * @param {number} storyId - Hikaye ID
 * @returns {Promise<Object|null>}
 */
export const getStoryStats = async (storyId) => {
  try {
    const allStats = await getAllStoryStats();
    return allStats[storyId] || null;
  } catch (error) {
    console.error('getStoryStats error:', error);
    return null;
  }
};

// ============================================================
// KULLANICI GENEL İSTATİSTİKLERİ
// ============================================================

/**
 * Kullanıcı genel istatistiklerini al
 * @returns {Promise<Object>}
 */
export const getUserStats = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_STATS);
    return data ? JSON.parse(data) : {
      totalGamesPlayed: 0,
      totalGamesCompleted: 0,
      totalTimePlayed: 0,
      totalHintsUsed: 0,
      averageTime: 0,
      streak: 0,
      lastPlayedDate: null,
      achievements: [],
    };
  } catch (error) {
    console.error('getUserStats error:', error);
    return {};
  }
};

/**
 * Kullanıcı istatistiklerini güncelle
 * @param {Object} gameStats - { time, hintsUsed, difficulty }
 */
export const updateUserStats = async (gameStats) => {
  try {
    const stats = await getUserStats();
    
    stats.totalGamesPlayed += 1;
    stats.totalGamesCompleted += 1;
    stats.totalTimePlayed += gameStats.time || 0;
    stats.totalHintsUsed += gameStats.hintsUsed || 0;
    stats.averageTime = Math.floor(stats.totalTimePlayed / stats.totalGamesCompleted);
    
    // Streak hesapla (günlük)
    const today = new Date().toDateString();
    const lastPlayed = stats.lastPlayedDate ? new Date(stats.lastPlayedDate).toDateString() : null;
    
    if (lastPlayed === today) {
      // Bugün zaten oynamış
    } else if (lastPlayed === new Date(Date.now() - 86400000).toDateString()) {
      // Dün oynamış, streak devam ediyor
      stats.streak += 1;
    } else {
      // Streak kırıldı
      stats.streak = 1;
    }
    
    stats.lastPlayedDate = Date.now();
    
    await AsyncStorage.setItem(KEYS.USER_STATS, JSON.stringify(stats));
    
    // Başarımları kontrol et
    await checkAchievements(stats);
    
    return true;
  } catch (error) {
    console.error('updateUserStats error:', error);
    return false;
  }
};

// ============================================================
// BAŞARIMLAR
// ============================================================

/**
 * Başarımları kontrol et ve kilidi aç
 * @param {Object} stats - Kullanıcı istatistikleri
 */
export const checkAchievements = async (stats) => {
  try {
    const achievements = [
      { id: 'first_case', name: 'İlk Vaka', condition: stats.totalGamesCompleted >= 1 },
      { id: 'fire_streak', name: 'Ateş Gibi', condition: stats.streak >= 5 },
      { id: 'speed_demon', name: 'Hızlı Dedektif', condition: stats.averageTime < 300 }, // 5 dakika
      { id: 'perfectionist', name: 'Mükemmellik', condition: stats.totalGamesCompleted >= 20 },
      { id: 'no_hints', name: 'Aydınlanma', condition: false }, // Özel kontrol gerekli
    ];
    
    const unlockedAchievements = achievements.filter(a => a.condition && !stats.achievements.includes(a.id));
    
    if (unlockedAchievements.length > 0) {
      unlockedAchievements.forEach(a => {
        if (!stats.achievements.includes(a.id)) {
          stats.achievements.push(a.id);
        }
      });
      
      await AsyncStorage.setItem(KEYS.USER_STATS, JSON.stringify(stats));
      
      return unlockedAchievements;
    }
    
    return [];
  } catch (error) {
    console.error('checkAchievements error:', error);
    return [];
  }
};

// ============================================================
// YARDIMCI FONKSİYONLAR
// ============================================================

/**
 * Tüm verileri sıfırla (dikkatli kullan!)
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.COMPLETED_STORIES,
      KEYS.FAVORITE_STORIES,
      KEYS.STORY_STATS,
      KEYS.USER_STATS,
      // KEYS.SETTINGS, // Ayarları silme
    ]);
    return true;
  } catch (error) {
    console.error('clearAllData error:', error);
    return false;
  }
};

/**
 * Tüm verileri dışa aktar (yedekleme)
 * @returns {Promise<Object>}
 */
export const exportAllData = async () => {
  try {
    const [completed, favorites, storyStats, userStats] = await Promise.all([
      getCompletedStories(),
      getFavoriteStories(),
      getAllStoryStats(),
      getUserStats(),
    ]);
    
    return {
      completed,
      favorites,
      storyStats,
      userStats,
      exportedAt: Date.now(),
    };
  } catch (error) {
    console.error('exportAllData error:', error);
    return null;
  }
};

/**
 * Verileri içe aktar (geri yükleme)
 * @param {Object} data - Export edilen veri
 */
export const importAllData = async (data) => {
  try {
    if (data.completed) {
      await AsyncStorage.setItem(KEYS.COMPLETED_STORIES, JSON.stringify(data.completed));
    }
    if (data.favorites) {
      await AsyncStorage.setItem(KEYS.FAVORITE_STORIES, JSON.stringify(data.favorites));
    }
    if (data.storyStats) {
      await AsyncStorage.setItem(KEYS.STORY_STATS, JSON.stringify(data.storyStats));
    }
    if (data.userStats) {
      await AsyncStorage.setItem(KEYS.USER_STATS, JSON.stringify(data.userStats));
    }
    return true;
  } catch (error) {
    console.error('importAllData error:', error);
    return false;
  }
};


// ============================================================
// AYARLAR
// ============================================================

/**
 * Ayarları al
 * @returns {Promise<Object>} Kullanıcı ayarları
 */
export const getSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.7,
      vibrationEnabled: true,
      darkMode: true,
      language: 'tr',
      fontSize: 'medium',
      showTimer: true,
      hintLimit: 'unlimited',
      notificationsEnabled: true,
    };
  } catch (error) {
    console.error('getSettings error:', error);
    return {};
  }
};

/**
 * Ayarları kaydet
 * @param {Object} settings - Ayarlar objesi
 */
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('saveSettings error:', error);
    return false;
  }
};

/**
 * Belirli bir ayarı güncelle
 * @param {string} key - Ayar anahtarı
 * @param {any} value - Yeni değer
 */
export const updateSetting = async (key, value) => {
  try {
    const settings = await getSettings();
    settings[key] = value;
    await saveSettings(settings);
    return true;
  } catch (error) {
    console.error('updateSetting error:', error);
    return false;
  }
};
