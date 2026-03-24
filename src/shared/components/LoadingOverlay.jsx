import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const LoadingOverlay = ({ message = 'Yükleniyor...' }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#90CAF9" />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#1E1E1E',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  text: {
    color: '#E0E0E0',
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'SpecialElite',
  },
});

export default LoadingOverlay;
