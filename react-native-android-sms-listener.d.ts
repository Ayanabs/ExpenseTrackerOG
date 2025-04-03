declare module 'react-native-android-sms-listener' {
    export interface SmsMessage {
      originatingAddress: string;
      body: string;
      timestamp: number;
    }
  
    export default class SmsListener {
      static addListener(callback: (message: SmsMessage) => void): { remove: () => void };
    }
  }
  