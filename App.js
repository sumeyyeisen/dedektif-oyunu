import { StatusBar } from 'expo-status-bar';
import { AppRegistry, View } from 'react-native';
import DetectiveGame from './src/features/game/components/DetectiveGame';
import ErrorBoundary from './src/shared/components/ErrorBoundary';
import { FontSizeProvider } from './src/shared/context/FontSizeContext';

function App() {
  return (
    <ErrorBoundary>
      <FontSizeProvider>
      <View style={{ flex: 1 }}>
        <DetectiveGame />
        <StatusBar style="auto" />
      </View>
    </FontSizeProvider>
    </ErrorBoundary>
  );
}

AppRegistry.registerComponent('main', () => App);
export default App;
