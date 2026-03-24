# 🕵️ Dedektif Oyunu

Gizemli hikayeleri çöz, gerçeği ortaya çıkar! Lateral düşünme bulmacaları ile dolu bir dedektiflik oyunu.

## 📱 Özellikler

- **Tek Oyunculu Mod**: Sorular sor, ipuçları al, gizemi çöz
- **Hikaye Okuyucu Modu**: Arkadaşlarınla yüz yüze oyna
- **Online Çok Oyunculu**: Gerçek zamanlı oda sistemi ile arkadaşlarınla oyna
- **3 Zorluk Seviyesi**: Kolay, Orta, Zor
- **Offline Çalışır**: İnternet bağlantısı gerektirmez (online mod hariç)

## 🏗️ Mimari

Proje **Feature-Based Architecture** kullanır:

```
src/
├── features/
│   ├── game/           # Oyun mantığı
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── online/         # Online multiplayer
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── menu/           # Ana menü
├── shared/             # Paylaşılan kod
│   ├── components/
│   ├── hooks/
│   └── utils/
├── data/
│   └── stories/        # JSON hikayeler (lazy loading)
│       ├── kolay/
│       ├── orta/
│       ├── zor/
│       └── storyLoader.js
└── config/             # Konfigürasyon
```

### Hikaye Sistemi

Hikayeler **JSON dosyaları** olarak saklanır ve **lazy loading** ile yüklenir:

- ✅ Her hikaye ayrı dosya
- ✅ Sadece seçilen hikaye yüklenir (memory efficient)
- ✅ Yeni hikaye eklemek kolay
- ✅ Git friendly (conflict yok)

**Yeni hikaye eklemek için:**
```bash
# 1. JSON dosyası oluştur
src/data/stories/kolay/107-yeni-hikaye.json

# 2. storyLoader.js'e metadata ekle
{ id: 107, file: 'kolay/107-yeni-hikaye.json' }
```

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start

# Android
npm run android

# iOS
npm run ios
```

## 🔧 Gereksinimler

- Node.js 18+
- Expo CLI
- React Native development environment

## 📦 Teknolojiler

- React Native
- Expo
- Firebase Realtime Database
- NativeWind (Tailwind CSS)
- Custom Hooks
- Feature-Based Architecture

## 🎮 Nasıl Oynanır?

### Tek Oyunculu Mod
1. Zorluk seviyesi seç
2. Hikaye başlangıcını oku
3. Evet/Hayır soruları sor
4. İpuçlarını kullan
5. Gizemi çöz!

### Online Mod
1. Oda oluştur veya katıl
2. Anlatıcı hikayeyi bilir, diğerleri soru sorar
3. Anlatıcı Evet/Hayır cevapları verir
4. Birlikte gizemi çözün!

## 📝 Lisans

MIT

## 👨‍💻 Geliştirici

Sümeyye
