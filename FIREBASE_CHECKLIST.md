# ✅ Firebase Rules Aktivasyon Kontrol Listesi

## Şu Anda Durum: ❌ Rules Aktif Değil

Test sonucu:
```
❌ Okuma izni çalışmıyor (Status: 401)
```

---

## Yapılacaklar Listesi

### 1. Firebase Console'a Git ⬜
- [ ] https://console.firebase.google.com/ aç
- [ ] **dedektif-oyunu-5c012** projesini seç

### 2. Rules Sayfasına Git ⬜
- [ ] Sol menüden **Build** → **Realtime Database** seç
- [ ] Üst menüden **Rules** sekmesine tıkla

### 3. Rules'u Güncelle ⬜
- [ ] `firebase.rules.json` dosyasını aç
- [ ] İçeriği **TAMAMEN** kopyala (Ctrl+A → Ctrl+C)
- [ ] Firebase Console'daki eski rules'u **SİL**
- [ ] Yeni rules'u **YAPIŞTIR**
- [ ] **Publish** butonuna tıkla

### 4. Bekle ⬜
- [ ] 10 saniye bekle (rules'un aktif olması için)

### 5. Test Et ⬜
- [ ] Terminal'de çalıştır: `node scripts/check-firebase.js`
- [ ] Şu mesajı görmelisin:
  ```
  ✅ Okuma izni çalışıyor
  ✅ Yazma koruması çalışıyor
  🎉 Firebase Rules başarıyla aktif!
  ```

### 6. Uygulamada Test Et ⬜
- [ ] Uygulamayı aç
- [ ] **Online Çok Oyunculu** seç
- [ ] Oda oluştur
- [ ] Oda kodu not et
- [ ] Başka cihazdan katıl
- [ ] Mesaj gönder

---

## Hızlı Erişim

### Dosyalar:
- 📄 **firebase.rules.json** - Kopyalanacak rules
- 📄 **FIREBASE_RULES_ACTIVATION.md** - Detaylı rehber
- 📄 **scripts/check-firebase.js** - Test scripti

### Linkler:
- 🔗 Firebase Console: https://console.firebase.google.com/
- 🔗 Proje: https://console.firebase.google.com/project/dedektif-oyunu-5c012

---

## Sorun mu Yaşıyorsun?

### "Permission Denied" hatası alıyorsan:
1. Rules'u doğru yapıştırdığından emin ol
2. **Publish** butonuna tıkladığından emin ol
3. 10 saniye bekle
4. Test scriptini tekrar çalıştır

### Oda oluşturamıyorsan:
1. Firebase Console → Data sekmesi
2. Eski test odalarını sil
3. Yeni oda oluştur

### Daha fazla yardım:
- **FIREBASE_RULES_ACTIVATION.md** dosyasını oku
- Console'daki hata mesajlarını kontrol et

---

**Not**: Bu işlem tamamen manuel yapılmalı. Firebase Console'a giriş yapman ve rules'u yapıştırman gerekiyor.
