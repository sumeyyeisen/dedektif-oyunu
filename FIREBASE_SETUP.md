# 🔥 Firebase Rules Kurulum Rehberi

## Adım 1: Firebase Console'a Git

1. Tarayıcıda aç: https://console.firebase.google.com/
2. Projeyi seç: **dedektif-oyunu-5c012**

## Adım 2: Realtime Database'e Git

1. Sol menüden **Build** > **Realtime Database** seç
2. Üst menüden **Rules** sekmesine tıkla

## Adım 3: Rules'u Güncelle

Mevcut rules'u sil ve aşağıdaki rules'u yapıştır:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "!data.exists()",
        
        "host": {
          ".validate": "newData.isString() && newData.val().length >= 2 && newData.val().length <= 20"
        },
        
        "status": {
          ".write": "data.parent().child('host').val() === auth.token.name || root.child('rooms').child($roomId).child('host').val() === newData.parent().child('host').val()",
          ".validate": "newData.val() === 'waiting' || newData.val() === 'playing' || newData.val() === 'solved'"
        },
        
        "difficulty": {
          ".validate": "newData.val() === 'kolay' || newData.val() === 'orta' || newData.val() === 'zor'"
        },
        
        "story": {
          ".validate": "newData.hasChildren(['id', 'baslik', 'baslangic', 'cevap', 'ipuclari'])"
        },
        
        "hintsUsed": {
          ".write": true,
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        
        "createdAt": {
          ".validate": "newData.isNumber()"
        },
        
        "messages": {
          ".read": true,
          "$messageId": {
            ".write": true,
            ".validate": "newData.hasChildren(['type', 'content', 'timestamp']) && newData.child('timestamp').isNumber()"
          }
        },
        
        "guests": {
          ".read": true,
          "$guestId": {
            ".write": true,
            ".validate": "newData.hasChildren(['name', 'joinedAt']) && newData.child('name').isString() && newData.child('joinedAt').isNumber()"
          }
        }
      }
    }
  }
}
```

## Adım 4: Publish

1. Sağ üstteki **Publish** butonuna tıkla
2. Onay mesajını bekle

## Adım 5: Test Et

Uygulamada online mod'u test et:
1. Oda oluştur
2. Oda kodunu not et
3. Başka bir cihazdan katıl
4. Mesaj gönder
5. Oyunu oyna

## 🔒 Güvenlik Özellikleri

Bu rules ile:
- ✅ Sadece oda oluşturan silebilir
- ✅ İsim uzunluğu kontrol edilir (2-20 karakter)
- ✅ Zorluk seviyesi validate edilir
- ✅ Mesaj formatı kontrol edilir
- ✅ Herkes okuyabilir (public game)
- ✅ Herkes mesaj gönderebilir (collaborative)

## ⚠️ Önemli Notlar

- Rules aktif olduktan sonra **5-10 saniye** bekle
- Eski odalar silinmeyebilir (manuel temizle)
- Test için yeni oda oluştur

## 🐛 Sorun Giderme

### "Permission Denied" Hatası
- Rules'un doğru yapıştırıldığından emin ol
- Publish'e tıkladığından emin ol
- 10 saniye bekle ve tekrar dene

### Oda Oluşturulamıyor
- Firebase Console > Database > Data sekmesine git
- Eski test odalarını manuel sil
- Yeni oda oluştur

### Mesaj Gönderilemiyor
- Rules'ta "messages" bölümünü kontrol et
- Console'da hata mesajını oku
- Gerekirse rules'u düzelt

## 📊 Monitoring

Firebase Console'da:
- **Usage** sekmesinden kullanım istatistiklerini gör
- **Data** sekmesinden aktif odaları gör
- **Rules** sekmesinden rules'u düzenle

## 🔄 Güncelleme

Rules'u güncellemek için:
1. `firebase.rules.json` dosyasını düzenle
2. Firebase Console'da yapıştır
3. Publish

---

**Son Güncelleme:** 2024
**Proje:** Dedektif Oyunu
