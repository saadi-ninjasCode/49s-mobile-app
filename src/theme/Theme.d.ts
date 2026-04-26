declare global {
  type NavigationTheme = import('@react-navigation/native').Theme & {
    dark: boolean;
    colors: import('@react-navigation/native').Theme['colors'] & {
      white: string;
      black: string;
      mainBackground: string;
      cartContainer: string;
      headerBackground: string;
      headerText: string;
      drawerColor: string;
      drawerSelected: string;
      drawerTitleColor: string;
      drawerHeader: string;
      sidebarDivider: string;
      brandAccent: string;
      lotteryBox: string;
      loginBackground: string;
      switchBackground: string;
      boxShadow: string;
      spinnerColor: string;
      fontWhite: string;
      fontMainColor: string;
      fontSecondColor: string;
      yellow: string;
      green: string;
      google: string;
      facebook: string;
      activeColor: string;
      checkBoxColor: string;
    };
  };
}

export {};
