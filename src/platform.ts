import { Platform } from 'react-native';

// The browser version records audio only: no camera recording or voice commands.
export const ON_WEB = Platform.OS === 'web';
