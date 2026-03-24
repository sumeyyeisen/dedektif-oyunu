import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
  
  // Typography
  title: { fontFamily: 'SpecialElite', fontSize: 48, color: '#E0E0E0', marginTop:10 },
  titleSmall: { fontFamily: 'SpecialElite', fontSize: 28, color: '#E0E0E0', marginBottom: 20 },
  sub: { fontFamily: 'serif', fontSize: 14, color: '#B0B0B0', textAlign: 'center', marginTop:5 },
  
  // Cards
  cardWrapper: { 
    backgroundColor: '#1E1E1E', 
    borderRadius: 16, 
    padding: 24, 
    width: '100%', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 10, 
    elevation: 4, 
    borderWidth:1, 
    borderColor:'#333' 
  },
  cardHeader: { fontFamily: 'SpecialElite', fontSize: 16, color: '#E0E0E0', fontWeight:'bold' },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#252525', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#333333', 
    marginBottom: 12 
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily:'SpecialElite' },
  cardSub: { fontSize: 12, color: '#B0B0B0', marginTop:2, fontFamily:'serif' },
  
  // Buttons
  actionBtn: { 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent:'center', 
    width:'100%' 
  },
  actionBtnText: { 
    color: '#121212', 
    fontWeight: 'bold', 
    fontSize:15, 
    fontFamily:'SpecialElite' 
  },
  
  // Inputs
  modernInput: { 
    backgroundColor: '#2C2C2C', 
    borderRadius: 10, 
    padding: 15, 
    fontSize: 15, 
    color: '#E0E0E0', 
    borderWidth:1, 
    borderColor:'#333333', 
    fontFamily:'serif' 
  },
  
  // Icons
  iconBox: { 
    width:40, 
    height:40, 
    borderRadius:10, 
    alignItems:'center', 
    justifyContent:'center' 
  },
  dot: { width:10, height:10, borderRadius:5 },
  
  // Misc
  divider: { height:1, backgroundColor:'#333333', width:'100%', marginVertical:20 },
  disabledButton: { opacity: 0.6 },
});
