#!/usr/bin/env node

/**
 * Firebase Rules Kontrol Scripti
 * 
 * Bu script Firebase rules'unun aktif olup olmadığını kontrol eder
 */

const https = require('https');

const FIREBASE_URL = 'https://dedektif-oyunu-36e13-default-rtdb.europe-west1.firebasedatabase.app';

console.log('🔥 Firebase Rules Kontrolü Başlıyor...\n');

// Test 1: Okuma izni
console.log('📖 Test 1: Okuma izni kontrol ediliyor...');
https.get(`${FIREBASE_URL}/rooms.json`, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Okuma izni çalışıyor\n');
    
    // Test 2: Yazma izni (başarısız olmalı - güvenlik için)
    console.log('✍️  Test 2: Yazma izni kontrol ediliyor...');
    const data = JSON.stringify({
      test: 'unauthorized'
    });
    
    const options = {
      hostname: 'dedektif-oyunu-36e13-default-rtdb.europe-west1.firebasedatabase.app',
      path: '/rooms/test-unauthorized.json',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        console.log('✅ Yazma koruması çalışıyor (yetkisiz yazma engellendi)\n');
        console.log('🎉 Firebase Rules başarıyla aktif!\n');
        console.log('📝 Sonraki adımlar:');
        console.log('   1. Uygulamada online mod\'u test et');
        console.log('   2. Oda oluştur ve katıl');
        console.log('   3. Mesaj gönder ve oyunu oyna\n');
      } else {
        console.log('⚠️  Uyarı: Yazma koruması çalışmıyor olabilir');
        console.log(`   Status: ${res.statusCode}\n`);
      }
    });
    
    req.on('error', (e) => {
      console.error('❌ Hata:', e.message);
    });
    
    req.write(data);
    req.end();
    
  } else {
    console.log('❌ Okuma izni çalışmıyor');
    console.log(`   Status: ${res.statusCode}\n`);
    console.log('💡 Çözüm: FIREBASE_SETUP.md dosyasını takip et\n');
  }
}).on('error', (e) => {
  console.error('❌ Bağlantı hatası:', e.message);
  console.log('\n💡 İnternet bağlantınızı kontrol edin\n');
});
