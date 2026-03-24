#!/bin/bash

# Firebase Rules Durum Kontrolü
# Bu script Firebase rules'unun aktif olup olmadığını kontrol eder

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          🔥 Firebase Rules Durum Kontrolü                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. firebase.rules.json dosyası var mı?
echo -n "📄 firebase.rules.json dosyası... "
if [ -f "firebase.rules.json" ]; then
    echo -e "${GREEN}✅ Mevcut${NC}"
else
    echo -e "${RED}❌ Bulunamadı${NC}"
    exit 1
fi

# 2. Test scripti var mı?
echo -n "📄 Test scripti... "
if [ -f "scripts/check-firebase.js" ]; then
    echo -e "${GREEN}✅ Mevcut${NC}"
else
    echo -e "${RED}❌ Bulunamadı${NC}"
    exit 1
fi

# 3. Node.js kurulu mu?
echo -n "🔧 Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Kurulu ($NODE_VERSION)${NC}"
else
    echo -e "${RED}❌ Kurulu değil${NC}"
    exit 1
fi

# 4. İnternet bağlantısı var mı?
echo -n "🌐 İnternet bağlantısı... "
if ping -c 1 google.com &> /dev/null; then
    echo -e "${GREEN}✅ Aktif${NC}"
else
    echo -e "${RED}❌ Bağlantı yok${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 5. Firebase rules test et
echo "🔥 Firebase Rules Testi Başlıyor..."
echo ""

node scripts/check-firebase.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Sonuç
if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Firebase Rules başarıyla aktif!${NC}"
    echo ""
    echo "Sonraki adımlar:"
    echo "  1. Uygulamayı aç"
    echo "  2. Online Çok Oyunculu seç"
    echo "  3. Oda oluştur ve test et"
else
    echo -e "${RED}❌ Firebase Rules henüz aktif değil${NC}"
    echo ""
    echo "Yapılacaklar:"
    echo "  1. Firebase Console'a git: https://console.firebase.google.com/"
    echo "  2. Proje seç: dedektif-oyunu-5c012"
    echo "  3. Build → Realtime Database → Rules"
    echo "  4. firebase.rules.json içeriğini yapıştır"
    echo "  5. Publish butonuna tıkla"
    echo "  6. 10 saniye bekle"
    echo "  7. Bu scripti tekrar çalıştır"
    echo ""
    echo "Detaylı rehber: FIREBASE_RULES_ACTIVATION.md"
fi

echo ""
