import { getApp } from "@react-native-firebase/app";
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  subscribeToTopic,
  unsubscribeFromTopic,
} from "@react-native-firebase/messaging";
import { Platform } from "react-native";

import * as Notifee from "./NotifeeService";
import { findChannelByDrawType, topicForDrawType } from "./notificationConstant";

type Unsubscribe = () => void;

const messaging = () => getMessaging(getApp());

export const ensureIOSPermission = async (): Promise<boolean> => {
  if (Platform.OS !== "ios") return true;
  const status = await requestPermission(messaging());
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
};

export const subscribe = async (drawTypeId: string): Promise<void> => {
  const topic = topicForDrawType(drawTypeId);
  if (!topic) return;
  await subscribeToTopic(messaging(), topic);
};

export const unsubscribe = async (drawTypeId: string): Promise<void> => {
  const topic = topicForDrawType(drawTypeId);
  if (!topic) return;
  await unsubscribeFromTopic(messaging(), topic);
};

export const fetchToken = async (): Promise<string | null> => {
  try {
    const token = await getToken(messaging());
    return token || null;
  } catch {
    return null;
  }
};

const displayRemoteMessage = async (
  msg: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> => {
  const drawTypeId = (msg.data?.drawTypeId as string | undefined) ?? "";
  const channel = findChannelByDrawType(drawTypeId);
  if (!channel) return;
  await Notifee.displayLocalNotification({
    title: msg.notification?.title ?? "New draw",
    body: msg.notification?.body ?? "",
    data: msg.data as Record<string, string> | undefined,
    channelId: channel.id,
  });
};

export const attachForegroundListener = (): Unsubscribe =>
  onMessage(messaging(), displayRemoteMessage);

export const attachTokenRefreshListener = (
  onRefresh: (token: string) => void,
): Unsubscribe => onTokenRefresh(messaging(), onRefresh);
