import AsyncStorage from '@react-native-async-storage/async-storage';

// Mute other voices was removed. Delete the voice description it kept on this device.
AsyncStorage.multiRemove(['nerve.voice.v1', 'nerve.voice.mute']).catch(() => {});
