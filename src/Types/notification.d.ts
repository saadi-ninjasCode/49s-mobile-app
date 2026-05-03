type EnabledMap = Record<string, boolean>;
type Listener = (map: EnabledMap) => void;

type AuthPermissionState = "granted" | "denied" | "blocked" | "provisional";

interface DisplayPayload {
    title: string;
    body?: string;
    data?: Record<string, string>;
    channelId: string;
}

interface ChannelGroupDef {
    id: string;
    name: string;
}

interface ChannelDef {
    id: string;
    name: string;
    groupId: string;
    drawTypeId: string;
    importance: AndroidImportance;
    vibration: boolean;
}

interface DisplayLocalArgs {
    drawTypeId: string;
    title: string;
    body?: string;
    data?: Record<string, string>;
}