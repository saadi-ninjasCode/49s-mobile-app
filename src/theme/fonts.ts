import { Platform } from 'react-native';
import { textStyles } from '../utilities/textStyles';

export const Outfit = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

export const Fonts = textStyles;
