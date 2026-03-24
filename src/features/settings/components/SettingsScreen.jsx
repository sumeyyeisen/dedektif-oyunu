import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { clearAllData, exportAllData, getSettings, saveSettings } from '../../../shared/utils/storageManager';

/**
 * Ayarlar Ekranı
 * Kullanıcı tercihlerini yönetme
 */
const SettingsScreen = ({ onBack }) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    vibrationEnabled: true,
    darkMode: true,
    language: 'tr',
    fontSize: 'medium',
    showTimer: true,
    hintLimit: 'unlimited',
    notificationsEnabled: true,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      if (savedSettings) {
        setSettings({ ...settings, ...savedSettings });
      }
    } catch (error) {
      console.error('loadSettings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleClearData = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Bu işlem geri alınamaz! Tüm ilerlemeniz, favorileriniz ve istatistikleriniz silinecek.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Başarılı', 'Tüm veriler silindi.');
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      // TODO: Share API ile paylaş veya dosyaya kaydet
      Alert.alert(
        'Veri Dışa Aktarıldı',
        `Verileriniz hazır!\n\nToplam: ${JSON.stringify(data).length} karakter\n\nNot: Şu an sadece konsola yazdırıldı. Gelecekte dosya olarak kaydedilebilecek.`
      );
      console.log('Exported data:', data);
    } catch (error) {
      Alert.alert('Hata', 'Veriler dışa aktarılamadı.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Ayarlar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Ses Ayarları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="volume-high" size={24} color="#90CAF9" />
            <Text style={styles.sectionTitle}>Ses Ayarları</Text>
          </View>

          <SettingRow
            icon="volume-high"
            label="Ses Efektleri"
            value={settings.soundEnabled}
            onValueChange={(value) => updateSetting('soundEnabled', value)}
            type="switch"
          />

          <SettingRow
            icon="music"
            label="Müzik"
            value={settings.musicEnabled}
            onValueChange={(value) => updateSetting('musicEnabled', value)}
            type="switch"
          />

          <SettingRow
            icon="vibrate"
            label="Titreşim"
            value={settings.vibrationEnabled}
            onValueChange={(value) => updateSetting('vibrationEnabled', value)}
            type="switch"
          />
        </View>

        {/* Görünüm Ayarları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="palette" size={24} color="#A5D6A7" />
            <Text style={styles.sectionTitle}>Görünüm</Text>
          </View>

          <SettingRow
            icon="theme-light-dark"
            label="Karanlık Mod"
            value={settings.darkMode}
            onValueChange={(value) => updateSetting('darkMode', value)}
            type="switch"
            disabled={true}
            subtitle="Şu an sadece karanlık mod destekleniyor"
          />

          <SettingRow
            icon="format-size"
            label="Font Boyutu"
            value={settings.fontSize}
            type="select"
            options={[
              { label: 'Küçük', value: 'small' },
              { label: 'Orta', value: 'medium' },
              { label: 'Büyük', value: 'large' },
            ]}
            onPress={() => {
              const sizes = ['small', 'medium', 'large'];
              const currentIndex = sizes.indexOf(settings.fontSize);
              const nextIndex = (currentIndex + 1) % sizes.length;
              updateSetting('fontSize', sizes[nextIndex]);
            }}
          />
        </View>

        {/* Oyun Ayarları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="gamepad-variant" size={24} color="#FFCC80" />
            <Text style={styles.sectionTitle}>Oyun</Text>
          </View>

          <SettingRow
            icon="timer"
            label="Zamanlayıcı Göster"
            value={settings.showTimer}
            onValueChange={(value) => updateSetting('showTimer', value)}
            type="switch"
          />

          <SettingRow
            icon="lightbulb"
            label="İpucu Limiti"
            value={settings.hintLimit}
            type="select"
            options={[
              { label: 'Sınırsız', value: 'unlimited' },
              { label: '3 İpucu', value: '3' },
              { label: '5 İpucu', value: '5' },
            ]}
            onPress={() => {
              const limits = ['unlimited', '3', '5'];
              const currentIndex = limits.indexOf(settings.hintLimit);
              const nextIndex = (currentIndex + 1) % limits.length;
              updateSetting('hintLimit', limits[nextIndex]);
            }}
          />

          <SettingRow
            icon="bell"
            label="Bildirimler"
            value={settings.notificationsEnabled}
            onValueChange={(value) => updateSetting('notificationsEnabled', value)}
            type="switch"
            subtitle="Günlük hatırlatmalar ve yeni hikayeler"
          />
        </View>

        {/* Dil Ayarları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="translate" size={24} color="#EF9A9A" />
            <Text style={styles.sectionTitle}>Dil</Text>
          </View>

          <SettingRow
            icon="web"
            label="Uygulama Dili"
            value={settings.language}
            type="select"
            options={[
              { label: '🇹🇷 Türkçe', value: 'tr' },
              { label: '🇬🇧 English', value: 'en' },
            ]}
            onPress={() => {
              const nextLang = settings.language === 'tr' ? 'en' : 'tr';
              updateSetting('language', nextLang);
              Alert.alert(
                'Dil Değiştirildi',
                'Dil değişikliği için uygulamayı yeniden başlatmanız gerekebilir.'
              );
            }}
            disabled={true}
            subtitle="Yakında: İngilizce desteği"
          />
        </View>

        {/* Veri Yönetimi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="database" size={24} color="#B39DDB" />
            <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <MaterialCommunityIcons name="export" size={24} color="#90CAF9" />
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>Verileri Dışa Aktar</Text>
              <Text style={styles.actionButtonSubtitle}>
                İlerlemenizi yedekleyin
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleClearData}>
            <MaterialCommunityIcons name="delete-forever" size={24} color="#EF9A9A" />
            <View style={styles.actionButtonText}>
              <Text style={[styles.actionButtonTitle, { color: '#EF9A9A' }]}>
                Tüm Verileri Sil
              </Text>
              <Text style={styles.actionButtonSubtitle}>
                Bu işlem geri alınamaz!
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
        </View>

        {/* Hakkında */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information" size={24} color="#FFD700" />
            <Text style={styles.sectionTitle}>Hakkında</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versiyon</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Geliştirici</Text>
            <Text style={styles.infoValue}>Dedektif Oyunu Ekibi</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hikaye Sayısı</Text>
            <Text style={styles.infoValue}>5 vaka</Text>
          </View>
        </View>

        {/* Alt Boşluk */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Ayar Satırı Komponenti
 */
const SettingRow = ({ 
  icon, 
  label, 
  subtitle, 
  value, 
  onValueChange, 
  type = 'switch', 
  options = [],
  onPress,
  disabled = false 
}) => {
  const renderValue = () => {
    if (type === 'switch') {
      return (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#424242', true: '#1565C0' }}
          thumbColor={value ? '#90CAF9' : '#757575'}
          disabled={disabled}
        />
      );
    }
    
    if (type === 'select') {
      const selectedOption = options.find(opt => opt.value === value);
      return (
        <TouchableOpacity 
          style={styles.selectButton} 
          onPress={onPress}
          disabled={disabled}
        >
          <Text style={[styles.selectText, disabled && { color: '#555555' }]}>
            {selectedOption?.label || value}
          </Text>
          {!disabled && (
            <MaterialCommunityIcons name="chevron-down" size={20} color="#757575" />
          )}
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  return (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <View style={styles.settingLeft}>
        <MaterialCommunityIcons 
          name={icon} 
          size={22} 
          color={disabled ? '#555555' : '#B0B0B0'} 
        />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingLabel, disabled && { color: '#555555' }]}>
            {label}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {renderValue()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontFamily: 'serif',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
    fontFamily: 'SpecialElite',
  },
  headerRight: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
    fontFamily: 'SpecialElite',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    color: '#E0E0E0',
    fontFamily: 'serif',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
    fontFamily: 'serif',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
  },
  selectText: {
    fontSize: 14,
    color: '#B0B0B0',
    fontFamily: 'serif',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  actionButtonTitle: {
    fontSize: 15,
    color: '#E0E0E0',
    fontFamily: 'serif',
    fontWeight: '600',
  },
  actionButtonSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
    fontFamily: 'serif',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoLabel: {
    fontSize: 15,
    color: '#B0B0B0',
    fontFamily: 'serif',
  },
  infoValue: {
    fontSize: 15,
    color: '#E0E0E0',
    fontFamily: 'serif',
    fontWeight: '600',
  },
});

export default SettingsScreen;
