import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

export const useBackButton = (gameState, onBack) => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (gameState === 'playing' || gameState === 'online_playing' || gameState === 'waiting') {
        onBack?.();
        return true;
      }
      if (gameState !== 'menu') {
        onBack?.();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [gameState, onBack]);
};
