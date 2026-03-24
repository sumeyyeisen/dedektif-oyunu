#!/usr/bin/env node

/**
 * Performance & Bug Checker
 * Potansiyel sorunları tespit eder
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Performance & Bug Kontrolü Başlatılıyor...\n');

let issueCount = 0;
const issues = [];

function addIssue(severity, file, issue, suggestion) {
  issues.push({ severity, file, issue, suggestion });
  issueCount++;
}

function checkFile(filePath, checks) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) return;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  checks.forEach(check => {
    if (check.test(content)) {
      addIssue(check.severity, filePath, check.issue, check.suggestion);
    }
  });
}

console.log('📊 1. Memory Leak Kontrolleri\n');

// useEffect cleanup kontrolü
checkFile('DetectiveGame.jsx', [
  {
    test: (content) => {
      const useEffectCount = (content.match(/useEffect\(/g) || []).length;
      const cleanupCount = (content.match(/return \(\) =>/g) || []).length;
      return useEffectCount > cleanupCount + 2; // +2 tolerans
    },
    severity: 'warning',
    issue: 'Bazı useEffect\'lerde cleanup eksik olabilir',
    suggestion: 'Her useEffect\'te listener/timer varsa cleanup ekle'
  }
]);

// Timer cleanup
checkFile('DetectiveGame.jsx', [
  {
    test: (content) => content.includes('setInterval') && !content.includes('clearInterval'),
    severity: 'error',
    issue: 'setInterval kullanılıyor ama clearInterval yok',
    suggestion: 'useEffect cleanup\'ta clearInterval ekle'
  },
  {
    test: (content) => content.includes('setTimeout') && content.split('setTimeout').length > 5,
    severity: 'warning',
    issue: 'Çok fazla setTimeout kullanımı',
    suggestion: 'Gereksiz setTimeout\'ları kaldır veya debounce kullan'
  }
]);

console.log('⚡ 2. Performance Kontrolleri\n');

// Büyük dosya kontrolü
const files = [
  'DetectiveGame.jsx',
  'src/features/game/components/StorySelectionScreen.jsx',
  'src/features/stats/components/StatsScreen.jsx',
  'src/features/achievements/components/AchievementsScreen.jsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n').length;
    
    if (lines > 800) {
      addIssue('warning', file, `Dosya çok büyük (${lines} satır)`, 'Dosyayı daha küçük komponentlere böl');
    }
  }
});

// Inline style kontrolü
checkFile('DetectiveGame.jsx', [
  {
    test: (content) => {
      const inlineStyles = (content.match(/style=\{\{/g) || []).length;
      return inlineStyles > 10;
    },
    severity: 'info',
    issue: 'Çok fazla inline style kullanımı',
    suggestion: 'StyleSheet\'e taşı (performance için)'
  }
]);

// Re-render kontrolü
checkFile('src/features/game/components/StoryCard.jsx', [
  {
    test: (content) => !content.includes('React.memo') && !content.includes('useMemo'),
    severity: 'info',
    issue: 'StoryCard optimize edilmemiş',
    suggestion: 'React.memo ile wrap et (liste performansı için)'
  }
]);

console.log('🔒 3. Güvenlik Kontrolleri\n');

// API key kontrolü
checkFile('.env', [
  {
    test: (content) => content.includes('GEMINI_API_KEY') && content.length < 100,
    severity: 'warning',
    issue: 'API key çok kısa görünüyor',
    suggestion: 'API key\'in doğru olduğundan emin ol'
  }
]);

// Firebase rules kontrolü
checkFile('firebase.rules.json', [
  {
    test: (content) => content.includes('"read": true') || content.includes('"write": true'),
    severity: 'error',
    issue: 'Firebase rules çok açık (güvenlik riski)',
    suggestion: 'Auth kontrolü ekle veya rules\'ı sıkılaştır'
  }
]);

console.log('🎯 4. Best Practice Kontrolleri\n');

// Console.log kontrolü (production)
files.forEach(file => {
  checkFile(file, [
    {
      test: (content) => {
        const consoleCount = (content.match(/console\.log\(/g) || []).length;
        return consoleCount > 5;
      },
      severity: 'info',
      issue: 'Çok fazla console.log',
      suggestion: 'Production\'da console.log\'ları kaldır'
    }
  ]);
});

// Error handling
checkFile('src/shared/utils/soundManager.js', [
  {
    test: (content) => {
      const tryCount = (content.match(/try \{/g) || []).length;
      const catchCount = (content.match(/catch/g) || []).length;
      return tryCount !== catchCount;
    },
    severity: 'warning',
    issue: 'Try-catch dengesi bozuk',
    suggestion: 'Her try\'a karşılık catch olmalı'
  }
]);

console.log('📱 5. React Native Specific\n');

// SafeAreaView deprecation
files.forEach(file => {
  checkFile(file, [
    {
      test: (content) => content.includes('SafeAreaView') && content.includes("from 'react-native'") && !content.includes("from 'react-native-safe-area-context'"),
      severity: 'warning',
      issue: 'SafeAreaView deprecated',
      suggestion: "react-native-safe-area-context'ten import et"
    }
  ]);
});

// FlatList vs ScrollView
checkFile('src/features/game/components/StorySelectionScreen.jsx', [
  {
    test: (content) => content.includes('ScrollView') && content.includes('.map('),
    severity: 'warning',
    issue: 'ScrollView içinde .map() kullanımı',
    suggestion: 'Uzun listeler için FlatList kullan (performance)'
  }
]);

console.log('\n' + '='.repeat(60));
console.log('\n📋 Tespit Edilen Sorunlar:\n');

if (issues.length === 0) {
  console.log('✅ Hiç sorun bulunamadı! Kod temiz görünüyor.\n');
} else {
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');
  
  if (errors.length > 0) {
    console.log('🔴 HATALAR (Kritik):\n');
    errors.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.file}`);
      console.log(`   ❌ ${issue.issue}`);
      console.log(`   💡 ${issue.suggestion}\n`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('🟡 UYARILAR (Önemli):\n');
    warnings.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.file}`);
      console.log(`   ⚠️  ${issue.issue}`);
      console.log(`   💡 ${issue.suggestion}\n`);
    });
  }
  
  if (infos.length > 0) {
    console.log('🔵 BİLGİ (İyileştirme):\n');
    infos.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.file}`);
      console.log(`   ℹ️  ${issue.issue}`);
      console.log(`   💡 ${issue.suggestion}\n`);
    });
  }
  
  console.log('='.repeat(60));
  console.log(`\n📊 Özet:`);
  console.log(`   🔴 Hatalar: ${errors.length}`);
  console.log(`   🟡 Uyarılar: ${warnings.length}`);
  console.log(`   🔵 Bilgi: ${infos.length}`);
  console.log(`   📊 Toplam: ${issues.length}\n`);
}

process.exit(issues.filter(i => i.severity === 'error').length > 0 ? 1 : 0);
