import { Message } from "discord.js";

export interface vcDataI {
    vcID: string;
    vcStartTime: Date;
    memberCount: number;
    maxMemberCount: number;
    logs: Array<string>;
    events: Array<vcEvent>;
    logPart?: Number;
    timezone: string;
    logMessage?: Message<true>;
}

export interface serverConfigI {
    language: string;
    timezone: string;
}

export interface serverDataI {
    serverID: string;
    serverName: string;
    memberCount: number;
    config: serverConfigI;
    joinTime?: Date;
}

export interface serverStatsI {
    recordedVoiceChats: number;
    avgVCLength: number;
    longestVCLength: number;
}

export interface userStatsI {
    vcJoins: number;
    avgVCLength: number;
    longestVCLength: number;
}

export interface vcEvent {
    action: string;
    data: string[];
    timestamp: Date;
}

export enum VCEventActions {
    VC_START = "VC_START",
    VC_END = "VC_END",

    USER_JOINED = "USER_JOINED",
    USER_LEFT = "USER_LEFT",
    USER_MUTED = "USER_MUTED",
    USER_UNMUTED = "USER_UNMUTED",
    USER_STARTED_STREAM = "USER_STARTED_STREAM",
    USER_ENDED_STREAM = "USER_ENDED_STREAM",
    USER_STARTED_WEBCAM = "USER_STARTED_WEBCAM",
    USER_ENDED_WEBCAM = "USER_ENDED_WEBCAM",
    USER_MOVED_CHANNELS = "USER_MOVED_CHANNELS",
}

export const defaultServerConfig: serverConfigI = {
    language: "en",
    timezone: "Europe/London",
};
