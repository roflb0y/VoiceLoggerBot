import { Message } from "discord.js";

export interface vcDataI {
    vcID: string,
    vcStartTime: Date,
    memberCount: number, 
    logs: Array<string>,
    logMessage?: Message<true>
}