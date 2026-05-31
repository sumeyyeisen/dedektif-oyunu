import { Text } from 'react-native';
import { useFontSize } from '../context/FontSizeContext';

const AppText = ({ style, children, ...props }) => {
  const { scale } = useFontSize();

  const scaleStyle = (s) => {
    if (!s) return s;
    if (Array.isArray(s)) return s.map(scaleStyle);
    if (typeof s === 'object' && s.fontSize) {
      return { ...s, fontSize: s.fontSize * scale, lineHeight: s.lineHeight ? s.lineHeight * scale : undefined };
    }
    return s;
  };

  return <Text style={scaleStyle(style)} {...props}>{children}</Text>;
};

export default AppText;
