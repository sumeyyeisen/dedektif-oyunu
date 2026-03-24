# 🧪 Test Komutları

## Otomatik Test Yöntemleri

Manuel test dışında, kodun doğruluğunu kontrol etmek için 4 farklı otomatik test yöntemi var:

---

## 1. 🎯 Özellik Testleri (En Kapsamlı)

Yeni eklenen tüm özelliklerin doğru entegre edilip edilmediğini kontrol eder.

```bash
npm run test:features
```

### Ne Kontrol Eder?

✅ **Paket Kontrolleri** (2 test)
- expo-av kurulu mu?
- react-native-confetti-cannon kurulu mu?

✅ **Dosya Varlık Kontrolleri** (6 test)
- soundManager.js
- achievementManager.js
- AchievementsScreen.jsx
- AchievementNotification.jsx
- NotesPanel.jsx
- QuestionHistoryPanel.jsx

✅ **Import Kontrolleri** (5 test)
- ConfettiCannon import edilmiş mi?
- AchievementsScreen import edilmiş mi?
- soundManager fonksiyonları import edilmiş mi?
- achievementManager import edilmiş mi?
- ActivityIndicator import edilmiş mi?

✅ **Özellik Kontrolleri** (10 test)
- Ses fonksiyonları tanımlı mı?
- 12 başarı tanımlı mı?
- State'ler doğru mu?
- Türkçe metinler doğru mu?

✅ **Entegrasyon Kontrolleri** (7 test)
- Ses entegrasyonu yapılmış mı?
- Başarım kontrolü entegre mi?
- Confetti entegre mi?
- Paneller render ediliyor mu?

**Toplam: 30 Test**

### Çıktı Örneği:
```
🧪 Özellik Testleri Başlatılıyor...

📦 1. Paket Kontrolleri
✅ expo-av paketi kurulu
✅ react-native-confetti-cannon paketi kurulu

📁 2. Dosya Varlık Kontrolleri
✅ soundManager.js mevcut
✅ achievementManager.js mevcut
...

📈 Test Sonuçları:
   ✅ Başarılı: 30
   ❌ Başarısız: 0
   📊 Toplam: 30
   🎯 Başarı Oranı: 100%

🎉 Tüm testler başarılı!
```

---

## 2. 🔍 ESLint (Kod Kalitesi)

Kod kalitesini, syntax hatalarını ve best practice'leri kontrol eder.

```bash
npm run lint
```

### Ne Kontrol Eder?

- ✅ Syntax hataları
- ✅ Kullanılmayan değişkenler
- ✅ Import/export hataları
- ✅ React hooks kuralları
- ✅ Kod stili

### Çıktı Örneği:
```
✖ 4 problems (0 errors, 4 warnings)
```

**Durum**: ✅ 0 hata, sadece 4 uyarı (kritik değil)

---

## 3. 📘 TypeScript Type Checking

TypeScript tip kontrolü yapar (JavaScript projelerinde de çalışır).

```bash
npx tsc --noEmit --skipLibCheck
```

### Ne Kontrol Eder?

- ✅ Tip hataları
- ✅ Eksik import'lar
- ✅ Yanlış fonksiyon çağrıları
- ✅ Undefined değişkenler

**Durum**: ✅ Hata yok

---

## 4. 🚀 Tüm Testler (Hepsi Birden)

Tüm testleri sırayla çalıştırır.

```bash
npm run test:all
```

Bu komut şunları çalıştırır:
1. ESLint (kod kalitesi)
2. Özellik testleri (entegrasyon)

**Durum**: ✅ Tüm testler başarılı

---

## 📊 Test Sonuçları Özeti

| Test Türü | Durum | Detay |
|-----------|-------|-------|
| Özellik Testleri | ✅ | 30/30 başarılı |
| ESLint | ✅ | 0 hata, 4 uyarı |
| TypeScript | ✅ | Hata yok |
| **TOPLAM** | **✅** | **Tüm testler geçti** |

---

## 🎯 Hızlı Kontrol

Sadece kritik hataları kontrol etmek için:

```bash
# Hızlı kontrol (sadece hatalar)
npm run lint 2>&1 | grep "error"

# Özellik testleri (30 saniye)
npm run test:features

# Hepsi (1 dakika)
npm run test:all
```

---

## 🐛 Hata Bulunursa

### ESLint Hataları

```bash
# Otomatik düzelt (bazı hataları)
npx eslint --fix DetectiveGame.jsx

# Tüm dosyaları düzelt
npx eslint --fix src/
```

### Özellik Test Hataları

Test başarısız olursa, hangi özelliğin eksik olduğunu gösterir:

```
❌ DetectiveGame - ConfettiCannon import
   Hata: "ConfettiCannon" import edilmemiş
```

Bu durumda ilgili dosyayı kontrol edin ve eksik import'u ekleyin.

---

## 📝 Yeni Test Ekleme

`scripts/test-features.js` dosyasına yeni test ekleyebilirsiniz:

```javascript
test('Yeni özellik kontrolü', () => {
  fileContains('DetectiveGame.jsx', 'yeniOzellik');
});
```

---

## 🎉 Sonuç

Artık manuel test yapmadan önce otomatik testlerle kodun doğruluğunu kontrol edebilirsiniz!

**Önerilen Workflow:**

1. Kod değişikliği yap
2. `npm run test:all` çalıştır
3. Tüm testler geçerse ✅
4. Manuel test yap (UI/UX)
5. Commit & Push

Bu sayede:
- ⚡ Hızlı geri bildirim
- 🐛 Erken hata tespiti
- 🎯 Güvenli deployment
- 📊 Kod kalitesi garantisi
