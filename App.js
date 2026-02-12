import { AppRegistry } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DetectiveGame from './DetectiveGame';
import { View } from 'react-native';

function App() {
  return (
    <View style={{ flex: 1 }}>
      <DetectiveGame />
      <StatusBar style="auto" />
    </View>
  );
}

AppRegistry.registerComponent('main', () => App);
export default App;
