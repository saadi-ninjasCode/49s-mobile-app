import { AndroidImportance } from "@notifee/react-native";

export const NOTIFICATION_SMALL_ICON = "ic_notification";
export const NOTIFICATION_COLOR = "#253779";

export const STORAGE_KEYS = {
  PREFS: "@push:prefs",
  HAS_PROMPTED: "@push:has-prompted",
} as const;

export const CHANNEL_GROUPS: ChannelGroupDef[] = [
  { id: "group_49s", name: "49's", lotterySlug: "49s" },
];

export const CHANNELS: ChannelDef[] = [
  {
    id: "brunchtime",
    name: "Brunchtime",
    groupId: "group_49s",
    drawTypeId: "brunchtime",
    importance: AndroidImportance.HIGH,
    vibration: true,
  },
  {
    id: "lunchtime",
    name: "Lunchtime",
    groupId: "group_49s",
    drawTypeId: "lunchtime",
    importance: AndroidImportance.HIGH,
    vibration: true,
  },
  {
    id: "drivetime",
    name: "Drivetime",
    groupId: "group_49s",
    drawTypeId: "drivetime",
    importance: AndroidImportance.HIGH,
    vibration: true,
  },
  {
    id: "teatime",
    name: "Teatime",
    groupId: "group_49s",
    drawTypeId: "teatime",
    importance: AndroidImportance.HIGH,
    vibration: true,
  },
];

export const findChannelByDrawType = (drawTypeId: string): ChannelDef | undefined =>
  CHANNELS.find((c) => c.drawTypeId === drawTypeId);

export const findGroupById = (groupId: string): ChannelGroupDef | undefined =>
  CHANNEL_GROUPS.find((g) => g.id === groupId);

export const topicForDrawType = (drawTypeId: string): string | null => {
  const channel = findChannelByDrawType(drawTypeId);
  if (!channel) return null;
  const group = findGroupById(channel.groupId);
  if (!group) return null;
  return `${group.lotterySlug}_${channel.drawTypeId}`;
};
