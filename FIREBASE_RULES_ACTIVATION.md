# 🔥 Firebase Rules Aktivasyon Rehberi

## ⚡ Hızlı Başlangıç (5 Dakika)

### Adım 1: Firebase Console'a Git
1. Tarayıcıda aç: **https://console.firebase.google.com/**
2. Projeyi seç: **dedektif-oyunu-5c012**

### Adım 2: Realtime Database Rules'a Git
1. Sol menüden **Build** → **Realtime Database** seç
2. Üst menüden **Rules** sekmesine tıkla

### Adım 3: Rules'u Kopyala ve Yapıştır
1. Aşağıdaki rules'u **TAMAMEN** seç ve kopyala (Ctrl+C / Cmd+C)
2. Firebase Console'daki mevcut rules'u **SİL**
3. Kopyaladığın rules'u **YAPIŞTIR**
4. Sağ üstteki **Publish** butonuna tıkla
5. **10 saniye bekle** (rules'un aktif olması için)

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

### Adım 4: Test Et (Terminal)
```bash
node scripts/check-firebase.js
```

Başarılı çıktı:
```
🔥 Firebase Rules Kontrolü Başlıyor...
📖 Test 1: Okuma izni kontrol ediliyor...
✅ Okuma izni çalışıyor
✍️  Test 2: Yazma izni kontrol ediliyor...
✅ Yazma koruması çalışıyor (yetkisiz yazma engellendi)
🎉 Firebase Rules başarıyla aktif!
```

### Adım 5: Uygulamada Test Et
1. Uygulamayı aç
2. **Online Çok Oyunculu** seç
3. Adını yaz ve zorluk seç
4. **Oda Oluştur** butonuna tıkla
5. Oda kodu görünecek (örn: 123456)
6. Başka bir cihazdan aynı kodu kullanarak katıl
7. Mesaj gönder ve oyunu oyna

---

## 🔒 Bu Rules Ne Yapıyor?

### Güvenlik Özellikleri:
- ✅ **Okuma İzni**: Herkes odaları görebilir (public game)
- ✅ **Yazma Koruması**: Sadece oda oluşturan silebilir
- ✅ **İsim Validasyonu**: 2-20 karakter arası olmalı
- ✅ **Zorluk Kontrolü**: Sadece kolay/orta/zor kabul edilir
- ✅ **Mesaj Formatı**: type, content, timestamp zorunlu
- ✅ **Timestamp Kontrolü**: Sayı olmalı
- ✅ **Misafir Kaydı**: name ve joinedAt zorunlu

### Neler İzin Veriliyor:
- ✅ Yeni oda oluşturma
- ✅ Odaya katılma (guest olarak)
- ✅ Mesaj gönderme
- ✅ İpucu kullanma
- ✅ Cevap gönderme
- ✅ Oda durumunu güncelleme (host)

### Neler Engelleniyor:
- ❌ Başkasının odasını silme
- ❌ Geçersiz zorluk seviyesi
- ❌ 2 karakterden kısa isim
- ❌ 20 karakterden uzun isim
- ❌ Eksik mesaj formatı
- ❌ Geçersiz status değeri

---

## 🐛 Sorun Giderme

### "Permission Denied" Hatası
**Sebep**: Rules henüz aktif olmamış veya yanlış yapıştırılmış

**Çözüm**:
1. Firebase Console'da Rules sekmesini aç
2. Rules'un doğru olduğunu kontrol et
3. **Publish** butonuna tekrar tıkla
4. 10 saniye bekle
5. Uygulamayı yeniden başlat

### Oda Oluşturulamıyor
**Sebep**: Eski test odaları veritabanında kalmış olabilir

**Çözüm**:
1. Firebase Console → Realtime Database → **Data** sekmesi
2. `rooms` node'unu bul
3. Eski odaları manuel sil (sağ tık → Delete)
4. Yeni oda oluştur

### Mesaj Gönderilemiyor
**Sebep**: Mesaj formatı rules'a uymuyor

**Çözüm**:
1. Console'da hata mesajını oku
2. Mesajın `type`, `content`, `timestamp` içerdiğinden emin ol
3. `timestamp` sayı olmalı (Date.now())

### Test Script Çalışmıyor
**Sebep**: Node.js veya internet bağlantısı sorunu

**Çözüm**:
```bash
# Node.js versiyonunu kontrol et
node --version

# İnternet bağlantısını test et
ping google.com

# Script'i tekrar çalıştır
node scripts/check-firebase.js
```

---

## 📊 Monitoring ve Yönetim

### Aktif Odaları Görüntüleme
1. Firebase Console → Realtime Database → **Data** sekmesi
2. `rooms` node'unu genişlet
3. Her oda için:
   - `host`: Oda sahibi
   - `status`: waiting/playing/solved
   - `difficulty`: kolay/orta/zor
   - `messages`: Tüm mesajlar
   - `guests`: Katılan oyuncular

### Kullanım İstatistikleri
1. Firebase Console → Realtime Database → **Usage** sekmesi
2. Günlük okuma/yazma sayısını gör
3. Bağlantı sayısını kontrol et
4. Veri boyutunu izle

### Rules'u Güncelleme
1. `firebase.rules.json` dosyasını düzenle
2. Firebase Console'da Rules sekmesine git
3. Yeni rules'u yapıştır
4. **Publish** butonuna tıkla
5. Test et

---

## ⚠️ Önemli Notlar

1. **Rules Aktivasyon Süresi**: Publish'ten sonra 5-10 saniye bekle
2. **Eski Odalar**: Manuel temizlenmeli (otomatik silinmez)
3. **Test İçin**: Her zaman yeni oda oluştur
4. **Güvenlik**: Rules herkese okuma izni veriyor (public game için gerekli)
5. **Yazma Koruması**: Sadece oda sahibi odasını silebilir

---

## 🎯 Sonraki Adımlar

Rules aktif olduktan sonra:
1. ✅ Online modu test et
2. ✅ Farklı cihazlardan bağlan
3. ✅ Mesajlaşmayı dene
4. ✅ İpucu sistemini test et
5. ✅ Cevap kontrolünü dene

---

**Son Güncelleme**: 2024  
**Proje**: Dedektif Oyunu  
**Firebase Projesi**: dedektif-oyunu-5c012
