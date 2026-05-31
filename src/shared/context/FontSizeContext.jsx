import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '../utils/storageManager';

const FontSizeContext = createContext({ scale: 1 });

export const FontSizeProvider = ({ children }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const load = async () => {
      const s = await getSettings();
      const multipliers = { small: 0.85, medium: 1, large: 1.2 };
      setScale(multipliers[s?.fontSize] || 1);
    };
    load();
  }, []);

  return (
    <FontSizeContext.Provider value={{ scale, setScale }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => useContext(FontSizeContext);
