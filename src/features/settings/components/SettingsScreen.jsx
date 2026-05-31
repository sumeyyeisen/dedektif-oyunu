import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllStoryCounts } from '../../../data/stories/storyLoader';
import { useFontSize } from '../../../shared/context/FontSizeContext';
import { clearAllData, getSettings, saveSettings } from '../../../shared/utils/storageManager';

const SettingsScreen = ({ onBack }) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    fontSize: 'medium',
    showTimer: true,
    hintLimit: 'unlimited',
  });
  const [loading, setLoading] = useState(true);
  const { setScale } = useFontSize();
  const [storyCounts, setStoryCounts] = useState({ kolay: 0, orta: 0, zor: 0 });

  useEffect(() => {
    const init = async () => {
      try {
        const savedSettings = await getSettings();
        if (savedSettings) setSettings(prev => ({ ...prev, ...savedSettings }));
        setStoryCounts(getAllStoryCounts());
      } catch (e) {
        console.error('Settings init error:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const updateSetting = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await saveSettings(next);
    if (key === 'fontSize') {
      const multipliers = { small: 0.85, medium: 1, large: 1.2 };
      setScale(multipliers[value] || 1);
    }
  };

  const handleClearData = () => {
    Alert.alert('Verileri Sil', 'Bu islem geri alinamaz!', [
      { text: 'Vazgec', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        await clearAllData();
        Alert.alert('Tamam', 'Tum veriler silindi.');
      }},
    ]);
  };

  if (loading) return (
    <SafeAreaView style={s.container}>
      <Text style={{ color: '#B0B0B0', fontFamily: 'SpecialElite', textAlign: 'center', marginTop: 40 }}>Yukleniyor...</Text>
    </SafeAreaView>
  );

  const total = storyCounts.kolay + storyCounts.orta + storyCounts.zor;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <MaterialCommunityIcons name='arrow-left' size={28} color='#E0E0E0' />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Ayarlar</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>

        <SectionLabel icon='volume-high' color='#90CAF9' title='SES' />
        <Row icon='volume-high' label='Ses Efektleri' type='switch' value={settings.soundEnabled} onValueChange={v => updateSetting('soundEnabled', v)} />
        <Row icon='vibrate' label='Titresim' type='switch' value={settings.vibrationEnabled} onValueChange={v => updateSetting('vibrationEnabled', v)} />

        <SectionLabel icon='gamepad-variant' color='#FFCC80' title='OYUN' />
        <Row icon='timer' label='Zamanlayici' type='switch' value={settings.showTimer} onValueChange={v => updateSetting('showTimer', v)} />
        <Row
          icon='lightbulb'
          label='Ipucu Limiti'
          type='select'
          value={settings.hintLimit}
          options={[{ label: 'Sinirsiz', value: 'unlimited' }, { label: '3 Ipucu', value: '3' }, { label: '5 Ipucu', value: '5' }]}
          onPress={() => { const l = ['unlimited','3','5']; updateSetting('hintLimit', l[(l.indexOf(settings.hintLimit)+1)%l.length]); }}
        />
        <Row
          icon='format-size'
          label='Font Boyutu'
          type='select'
          value={settings.fontSize}
          options={[{ label: 'Kucuk', value: 'small' }, { label: 'Orta', value: 'medium' }, { label: 'Buyuk', value: 'large' }]}
          onPress={() => { const l = ['small','medium','large']; updateSetting('fontSize', l[(l.indexOf(settings.fontSize)+1)%l.length]); }}
        />

        <SectionLabel icon='database' color='#EF9A9A' title='VERI' />
        <TouchableOpacity style={s.actionBtn} onPress={handleClearData}>
          <MaterialCommunityIcons name='delete-forever' size={22} color='#EF9A9A' />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.label, { color: '#EF9A9A' }]}>Tum Verileri Sil</Text>
            <Text style={s.sub}>Ilerleme ve istatistikler sifirlanir</Text>
          </View>
          <MaterialCommunityIcons name='chevron-right' size={22} color='#555' />
        </TouchableOpacity>

        <SectionLabel icon='information' color='#FFD700' title='HAKKINDA' />
        <InfoRow label='Versiyon' value='1.0.0' />
        <InfoRow label='Toplam Vaka' value={total + ' vaka'} />
        <InfoRow label='Kolay' value={storyCounts.kolay + ' vaka'} />
        <InfoRow label='Orta' value={storyCounts.orta + ' vaka'} />
        <InfoRow label='Zor' value={storyCounts.zor + ' vaka'} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionLabel = ({ icon, color, title }) => (
  <View style={s.sectionHeader}>
    <MaterialCommunityIcons name={icon} size={18} color={color} />
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

const Row = ({ icon, label, type, value, onValueChange, options = [], onPress }) => (
  <View style={s.row}>
    <View style={s.rowLeft}>
      <MaterialCommunityIcons name={icon} size={20} color='#B0B0B0' />
      <Text style={s.label}>{label}</Text>
    </View>
    {type === 'switch' && (
      <Switch value={value} onValueChange={onValueChange}
        trackColor={{ false: '#333', true: '#1565C0' }}
        thumbColor={value ? '#90CAF9' : '#757575'} />
    )}
    {type === 'select' && (
      <TouchableOpacity style={s.selectBtn} onPress={onPress}>
        <Text style={s.selectText}>{(options.find(o => o.value === value) || {}).label || value}</Text>
        <MaterialCommunityIcons name='chevron-down' size={18} color='#757575' />
      </TouchableOpacity>
    )}
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={s.infoRow}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { fontSize: 20, color: '#E0E0E0', fontFamily: 'SpecialElite' },
  content: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 12, color: '#757575', fontFamily: 'SpecialElite', letterSpacing: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#333' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  label: { fontSize: 15, color: '#E0E0E0', fontFamily: 'serif' },
  sub: { fontSize: 12, color: '#757575', marginTop: 2, fontFamily: 'serif' },
  selectBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#2C2C2C', borderRadius: 8 },
  selectText: { fontSize: 13, color: '#B0B0B0', fontFamily: 'serif' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#333' },
  infoLabel: { fontSize: 14, color: '#B0B0B0', fontFamily: 'serif' },
  infoValue: { fontSize: 14, color: '#E0E0E0', fontFamily: 'SpecialElite' },
});

export default SettingsScreen;