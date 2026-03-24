import { StatusBar } from 'expo-status-bar';
import { AppRegistry, View } from 'react-native';
import DetectiveGame from './DetectiveGame';
import ErrorBoundary from './src/shared/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <DetectiveGame />
        <StatusBar style="auto" />
      </View>
    </ErrorBoundary>
  );
}

AppRegistry.registerComponent('main', () => App);
export default App;
