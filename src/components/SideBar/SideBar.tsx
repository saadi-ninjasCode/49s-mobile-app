import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { CommonActions, DrawerActions, useTheme } from '@react-navigation/native';
import React from 'react';
import { Image, View } from 'react-native';
import { dashboardInfo } from '../../mock/dashboard';
import { DrawerItems } from '../Drawer';
import { TextDefault } from '../Text';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useStyles } from './styles';

const LOGO_SOURCE = require('../../../assets/images/icon.png');

interface MenuConfig {
  title: string;
  icon: string;
  navigateTo: string;
}

const Home: MenuConfig = { title: 'Home', icon: 'home', navigateTo: 'index' };
const TopMenus: MenuConfig[] = [
  { title: 'Notifications', icon: 'bell', navigateTo: 'notification' },
  { title: 'Hot & Cold', icon: 'snowflake', navigateTo: 'favourite' },
  { title: 'Number Generator', icon: 'sync-alt', navigateTo: 'generator' },
];
const BottomMenu: MenuConfig[] = [
  { title: 'Terms & Conditions', icon: 'file-prescription', navigateTo: 'condition' },
  { title: 'Privacy Policy', icon: 'file-signature', navigateTo: 'privacy' },
];

function SideBar(props: DrawerContentComponentProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const { navigation, state } = props;
  const activeRouteName = state?.routes?.[state.index]?.name;

  const navigateAndClose = (routeName: string, params?: Record<string, string>) => {
    navigation.dispatch(CommonActions.navigate({ name: routeName, params }));
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
      <View style={styles.flexBg}>
        <View style={styles.logoContainer}>
          <Image source={LOGO_SOURCE} style={styles.logo} resizeMode="contain" />
          <TextDefault style={styles.logoText} textColor={colors.fontWhite} H4 bold>
            {"49's Results"}
          </TextDefault>
        </View>
        <View style={styles.menuContainer}>
          <View style={styles.transparent}>
            <DrawerItems
              name={Home.navigateTo}
              icon={Home.icon}
              text={Home.title}
              active={activeRouteName === Home.navigateTo}
              onPress={() => navigateAndClose(Home.navigateTo)}
            />

            <View style={styles.line} />
            <View>
              <TextDefault style={styles.font} textColor={colors.fontWhite} H5>
                {'Results'}
              </TextDefault>
              <View style={styles.resultContainer}>
                {dashboardInfo.map((entry) => (
                  <DrawerItems
                    key={entry.lottery._id}
                    name={'lottery'}
                    icon={entry.lottery.icon_name}
                    text={entry.lottery.name}
                    active={false}
                    onPress={() =>
                      navigateAndClose('lottery', {
                        lotteryId: entry.lottery._id,
                        name: entry.lottery.name,
                      })
                    }
                  />
                ))}
              </View>
            </View>
            <View style={styles.line} />
            {TopMenus.map((item) => (
              <DrawerItems
                key={item.navigateTo}
                name={item.navigateTo}
                icon={item.icon}
                text={item.title}
                active={activeRouteName === item.navigateTo}
                onPress={() => navigateAndClose(item.navigateTo)}
              />
            ))}
          </View>
          <View style={styles.bottomMenu}>
            <ThemeSwitcher />
            {BottomMenu.map((item) => (
              <DrawerItems
                key={item.navigateTo}
                name={item.navigateTo}
                icon={item.icon}
                text={item.title}
                active={activeRouteName === item.navigateTo}
                onPress={() => navigateAndClose(item.navigateTo)}
              />
            ))}
          </View>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

export default React.memo(SideBar);
