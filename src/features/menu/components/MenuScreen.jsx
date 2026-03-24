import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MenuScreen = ({ onSelectMode, onLayoutRootView }) => {
  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="incognito" color="#E0E0E0" size={80} />
          <Text style={styles.title}>Dedektif</Text>
          <Text style={styles.sub}>Gizemli hikayeleri çöz, gerçeği ortaya çıkar.</Text>
        </View>
        
        <View style={styles.cardWrapper}>
          <Text style={styles.cardHeader}>OYUN MODU SEÇ</Text>
          
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => onSelectMode('ai')}
          >
            <View style={[styles.iconBox, {backgroundColor:'#1A237E'}]}>
              <MaterialCommunityIcons name="robot" size={24} color="#90CAF9" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.cardTitle}>Tek Oyunculu</Text>
              <Text style={styles.cardSub}>Sorular sor, gizemi çöz</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => onSelectMode('reader')}
          >
            <View style={[styles.iconBox, {backgroundColor:'#3E2723'}]}>
              <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#FFCC80" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.cardTitle}>Hikaye Okuyucu</Text>
              <Text style={styles.cardSub}>Yüz yüze oyna</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => onSelectMode('online')}
          >
            <View style={[styles.iconBox, {backgroundColor:'#1B5E20'}]}>
              <MaterialCommunityIcons name="account-group" size={24} color="#A5D6A7" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.cardTitle}>Online Çok Oyunculu</Text>
              <Text style={styles.cardSub}>Arkadaşla oda aç veya katıl</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontFamily: 'SpecialElite', fontSize: 48, color: '#E0E0E0', marginTop:10 },
  sub: { fontFamily: 'serif', fontSize: 14, color: '#B0B0B0', textAlign: 'center', marginTop:5 },
  cardWrapper: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4, borderWidth:1, borderColor:'#333' },
  cardHeader: { fontFamily: 'SpecialElite', fontSize: 16, color: '#E0E0E0', fontWeight:'bold', marginBottom: 15 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#252525', borderRadius: 12, borderWidth: 1, borderColor: '#333333', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily:'SpecialElite' },
  cardSub: { fontSize: 12, color: '#B0B0B0', marginTop:2, fontFamily:'serif' },
  iconBox: { width:40, height:40, borderRadius:10, alignItems:'center', justifyContent:'center' },
});

export default MenuScreen;
