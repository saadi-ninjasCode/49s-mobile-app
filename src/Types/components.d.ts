declare global {
  // ---- Atom-level / generic UI components ----

  interface CheckboxProps {
    readonly checked: boolean;
    readonly onPress?: (event: import("react-native").GestureResponderEvent) => void;
  }

  interface SpinnerProps {
    readonly backColor?: string;
    readonly spinnerColor?: string;
    readonly size?: "small" | "large";
  }

  interface TextDefaultProps {
    readonly textColor?: string;
    readonly bold?: boolean;
    readonly center?: boolean;
    readonly right?: boolean;
    readonly small?: boolean;
    readonly H1?: boolean;
    readonly H2?: boolean;
    readonly H3?: boolean;
    readonly H4?: boolean;
    readonly H5?: boolean;
    readonly uppercase?: boolean;
    readonly lineOver?: boolean;
    readonly numberOfLines?: number;
    readonly style?: import("react-native").StyleProp<import("react-native").TextStyle>;
    readonly children: import("react").ReactNode;
  }

  interface TextErrorProps {
    readonly text: string;
    readonly textColor?: string;
    readonly mainColor?: string;
  }

  interface DatePickerFieldProps {
    readonly value: Date | null;
    readonly onSelect: (date: Date) => void;
    readonly placeholder?: string;
    readonly maximumDate?: Date;
    readonly minimumDate?: Date;
  }

  interface CounterProps {
    readonly hour: number;
    readonly minute: number;
    readonly timeZone: string;
    readonly latestDrawDate: number | null;
  }

  // ---- ListState components ----

  interface ErrorViewProps {
    readonly message?: string;
    readonly buttonLabel?: string;
    readonly onRetry: () => void;
  }

  interface EmptyViewProps {
    readonly message?: string;
    readonly buttonLabel?: string;
    readonly onRetry?: () => void;
  }

  interface InlineErrorBannerProps {
    readonly message?: string;
    readonly onRetry: () => void;
  }

  // ---- Drawer / SideBar / Generator sub-components ----

  interface DrawerItemsProps {
    readonly name?: string;
    readonly icon: string;
    readonly text: string;
    readonly active?: boolean;
    readonly onPress: () => void;
  }

  interface NotificationCardProps {
    readonly name: string;
    readonly checked: boolean;
    readonly onToggle: () => void;
  }

  interface BallsProps {
    readonly name: string;
    readonly color: string;
    readonly array: ReadonlyArray<BallStat>;
  }

  interface TabPillProps {
    readonly mode: "luckyDip" | "pick3";
    readonly active: boolean;
    readonly disabled: boolean;
    readonly label: string;
    readonly activeColor: string;
    readonly inactiveColor: string;
    readonly onSelect: (mode: "luckyDip" | "pick3") => void;
  }

  interface CountPillProps {
    readonly value: number;
    readonly active: boolean;
    readonly disabled: boolean;
    readonly activeColor: string;
    readonly inactiveColor: string;
    readonly onSelect: (value: number) => void;
  }

  // ---- Internal data shapes for components ----

  // Used by SideBar to declare its menu rows
  interface MenuConfig {
    readonly title: string;
    readonly icon: string;
    readonly navigateTo: string;
  }

  // Used by ThemeSwitcher
  interface ThemeSwitcherOption {
    readonly mode: import("../theme/theme").ThemeMode;
    readonly label: string;
    readonly renderIcon: (size: number, color: string) => import("react").ReactNode;
  }
}

export {};
