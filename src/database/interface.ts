import { Message } from "discord.js";

export interface vcDataI {
    vcID: string,
    vcStartTime: Date,
    memberCount: number,
    maxMemberCount: number,
    logs: Array<string>,
    logPart?: Number,
    timezone: string,
    logMessage?: Message<true>
}

export interface serverConfigI {
    language: string,
    timezone: string
}

export interface serverDataI {
    serverID: string,
    serverName: string,
    memberCount: number,
    config: serverConfigI,
    joinTime?: Date,
}

export const defaultServerConfig: serverConfigI = {
    language: "en",
    timezone: "Europe/London"
}