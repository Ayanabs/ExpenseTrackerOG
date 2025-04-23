// types.ts
export type RootStackParamList = {
  Homepage: undefined;
  Analytics: undefined;
  Settings: { onLogout: () => void }; // Type for Settings screen
  MonthTab: undefined;
  Login: { onLogin: () => void }; // Type for Login screen
};
