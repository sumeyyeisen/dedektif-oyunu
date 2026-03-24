#!/usr/bin/env node

/**
 * Hikaye Test Script'i
 * Hikayelerin kalitesini ve tutarlılığını kontrol eder
 */

const fs = require('fs');
const path = require('path');

console.log('📚 Hikaye Kalite Testleri Başlatılıyor...\n');

let passCount = 0;
let failCount = 0;
const issues = [];

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passCount++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Hata: ${error.message}`);
    failCount++;
    issues.push({ test: name, error: error.message });
  }
}

// Hikaye dosyalarını oku
function getStoryFiles(difficulty) {
  const dir = path.join(__dirname, '..', 'src/data/stories', difficulty);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'TEMPLATE.json');
}

// Hikaye içeriğini kontrol et
function validateStory(filePath, storyId) {
  const content = fs.readFileSync(filePath, 'utf8');
  const story = JSON.parse(content);
  
  // Zorunlu alanlar
  if (!story.id) throw new Error('id eksik');
  if (!story.baslik) throw new Error('baslik eksik');
  if (!story.baslangic) throw new Error('baslangic eksik');
  if (!story.cevap) throw new Error('cevap eksik');
  if (!story.ipuclari || !Array.isArray(story.ipuclari)) throw new Error('ipuclari eksik veya array değil');
  if (!story.sorular || typeof story.sorular !== 'object') throw new Error('sorular eksik veya object değil');
  
  // ID kontrolü
  if (story.id !== storyId) throw new Error(`ID uyuşmuyor: ${story.id} !== ${storyId}`);
  
  // İpucu sayısı
  if (story.ipuclari.length < 3) throw new Error(`Çok az ipucu: ${story.ipuclari.length}`);
  
  // Soru sayısı
  const soruSayisi = Object.keys(story.sorular).length;
  if (soruSayisi < 5) throw new Error(`Çok az soru: ${soruSayisi}`);
  
  // Her sorunun keywords ve answer'ı var mı?
  for (const [key, soru] of Object.entries(story.sorular)) {
    if (!soru.keywords || !Array.isArray(soru.keywords)) {
      throw new Error(`${key} sorusunda keywords eksik`);
    }
    if (!soru.answer) {
      throw new Error(`${key} sorusunda answer eksik`);
    }
    if (soru.keywords.length === 0) {
      throw new Error(`${key} sorusunda keyword yok`);
    }
  }
  
  return story;
}

console.log('📊 1. Hikaye Sayısı Kontrolleri\n');

const kolayFiles = getStoryFiles('kolay');
const ortaFiles = getStoryFiles('orta');
const zorFiles = getStoryFiles('zor');

test(`Kolay seviye: ${kolayFiles.length} hikaye (beklenen: 18)`, () => {
  if (kolayFiles.length !== 18) {
    throw new Error(`${kolayFiles.length} hikaye bulundu, 18 olmalı`);
  }
});

test(`Orta seviye: ${ortaFiles.length} hikaye (beklenen: 10)`, () => {
  if (ortaFiles.length !== 10) {
    throw new Error(`${ortaFiles.length} hikaye bulundu, 10 olmalı`);
  }
});

test(`Zor seviye: ${zorFiles.length} hikaye (beklenen: 6)`, () => {
  if (zorFiles.length !== 6) {
    throw new Error(`${zorFiles.length} hikaye bulundu, 6 olmalı`);
  }
});

const totalStories = kolayFiles.length + ortaFiles.length + zorFiles.length;
test(`Toplam: ${totalStories} hikaye (beklenen: 34)`, () => {
  if (totalStories !== 34) {
    throw new Error(`${totalStories} hikaye bulundu, 34 olmalı`);
  }
});

console.log('\n🔍 2. Hikaye İçerik Kontrolleri\n');

// Kolay hikayeleri kontrol et
kolayFiles.forEach(file => {
  const id = parseInt(file.split('-')[0]);
  const filePath = path.join(__dirname, '..', 'src/data/stories/kolay', file);
  test(`Kolay ${id}: ${file}`, () => {
    validateStory(filePath, id);
  });
});

// Orta hikayeleri kontrol et
ortaFiles.forEach(file => {
  const id = parseInt(file.split('-')[0]);
  const filePath = path.join(__dirname, '..', 'src/data/stories/orta', file);
  test(`Orta ${id}: ${file}`, () => {
    validateStory(filePath, id);
  });
});

// Zor hikayeleri kontrol et
zorFiles.forEach(file => {
  const id = parseInt(file.split('-')[0]);
  const filePath = path.join(__dirname, '..', 'src/data/stories/zor', file);
  test(`Zor ${id}: ${file}`, () => {
    validateStory(filePath, id);
  });
});

console.log('\n📝 3. Kalite Kontrolleri\n');

// Tüm hikayeleri oku ve analiz et
const allStories = [];
['kolay', 'orta', 'zor'].forEach(difficulty => {
  const files = getStoryFiles(difficulty);
  files.forEach(file => {
    const filePath = path.join(__dirname, '..', 'src/data/stories', difficulty, file);
    try {
      const story = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      allStories.push({ ...story, difficulty });
    } catch (e) {
      // Zaten yukarıda kontrol edildi
    }
  });
});

test('Tüm hikaye ID\'leri benzersiz', () => {
  const ids = allStories.map(s => s.id);
  const uniqueIds = [...new Set(ids)];
  if (ids.length !== uniqueIds.length) {
    throw new Error('Duplicate ID bulundu');
  }
});

test('Tüm hikaye başlıkları benzersiz', () => {
  const basliklar = allStories.map(s => s.baslik);
  const uniqueBasliklar = [...new Set(basliklar)];
  if (basliklar.length !== uniqueBasliklar.length) {
    throw new Error('Duplicate başlık bulundu');
  }
});

test('Ortalama ipucu sayısı >= 3', () => {
  const avgIpucu = allStories.reduce((sum, s) => sum + s.ipuclari.length, 0) / allStories.length;
  if (avgIpucu < 3) {
    throw new Error(`Ortalama ipucu: ${avgIpucu.toFixed(1)}`);
  }
});

test('Ortalama soru sayısı >= 5', () => {
  const avgSoru = allStories.reduce((sum, s) => sum + Object.keys(s.sorular).length, 0) / allStories.length;
  if (avgSoru < 5) {
    throw new Error(`Ortalama soru: ${avgSoru.toFixed(1)}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n📈 Test Sonuçları:`);
console.log(`   ✅ Başarılı: ${passCount}`);
console.log(`   ❌ Başarısız: ${failCount}`);
console.log(`   📊 Toplam: ${passCount + failCount}`);
console.log(`   🎯 Başarı Oranı: ${Math.round((passCount / (passCount + failCount)) * 100)}%\n`);

if (failCount > 0) {
  console.log('⚠️  Bazı testler başarısız oldu:\n');
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue.test}`);
    console.log(`   ${issue.error}\n`);
  });
  process.exit(1);
} else {
  console.log('🎉 Tüm hikaye testleri başarılı!\n');
  console.log(`📚 Toplam ${totalStories} kaliteli hikaye hazır.\n`);
  process.exit(0);
}
