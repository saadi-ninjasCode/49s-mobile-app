const theme = {
  Primary: {
    black: '#000',
    white: '#FFF',
    cartContainer: '#FFF',
    drawerColor: 'rgb(34,25,119)',
    drawerSelected: 'rgba(0,0,0,0.2)',
    drawerTitleColor: 'rgb(78, 142, 237)',
    draweHeader: 'rgba(255,255,255,0.9)',
    mainBackground: '#f0f0f0',
    headerBackground: 'rgb(34,25,119)',
    headerText: '#FFFFFF',
    loginBackground: 'rgb(34,25,119)',
    switchBackground: 'rgba(216, 216, 216,0.4)',
    lotteryBox: 'rgb(34,25,119)',
    boxShadow: 'rgb(112,112,112)',
    spinnerColor: 'rgb(34,25,119)',
    fontWhite: '#FFF',
    fontMainColor: '#212121',
    fontSecondColor: '#949393',
    yellow: '#fbd449',
    green: '#6ae13a',
    google: '#db3236',
    facebook: '#3b5998',
    activeColor: '#4AD285',
    checkBoxColor: 'rgb(78, 142, 237)',
  },
} as const;

export type AppColors = typeof theme.Primary;
const colors: AppColors = theme.Primary;
export default colors;
