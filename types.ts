// types.ts
export type RootStackParamList = {
  Homepage: undefined;
  Analytics: undefined;
  Settings: undefined; // Type for Settings screen
  MonthTab: undefined;
  Login: { onLogin: () => void }; // Type for Login screen
};
