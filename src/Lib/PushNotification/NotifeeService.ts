import notifee, {
  AuthorizationStatus,
  Event,
} from "@notifee/react-native";
import { Platform } from "react-native";

import {
  NOTIFICATION_COLOR,
  NOTIFICATION_SMALL_ICON,
} from "./notificationConstant";

interface DisplayPayload {
  title: string;
  body?: string;
  data?: Record<string, string>;
  channelId: string;
}

const mapAuthStatus = (
  status: AuthorizationStatus,
  hasPrompted: boolean,
): AuthPermissionState => {
  if (status === AuthorizationStatus.AUTHORIZED) return "granted";
  if (status === AuthorizationStatus.PROVISIONAL) return "provisional";
  if (status === AuthorizationStatus.DENIED) {
    return hasPrompted ? "blocked" : "denied";
  }
  return "denied";
};

export const requestPermission = async (
  hasPrompted: boolean,
): Promise<AuthPermissionState> => {
  const settings = await notifee.requestPermission();
  return mapAuthStatus(settings.authorizationStatus, hasPrompted);
};

export const getPermissionState = async (
  hasPrompted: boolean,
): Promise<AuthPermissionState> => {
  const settings = await notifee.getNotificationSettings();
  return mapAuthStatus(settings.authorizationStatus, hasPrompted);
};

export const createChannelGroup = async (group: ChannelGroupDef): Promise<void> => {
  if (Platform.OS !== "android") return;
  await notifee.createChannelGroup({ id: group.id, name: group.name });
};

export const createChannel = async (channel: ChannelDef): Promise<void> => {
  if (Platform.OS !== "android") return;
  await notifee.createChannel({
    id: channel.id,
    name: channel.name,
    groupId: channel.groupId,
    lightColor: NOTIFICATION_COLOR,
    importance: channel.importance,
    vibration: channel.vibration,
  });
};

export const displayLocalNotification = async ({
  title,
  body,
  data,
  channelId,
}: DisplayPayload): Promise<void> => {
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId,
      smallIcon: NOTIFICATION_SMALL_ICON,
      color: NOTIFICATION_COLOR,
      pressAction: { id: "default" },
    },
  });
};

export const isChannelBlocked = async (channelId: string): Promise<boolean> => {
  if (Platform.OS !== "android") return false;
  const channel = await notifee.getChannel(channelId);
  return channel?.blocked === true;
};

export const isChannelGroupBlocked = async (groupId: string): Promise<boolean> => {
  if (Platform.OS !== "android") return false;
  const group = await notifee.getChannelGroup(groupId);
  return group?.blocked === true;
};

export const openAppNotificationSettings = (): void => {
  notifee.openNotificationSettings();
};

export const openChannelSettings = (channelId: string): void => {
  if (Platform.OS !== "android") {
    notifee.openNotificationSettings();
    return;
  }
  notifee.openNotificationSettings(channelId);
};

export const openChannelGroupSettings = (_groupId: string): void => {
  notifee.openNotificationSettings();
};

export const onForegroundEvent = (
  observer: (event: Event) => void,
): (() => void) => notifee.onForegroundEvent(observer);
