import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DifficultyScreen = ({ onBack, onSelectDifficulty }) => {
  const difficulties = [
    { key: 'kolay', color: '#1B5E20', dotColor: '#2E7D32', desc: 'Başlangıç seviyesi' },
    { key: 'orta', color: '#F57F17', dotColor: '#F9A825', desc: 'Biraz düşünmen gerekecek' },
    { key: 'zor', color: '#B71C1C', dotColor: '#C62828', desc: 'Gerçek dedektifler için' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" />
          </TouchableOpacity>
          <Text style={styles.title}>Zorluk Seç</Text>
        </View>
        
        {difficulties.map(({ key, color, dotColor, desc }) => (
          <TouchableOpacity 
            key={key} 
            style={styles.card} 
            onPress={() => onSelectDifficulty(key)}
          >
            <View style={[styles.iconBox, { backgroundColor: color }]}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.cardTitle}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <Text style={styles.cardSub}>{desc}</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={24} color="#757575" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { padding: 20, justifyContent: 'center', minHeight: '100%' },
  headerRow: { width:'100%', flexDirection:'row', alignItems:'center', marginBottom:20 },
  backButton: { padding:10 },
  title: { fontFamily: 'SpecialElite', fontSize: 28, color: '#E0E0E0', flex:1, textAlign:'center', marginRight:30 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#252525', borderRadius: 12, borderWidth: 1, borderColor: '#333333', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily:'SpecialElite' },
  cardSub: { fontSize: 12, color: '#B0B0B0', marginTop:2, fontFamily:'serif' },
  iconBox: { width:40, height:40, borderRadius:10, alignItems:'center', justifyContent:'center' },
  dot: { width:16, height:16, borderRadius:8 },
});

export default DifficultyScreen;
