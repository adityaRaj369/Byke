import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = 'fcm_token';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  }

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission denied');
      return null;
    }

    const token = await messaging().getToken();
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export const setupNotificationListeners = (
  onNotification: (notification: any) => void,
  onNotificationOpened: (notification: any) => void
): (() => void) => {
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground notification:', remoteMessage);
    onNotification(remoteMessage);
  });

  const unsubscribeBackground = messaging().setBackgroundMessageHandler(
    async (remoteMessage) => {
      console.log('Background notification:', remoteMessage);
    }
  );

  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification opened app:', remoteMessage);
    onNotificationOpened(remoteMessage);
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('App opened from quit state:', remoteMessage);
        onNotificationOpened(remoteMessage);
      }
    });

  return () => {
    unsubscribeForeground();
  };
};

export const onTokenRefresh = (callback: (token: string) => void): (() => void) => {
  return messaging().onTokenRefresh((token) => {
    console.log('FCM token refreshed:', token);
    AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    callback(token);
  });
};
