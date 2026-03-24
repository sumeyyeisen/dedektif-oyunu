import { Audio } from 'expo-av';
import { getSettings } from './storageManager';

/**
 * Ses Yöneticisi
 * Oyun içi ses efektlerini yönetir
 */

let soundEnabled = true;
let vibrationEnabled = true;
let soundVolume = 0.7;

// Ses objeleri cache
const soundCache = {};

/**
 * Ayarları yükle
 */
export const loadSoundSettings = async () => {
  try {
    const settings = await getSettings();
    soundEnabled = settings?.soundEnabled !== false;
    vibrationEnabled = settings?.vibrationEnabled !== false;
    soundVolume = settings?.soundVolume || 0.7;
  } catch (error) {
    console.error('loadSoundSettings error:', error);
  }
};

/**
 * Ses ayarlarını güncelle
 */
export const updateSoundSettings = (settings) => {
  if (settings.soundEnabled !== undefined) soundEnabled = settings.soundEnabled;
  if (settings.vibrationEnabled !== undefined) vibrationEnabled = settings.vibrationEnabled;
  if (settings.soundVolume !== undefined) soundVolume = settings.soundVolume;
};

/**
 * Ses çal
 */
export const playSound = async (soundType) => {
  if (!soundEnabled) return;

  try {
    // Ses dosyası URL'leri (ücretsiz ses efektleri)
    const soundUrls = {
      correct: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Başarı sesi
      wrong: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3', // Hata sesi
      hint: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Bildirim sesi
      message: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3', // Mesaj sesi
      achievement: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Başarım sesi
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Tıklama sesi
    };

    const url = soundUrls[soundType];
    if (!url) return;

    // Cache'den kontrol et
    if (soundCache[soundType]) {
      const { sound } = soundCache[soundType];
      await sound.replayAsync();
      return;
    }

    // Yeni ses yükle
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, volume: soundVolume }
    );

    // Cache'e ekle
    soundCache[soundType] = { sound };

    // Ses bitince unload et
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
        delete soundCache[soundType];
      }
    });
  } catch (error) {
    console.error('playSound error:', error);
  }
};

/**
 * Titreşim
 */
export const vibrate = async (pattern = [0, 100]) => {
  if (!vibrationEnabled) return;

  try {
    const { Vibration } = await import('react-native');
    Vibration.vibrate(pattern);
  } catch (error) {
    console.error('vibrate error:', error);
  }
};

/**
 * Başarı sesi + titreşim
 */
export const playSuccessSound = async () => {
  await playSound('correct');
  await vibrate([0, 100, 50, 100]);
};

/**
 * Hata sesi + titreşim
 */
export const playErrorSound = async () => {
  await playSound('wrong');
  await vibrate([0, 200]);
};

/**
 * İpucu sesi
 */
export const playHintSound = async () => {
  await playSound('hint');
};

/**
 * Mesaj sesi
 */
export const playMessageSound = async () => {
  await playSound('message');
};

/**
 * Başarım sesi
 */
export const playAchievementSound = async () => {
  await playSound('achievement');
  await vibrate([0, 100, 50, 100, 50, 100]);
};

/**
 * Tıklama sesi
 */
export const playClickSound = async () => {
  await playSound('click');
};

/**
 * Tüm sesleri temizle
 */
export const clearSoundCache = async () => {
  try {
    for (const key in soundCache) {
      const { sound } = soundCache[key];
      await sound.unloadAsync();
    }
    Object.keys(soundCache).forEach(key => delete soundCache[key]);
  } catch (error) {
    console.error('clearSoundCache error:', error);
  }
};

// Uygulama başlarken ayarları yükle
loadSoundSettings();
