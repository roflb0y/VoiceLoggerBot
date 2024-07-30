import { vcDataI, serverDataI, serverConfigI } from "./interface";
import { voiceChannelsModel, serversModel, logsHistoryModel } from "./schemas";
import * as log from "../utils/logger";
import { Message } from "discord.js";
import moment from "moment";

export async function getVoiceChannel(vcID: string): Promise<VoiceChannel | undefined> {
    const VC = await voiceChannelsModel.findOne({ vcID: vcID });
    if (VC === null) return undefined;

    return new VoiceChannel(VC);
};

export async function addVoiceChannel(vcData: vcDataI): Promise<VoiceChannel> {
    const VC = await getVoiceChannel(vcData.vcID);
    if (VC) return VC;

    log.debug("vcData", JSON.stringify(vcData));
    await new voiceChannelsModel(vcData).save();

    log.db(`STARTED NEW VC`);
    return new VoiceChannel(vcData);
};

export async function getServer(serverID: string): Promise<Server | undefined> {
    const server = await serversModel.findOne({ serverID: serverID });
    if (server === null) return undefined;

    return new Server(server);
};

export async function addServer(serverData: serverDataI) {
    const server = await getServer(serverData.serverID);
    if (server) return server;

    await new serversModel(serverData).save();

    log.db(`ADDED NEW SERVER: ${serverData.serverName}`);
    return new Server(serverData);
}

export class VoiceChannel {
    vcID: string
    vcStartTime: Date
    timezone: string
    memberCount: number
    maxMemberCount: number
    logs: Array<string>
    logPart: number
    logMessage: Message<true> | undefined

    constructor(vcData: any) {
        this.vcID = vcData.vcID;
        this.vcStartTime = vcData.vcStartTime;
        this.timezone = vcData.timezone;
        this.memberCount = vcData.memberCount;
        this.maxMemberCount = vcData.maxMemberCount;
        this.logs = vcData.logs;
        this.logPart = vcData.logPart;
        this.logMessage = vcData.logMessage ? (vcData.logMessage as Message<true>) : undefined;
    };

    async setLogMessage(msg: Message<true>): Promise<void> {
        await voiceChannelsModel.findOneAndUpdate({ vcID: this.vcID }, { "logMessage": msg.toJSON() }, { "returnDocument": "after" });
        this.logMessage = msg;
    };

    async addLogLine(logMsg: string): Promise<void> {
        const VC = await voiceChannelsModel.findOne({ vcID: this.vcID });
        if (!VC) return;

        VC.logs.push(logMsg);
        await VC.save();
        this.logs.push(logMsg);

        log.db(`ADDED LOG TO ${this.vcID}: ${logMsg}`);
    };

    async addPart(): Promise<void> {
        await voiceChannelsModel.findOneAndUpdate({ vcID: this.vcID }, { $inc: { "logPart": 1 } }, { "returnDocument": "after" });
        this.logPart++;
    };

    async updateMaxMembers(count: number): Promise<void> {
        const res = await voiceChannelsModel.findOneAndUpdate({ vcID: this.vcID }, { $max: { maxMemberCount: count } }, { "returnDocument": "after" });
    };

    async clearLogs(): Promise<void> {
        await voiceChannelsModel.findOneAndUpdate({ vcID: this.vcID }, { "logs": [] }, { "returnDocument": "after" });
        
        this.logs = [];
        log.db(`CLEARED LOGS: ${this.vcID}`);
    };

    async delete(): Promise<void> {
        await voiceChannelsModel.deleteOne({ vcID: this.vcID });
        log.db(`ENDED VC: ${this.vcID}`);
    };
};

export class Server {
    serverID: string
    serverName: string
    joinTime: Date
    memberCount: number
    config: serverConfigI

    constructor(serverData: any) {
        this.serverID = serverData.serverID;
        this.serverName = serverData.serverName;
        this.joinTime = serverData.joinTime;
        this.memberCount = serverData.memberCount;
        this.config = serverData.config as serverConfigI;
    }

    async setLanguage(lang: string) {
        await serversModel.findOneAndUpdate({ serverID: this.serverID }, { ["config.language"]: lang }, { "returnDocument": "after" });
        this.config.language = lang;

        log.db(`SET LANGUAGE TO "${lang}" FOR ${this.serverName}`);
    }

    async setTimezone(tz: string) {
        await serversModel.findOneAndUpdate({ serverID: this.serverID }, { ["config.timezone"]: tz }, { "returnDocument": "after" });
        this.config.timezone = tz;

        log.db(`SET TIMEZONE TO "${tz}" FOR ${this.serverName}`);
    }

    async addLogToHistory(vcData: vcDataI) {
        const time = moment();
        await new logsHistoryModel({
            serverId: this.serverID,
            vcID: vcData.vcID,
            vcStartTime: vcData.vcStartTime,
            vcLengthSeconds: moment.duration(time.diff(vcData.vcStartTime)).asSeconds(),
            timezone: vcData.timezone,
            maxMemberCount: vcData.maxMemberCount,
            logs: vcData.logs,
            logParts: vcData.logPart
        }).save()
        log.db(`SAVED VOICE ${vcData.vcID} LOGS FOR ${this.serverName}`);
    }
}