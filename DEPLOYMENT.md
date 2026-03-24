# 🚀 Deployment Rehberi

## Firebase Security Rules

Firebase Console'da güvenlik kurallarını güncelle:

1. [Firebase Console](https://console.firebase.google.com/) aç
2. Projeyi seç: `dedektif-oyunu-5c012`
3. Sol menüden **Realtime Database** > **Rules** sekmesine git
4. `firebase.rules.json` dosyasındaki kuralları kopyala
5. **Publish** butonuna tıkla

## Play Store Yayınlama

### 1. Build Hazırlığı

```bash
# Android için production build
eas build --platform android --profile production

# iOS için production build
eas build --platform ios --profile production
```

### 2. App Store Connect / Play Console

- **Bundle ID**: `com.sumeyye.dedektifoyunu`
- **Version**: `1.0.0`
- **Min SDK**: Android 21+ / iOS 13+

### 3. Gerekli Dosyalar

- [ ] App Icon (1024x1024)
- [ ] Screenshots (5 adet)
- [ ] Feature Graphic
- [ ] Privacy Policy
- [ ] App Description

### 4. Privacy Policy Önemli Noktalar

- Firebase kullanımı
- Oda kodları geçici
- Kişisel veri saklanmıyor
- Analytics yok (şimdilik)

## Güvenlik Kontrol Listesi

- [x] .env dosyası .gitignore'da
- [x] Firebase rules aktif
- [x] Error boundary eklendi
- [x] Input validation var
- [ ] Rate limiting (opsiyonel)
- [ ] Crash reporting (Sentry önerilir)

## Performans Optimizasyonu

```bash
# Bundle size analizi
npx react-native-bundle-visualizer

# Memory leak kontrolü
# React DevTools Profiler kullan
```

## Monitoring

Yayınlandıktan sonra:
- Firebase Console > Analytics
- Play Console > Vitals
- App Store Connect > Analytics

## Güncelleme Süreci

1. Version bump: `app.json` > `version`
2. Build number artır
3. Changelog hazırla
4. Test et
5. Build al
6. Store'a yükle
