import { vcDataI } from "./interface";
import { voiceChannelsModel } from "./schemas";
import * as log from "../utils/logger";
import { Message } from "discord.js";
import { Model } from "mongoose";

export async function getVoiceChannel(vcID: string): Promise<VoiceChannel | undefined> {
    const VC = await voiceChannelsModel.findOne({ vcID: vcID });
    if (VC === null) return undefined;

    return new VoiceChannel(VC);
}

export async function addVoiceChannel(vcData: vcDataI): Promise<VoiceChannel> {
    const VC = await getVoiceChannel(vcData.vcID);
    if (VC) return VC;

    log.debug("vcData", JSON.stringify(vcData));
    const res = await new voiceChannelsModel(vcData).save();

    log.db(`STARTED NEW VC`);
    return new VoiceChannel(vcData);
}

export class VoiceChannel {
    vcID: string
    vcStartTime: Date
    memberCount: number
    logs: Array<string>
    logMessage: Message<true> | undefined

    constructor(vcData: any) {
        this.vcID = vcData.vcID;
        this.vcStartTime = vcData.vcStartTime;
        this.memberCount = vcData.memberCount;
        this.logs = vcData.logs;
        this.logMessage = vcData.logMessage ? (vcData.logMessage as Message<true>) : undefined;
    };

    async setLogMessage(msg: Message<true>): Promise<void> {
        await voiceChannelsModel.findOneAndUpdate({ vcID: this.vcID }, { "logMessage": msg.toJSON() }, { "returnDocument": "after" });
        this.logMessage = msg;
    }

    async addLogLine(logMsg: string): Promise<void> {
        const VC = await voiceChannelsModel.findOne({ vcID: this.vcID });
        if (!VC) return;

        VC.logs.push(logMsg);
        await VC.save();
        this.logs.push(logMsg);

        log.db(`ADDED LOG TO ${this.vcID}: ${logMsg}`);
    };

    async clearLogs(): Promise<void> {
        await voiceChannelsModel.findOneAndUpdate({ vcID: this.vcID }, { "logs": [] }, { "returnDocument": "after" });
        
        this.logs = [];
        log.db(`CLEARED LOGS: ${this.vcID}`);
    }

    async delete(): Promise<void> {
        await voiceChannelsModel.deleteOne({ vcID: this.vcID });
        log.db(`ENDED VC: ${this.vcID}`);
    };
}