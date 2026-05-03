import 'expo-dev-client';
import 'expo-router/entry';
import { registerBackgroundHandler } from './src/services/notifications';

registerBackgroundHandler();
