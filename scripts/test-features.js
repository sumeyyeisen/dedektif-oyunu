#!/usr/bin/env node

/**
 * Özellik Test Script'i
 * Yeni eklenen özelliklerin temel kontrollerini yapar
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Özellik Testleri Başlatılıyor...\n');

let passCount = 0;
let failCount = 0;

// Test fonksiyonu
function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passCount++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Hata: ${error.message}`);
    failCount++;
  }
}

// Dosya varlık kontrolü
function fileExists(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Dosya bulunamadı: ${filePath}`);
  }
}

// Dosya içerik kontrolü
function fileContains(filePath, searchText) {
  const fullPath = path.join(__dirname, '..', filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes(searchText)) {
    throw new Error(`"${searchText}" bulunamadı`);
  }
}

// Import kontrolü
function hasImport(filePath, importName) {
  const fullPath = path.join(__dirname, '..', filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const importRegex = new RegExp(`import.*${importName}.*from`, 'i');
  if (!importRegex.test(content)) {
    throw new Error(`"${importName}" import edilmemiş`);
  }
}

console.log('📦 1. Paket Kontrolleri\n');

test('expo-av paketi kurulu', () => {
  const packageJson = require('../package.json');
  if (!packageJson.dependencies['expo-av']) {
    throw new Error('expo-av paketi bulunamadı');
  }
});

test('react-native-confetti-cannon paketi kurulu', () => {
  const packageJson = require('../package.json');
  if (!packageJson.dependencies['react-native-confetti-cannon']) {
    throw new Error('react-native-confetti-cannon paketi bulunamadı');
  }
});

console.log('\n📁 2. Dosya Varlık Kontrolleri\n');

test('soundManager.js mevcut', () => {
  fileExists('src/shared/utils/soundManager.js');
});

test('achievementManager.js mevcut', () => {
  fileExists('src/shared/utils/achievementManager.js');
});

test('AchievementsScreen.jsx mevcut', () => {
  fileExists('src/features/achievements/components/AchievementsScreen.jsx');
});

test('AchievementNotification.jsx mevcut', () => {
  fileExists('src/shared/components/AchievementNotification.jsx');
});

test('NotesPanel.jsx mevcut', () => {
  fileExists('src/features/game/components/NotesPanel.jsx');
});

test('QuestionHistoryPanel.jsx mevcut', () => {
  fileExists('src/features/game/components/QuestionHistoryPanel.jsx');
});

console.log('\n🔗 3. Import Kontrolleri\n');

test('DetectiveGame - ConfettiCannon import', () => {
  hasImport('DetectiveGame.jsx', 'ConfettiCannon');
});

test('DetectiveGame - AchievementsScreen import', () => {
  hasImport('DetectiveGame.jsx', 'AchievementsScreen');
});

test('DetectiveGame - soundManager import', () => {
  hasImport('DetectiveGame.jsx', 'playSuccessSound');
});

test('DetectiveGame - achievementManager import', () => {
  hasImport('DetectiveGame.jsx', 'checkAchievements');
});

test('StorySelectionScreen - ActivityIndicator import', () => {
  hasImport('src/features/game/components/StorySelectionScreen.jsx', 'ActivityIndicator');
});

console.log('\n🎯 4. Özellik Kontrolleri\n');

test('soundManager - playSuccessSound fonksiyonu', () => {
  fileContains('src/shared/utils/soundManager.js', 'export const playSuccessSound');
});

test('soundManager - playErrorSound fonksiyonu', () => {
  fileContains('src/shared/utils/soundManager.js', 'export const playErrorSound');
});

test('soundManager - playHintSound fonksiyonu', () => {
  fileContains('src/shared/utils/soundManager.js', 'export const playHintSound');
});

test('achievementManager - 12 başarı tanımlı', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'src/shared/utils/achievementManager.js'), 'utf8');
  const achievementCount = (content.match(/id: '/g) || []).length;
  if (achievementCount < 12) {
    throw new Error(`Sadece ${achievementCount} başarı bulundu, 12 olmalı`);
  }
});

test('DetectiveGame - confettiRef tanımlı', () => {
  fileContains('DetectiveGame.jsx', 'confettiRef');
});

test('DetectiveGame - showNotesPanel state', () => {
  fileContains('DetectiveGame.jsx', 'showNotesPanel');
});

test('DetectiveGame - showHistoryPanel state', () => {
  fileContains('DetectiveGame.jsx', 'showHistoryPanel');
});

test('DetectiveGame - newAchievement state', () => {
  fileContains('DetectiveGame.jsx', 'newAchievement');
});

test('AchievementsScreen - "Başarılarım" başlığı', () => {
  fileContains('src/features/achievements/components/AchievementsScreen.jsx', 'Başarılarım');
});

test('AchievementNotification - "Başarı Kazanıldı" metni', () => {
  fileContains('src/shared/components/AchievementNotification.jsx', 'Başarı Kazanıldı');
});

console.log('\n📊 5. Entegrasyon Kontrolleri\n');

test('DetectiveGame - checkAnswer ses entegrasyonu', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'DetectiveGame.jsx'), 'utf8');
  if (!content.includes('playSuccessSound') || !content.includes('playErrorSound')) {
    throw new Error('checkAnswer fonksiyonunda ses entegrasyonu eksik');
  }
});

test('DetectiveGame - başarım kontrolü entegrasyonu', () => {
  fileContains('DetectiveGame.jsx', 'checkAchievements');
});

test('DetectiveGame - confetti entegrasyonu', () => {
  fileContains('DetectiveGame.jsx', 'confettiRef.current.start');
});

test('DetectiveGame - NotesPanel render', () => {
  fileContains('DetectiveGame.jsx', '<NotesPanel');
});

test('DetectiveGame - QuestionHistoryPanel render', () => {
  fileContains('DetectiveGame.jsx', '<QuestionHistoryPanel');
});

test('DetectiveGame - AchievementNotification render', () => {
  fileContains('DetectiveGame.jsx', '<AchievementNotification');
});

test('DetectiveGame - achievements game state', () => {
  fileContains('DetectiveGame.jsx', "gameState === 'achievements'");
});

console.log('\n' + '='.repeat(50));
console.log(`\n📈 Test Sonuçları:`);
console.log(`   ✅ Başarılı: ${passCount}`);
console.log(`   ❌ Başarısız: ${failCount}`);
console.log(`   📊 Toplam: ${passCount + failCount}`);
console.log(`   🎯 Başarı Oranı: ${Math.round((passCount / (passCount + failCount)) * 100)}%\n`);

if (failCount > 0) {
  console.log('⚠️  Bazı testler başarısız oldu. Lütfen hataları kontrol edin.\n');
  process.exit(1);
} else {
  console.log('🎉 Tüm testler başarılı! Özellikler doğru şekilde entegre edilmiş.\n');
  process.exit(0);
}
