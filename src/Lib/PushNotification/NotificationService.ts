import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

import * as Fcm from "./FcmService";
import * as Notifee from "./NotifeeService";
import {
  CHANNELS,
  CHANNEL_GROUPS,
  STORAGE_KEYS,
  findChannelByDrawType,
} from "./notificationConstant";

type EnabledMap = Record<string, boolean>;
type Listener = (map: EnabledMap) => void;

let enabledMap: EnabledMap = {};
let prefsHydrated = false;
const listeners = new Set<Listener>();

const isEnabledMap = (value: unknown): value is EnabledMap => {
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).every(
    (v) => typeof v === "boolean",
  );
};

const seedAllEnabled = (): EnabledMap => {
  const seed: EnabledMap = {};
  for (const channel of CHANNELS) seed[channel.drawTypeId] = true;
  return seed;
};

const persistPrefs = (next: EnabledMap): void => {
  AsyncStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(next)).catch(() => { });
};

const notify = (): void => {
  for (const listener of listeners) listener(enabledMap);
};

const hydratePrefs = async (): Promise<{ map: EnabledMap; firstRun: boolean }> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.PREFS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (isEnabledMap(parsed)) return { map: parsed, firstRun: false };
    } catch {
      /* fall through to seed */
    }
  }
  return { map: seedAllEnabled(), firstRun: true };
};

const getHasPrompted = async (): Promise<boolean> => {
  const flag = await AsyncStorage.getItem(STORAGE_KEYS.HAS_PROMPTED);
  return flag === "true";
};

const setHasPrompted = async (): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.HAS_PROMPTED, "true");
};

const ensureChannels = async (): Promise<void> => {
  for (const group of CHANNEL_GROUPS) await Notifee.createChannelGroup(group);
  for (const channel of CHANNELS) await Notifee.createChannel(channel);
};

const syncTopicsToPrefs = async (): Promise<void> => {
  for (const channel of CHANNELS) {
    const enabled = enabledMap[channel.drawTypeId] === true;
    try {
      if (enabled) await Fcm.subscribe(channel.drawTypeId);
      else await Fcm.unsubscribe(channel.drawTypeId);
    } catch {
      /* network or token transient — next bootstrap reconciles */
    }
  }
};

let detachForeground: (() => void) | null = null;

export const bootstrap = async (): Promise<void> => {
  const { map, firstRun } = await hydratePrefs();
  enabledMap = map;
  prefsHydrated = true;
  notify();

  const hasPrompted = await getHasPrompted();
  let state = await Notifee.getPermissionState(hasPrompted);

  if (state === "denied" && !hasPrompted) {
    state = await Notifee.requestPermission(hasPrompted);
    await setHasPrompted();
  }

  if (state !== "granted" && state !== "provisional") return;

  await ensureChannels();

  const iosReady = await Fcm.ensureIOSPermission();
  if (!iosReady) return;

  if (firstRun) persistPrefs(enabledMap);

  await syncTopicsToPrefs();

  if (!detachForeground) detachForeground = Fcm.attachForegroundListener();
};

const findBlockedGroup = async (): Promise<string | null> => {
  for (const group of CHANNEL_GROUPS) {
    if (await Notifee.isChannelGroupBlocked(group.id)) return group.id;
  }
  return null;
};

const promptOpenSettings = (
  title: string,
  message: string,
  onOpen: () => void,
): void => {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Open Settings", onPress: onOpen },
  ]);
};

const isAllowedState = (state: AuthPermissionState): boolean =>
  state === "granted" || state === "provisional";

const ensureAppPermission = async (): Promise<boolean> => {
  const hasPrompted = await getHasPrompted();
  let state = await Notifee.getPermissionState(hasPrompted);

  if (!isAllowedState(state) && !hasPrompted) {
    state = await Notifee.requestPermission(hasPrompted);
    await setHasPrompted();
  }

  if (!isAllowedState(state)) {
    promptOpenSettings(
      "Notifications are off",
      "Turn on notifications in Settings to receive draw alerts.",
      Notifee.openAppNotificationSettings,
    );
    return false;
  }

  await ensureChannels();
  return true;
};

const ensureChannelAllowed = async (channel: ChannelDef): Promise<boolean> => {
  if (await Notifee.isChannelGroupBlocked(channel.groupId)) {
    promptOpenSettings(
      "A notification category is off",
      `Notifications for ${channel.name} are turned off at the category level. Open Settings to enable them.`,
      () => Notifee.openChannelGroupSettings(channel.groupId),
    );
    return false;
  }
  if (await Notifee.isChannelBlocked(channel.id)) {
    promptOpenSettings(
      `${channel.name} notifications are off`,
      `Open Settings to turn on ${channel.name} notifications.`,
      () => Notifee.openChannelSettings(channel.id),
    );
    return false;
  }
  return true;
};

const ensureNoBlockedGroup = async (): Promise<boolean> => {
  const blockedGroupId = await findBlockedGroup();
  if (!blockedGroupId) return true;
  promptOpenSettings(
    "A notification category is off",
    "One of your notification categories is turned off. Open Settings to enable it.",
    () => Notifee.openChannelGroupSettings(blockedGroupId),
  );
  return false;
};

export const ensurePermissionOrPromptSettings = async (
  drawTypeId?: string,
): Promise<boolean> => {
  if (!(await ensureAppPermission())) return false;

  const channel = drawTypeId ? findChannelByDrawType(drawTypeId) : null;
  if (channel) return ensureChannelAllowed(channel);

  return ensureNoBlockedGroup();
};

export const getEnabledMap = (): EnabledMap => ({ ...enabledMap });

export const isEnabled = (drawTypeId: string): boolean =>
  enabledMap[drawTypeId] === true;

export const setDrawTypeEnabled = async (
  drawTypeId: string,
  enabled: boolean,
): Promise<void> => {
  enabledMap = { ...enabledMap, [drawTypeId]: enabled };
  persistPrefs(enabledMap);
  notify();
  try {
    if (enabled) await Fcm.subscribe(drawTypeId);
    else await Fcm.unsubscribe(drawTypeId);
  } catch {
    /* local pref is the source of truth; bootstrap reconciles */
  }
};

export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  if (prefsHydrated) listener(enabledMap);
  return () => {
    listeners.delete(listener);
  };
};

export const openAppNotificationSettings = (): void => {
  Notifee.openAppNotificationSettings();
};

export const openChannelSettings = (drawTypeId: string): void => {
  const channel = findChannelByDrawType(drawTypeId);
  if (!channel) {
    Notifee.openAppNotificationSettings();
    return;
  }
  Notifee.openChannelSettings(channel.id);
};

export const openChannelGroupSettings = (groupId: string): void => {
  Notifee.openChannelGroupSettings(groupId);
};

interface DisplayLocalArgs {
  drawTypeId: string;
  title: string;
  body?: string;
  data?: Record<string, string>;
}

export const displayLocal = async ({
  drawTypeId,
  title,
  body,
  data,
}: DisplayLocalArgs): Promise<void> => {
  const channel = findChannelByDrawType(drawTypeId);
  if (!channel) return;
  await Notifee.displayLocalNotification({
    title,
    body,
    data,
    channelId: channel.id,
  });
};
