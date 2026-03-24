#!/usr/bin/env node

/**
 * Firebase Direkt Test
 * Gerçek Firebase config ile test eder
 */

const https = require('https');

const FIREBASE_URL = 'https://dedektif-oyunu-36e13-default-rtdb.europe-west1.firebasedatabase.app';

console.log('🔥 Firebase Direkt Test Başlıyor...\n');
console.log('📍 URL:', FIREBASE_URL);
console.log('');

// Test 1: Root okuma
console.log('📖 Test 1: Root okuma testi...');
https.get(`${FIREBASE_URL}/.json`, (res) => {
  console.log('   Status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('   ✅ Root okuma başarılı');
      console.log('   Data:', data.substring(0, 100) + '...');
    } else if (res.statusCode === 401) {
      console.log('   ❌ 401 Unauthorized - Rules aktif değil veya okuma izni yok');
    } else if (res.statusCode === 404) {
      console.log('   ⚠️  404 Not Found - Database henüz oluşturulmamış');
    } else {
      console.log('   ⚠️  Beklenmeyen status:', res.statusCode);
    }
    console.log('');
    
    // Test 2: /rooms okuma
    console.log('📖 Test 2: /rooms okuma testi...');
    https.get(`${FIREBASE_URL}/rooms.json`, (res2) => {
      console.log('   Status:', res2.statusCode);
      
      let data2 = '';
      res2.on('data', (chunk) => {
        data2 += chunk;
      });
      
      res2.on('end', () => {
        if (res2.statusCode === 200) {
          console.log('   ✅ /rooms okuma başarılı');
          console.log('   Data:', data2.substring(0, 100) + '...');
          console.log('');
          console.log('🎉 Firebase Rules aktif ve çalışıyor!');
        } else if (res2.statusCode === 401) {
          console.log('   ❌ 401 Unauthorized');
          console.log('');
          console.log('❌ Firebase Rules aktif değil!');
          console.log('');
          console.log('Yapılacaklar:');
          console.log('1. Firebase Console\'a git: https://console.firebase.google.com/');
          console.log('2. Proje seç: dedektif-oyunu-36e13');
          console.log('3. Build → Realtime Database → Rules');
          console.log('4. firebase.rules.json içeriğini yapıştır');
          console.log('5. Publish butonuna tıkla');
          console.log('6. 10 saniye bekle');
          console.log('7. Bu scripti tekrar çalıştır');
        } else if (res2.statusCode === 404) {
          console.log('   ⚠️  404 Not Found - /rooms node\'u yok (normal olabilir)');
          console.log('');
          console.log('💡 Database boş ama rules aktif olabilir.');
          console.log('   Uygulamada oda oluşturmayı dene.');
        } else {
          console.log('   ⚠️  Beklenmeyen status:', res2.statusCode);
        }
      });
    }).on('error', (e) => {
      console.error('   ❌ Hata:', e.message);
    });
  });
}).on('error', (e) => {
  console.error('❌ Bağlantı hatası:', e.message);
  console.log('\n💡 İnternet bağlantınızı kontrol edin\n');
});
