// Create a file called google-signin.d.ts in your project
declare module '@react-native-google-signin/google-signin' {
  export interface User {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  }

  export interface SignInResult {
    idToken: string;
    serverAuthCode: string;
    user: User;
  }

  export class GoogleSignin {
    static configure(options: {
      webClientId?: string;
      offlineAccess?: boolean;
      iosClientId?: string;
      scopes?: string[];
      hostedDomain?: string;
    }): void;
    
    static hasPlayServices(options?: { showPlayServicesUpdateDialog: boolean }): Promise<boolean>;
    static signIn(): Promise<SignInResult>;
    static signInSilently(): Promise<SignInResult>;
    static isSignedIn(): Promise<boolean>;
    static signOut(): Promise<null>;
    static revokeAccess(): Promise<null>;
    static getCurrentUser(): Promise<User | null>;
  }

  export const statusCodes: {
    SIGN_IN_CANCELLED: string;
    IN_PROGRESS: string;
    PLAY_SERVICES_NOT_AVAILABLE: string;
  };
}