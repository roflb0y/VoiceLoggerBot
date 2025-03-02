import {
    vcDataI,
    serverDataI,
    serverConfigI,
    serverStatsI,
    vcEvent,
    userStatsI,
    VCEventActions,
} from "./interface";
import { voiceChannelsModel, serversModel, logsHistoryModel } from "./schemas";
import * as log from "../utils/logger";
import { getAvg } from "../utils/utils";
import { Message } from "discord.js";
import moment from "moment";

export async function getVoiceChannel(
    vcID: string
): Promise<VoiceChannel | undefined> {
    const VC = await voiceChannelsModel.findOne({ vcID: vcID });
    if (VC === null) return undefined;

    return new VoiceChannel(VC);
}

export async function addVoiceChannel(vcData: vcDataI): Promise<VoiceChannel> {
    const VC = await getVoiceChannel(vcData.vcID);
    if (VC) return VC;

    log.debug("vcData", JSON.stringify(vcData));
    await new voiceChannelsModel(vcData).save();

    log.db(`STARTED NEW VC`);
    return new VoiceChannel(vcData);
}

export async function getServer(serverID: string): Promise<Server | undefined> {
    const server = await serversModel.findOne({ serverID: serverID });
    if (server === null) return undefined;

    return new Server(server);
}

export async function addServer(serverData: serverDataI) {
    const server = await getServer(serverData.serverID);
    if (server) return server;

    await new serversModel(serverData).save();

    log.db(`ADDED NEW SERVER: ${serverData.serverName}`);
    return new Server(serverData);
}

export class VoiceChannel {
    vcID: string;
    vcStartTime: Date;
    timezone: string;
    memberCount: number;
    maxMemberCount: number;
    logs: Array<string>;
    events: Array<vcEvent>;
    logPart?: number;
    logMessage: Message<true> | undefined;

    constructor(vcData: vcDataI) {
        this.vcID = vcData.vcID;
        this.vcStartTime = vcData.vcStartTime;
        this.timezone = vcData.timezone;
        this.memberCount = vcData.memberCount;
        this.maxMemberCount = vcData.maxMemberCount;
        this.logs = vcData.logs;
        this.events = vcData.events;
        this.logPart = Number(vcData.logPart) ?? undefined;
        this.logMessage = vcData.logMessage
            ? (vcData.logMessage as Message<true>)
            : undefined;
    }

    async setLogMessage(msg: Message<true>): Promise<void> {
        await voiceChannelsModel.findOneAndUpdate(
            { vcID: this.vcID },
            { logMessage: msg.toJSON() },
            { returnDocument: "after" }
        );
        this.logMessage = msg;
    }

    async addLogLine(logMsg: string): Promise<void> {
        const VC = await voiceChannelsModel.findOne({ vcID: this.vcID });
        if (!VC) return;

        VC.logs.push(logMsg);
        await VC.save();
        this.logs.push(logMsg);

        log.db(`ADDED LOG TO ${this.vcID}: ${logMsg}`);
    }

    async addVCEvent(event: vcEvent): Promise<void> {
        const VC = await voiceChannelsModel.findOne({ vcID: this.vcID });
        if (!VC) return;

        VC.events.push(event);
        await VC.save();
        this.events.push(event);

        log.db(`ADDED EVENT TO ${this.vcID}: ${JSON.stringify(event)}`);
    }

    async addPart(): Promise<void> {
        await voiceChannelsModel.findOneAndUpdate(
            { vcID: this.vcID },
            { $inc: { logPart: 1 } },
            { returnDocument: "after" }
        );
        if (this.logPart) this.logPart++;
    }

    async updateMaxMembers(count: number): Promise<void> {
        const res = await voiceChannelsModel.findOneAndUpdate(
            { vcID: this.vcID },
            { $max: { maxMemberCount: count } },
            { returnDocument: "after" }
        );
    }

    async clearLogs(): Promise<void> {
        await voiceChannelsModel.findOneAndUpdate(
            { vcID: this.vcID },
            { logs: [] },
            { returnDocument: "after" }
        );

        this.logs = [];
        log.db(`CLEARED LOGS: ${this.vcID}`);
    }

    async delete(): Promise<void> {
        await voiceChannelsModel.deleteOne({ vcID: this.vcID });
        log.db(`ENDED VC: ${this.vcID}`);
    }
}

export class Server {
    serverID: string;
    serverName: string;
    joinTime: Date;
    memberCount: number;
    config: serverConfigI;

    constructor(serverData: any) {
        this.serverID = serverData.serverID;
        this.serverName = serverData.serverName;
        this.joinTime = serverData.joinTime;
        this.memberCount = serverData.memberCount;
        this.config = serverData.config as serverConfigI;
    }

    async setLanguage(lang: string) {
        await serversModel.findOneAndUpdate(
            { serverID: this.serverID },
            { ["config.language"]: lang },
            { returnDocument: "after" }
        );
        this.config.language = lang;

        log.db(`SET LANGUAGE TO "${lang}" FOR ${this.serverName}`);
    }

    async setTimezone(tz: string) {
        await serversModel.findOneAndUpdate(
            { serverID: this.serverID },
            { ["config.timezone"]: tz },
            { returnDocument: "after" }
        );
        this.config.timezone = tz;

        log.db(`SET TIMEZONE TO "${tz}" FOR ${this.serverName}`);
    }

    async addLogToHistory(vcData: vcDataI) {
        const time = moment();
        await new logsHistoryModel({
            serverId: this.serverID,
            vcID: vcData.vcID,
            vcStartTime: vcData.vcStartTime,
            vcLengthSeconds: moment
                .duration(time.diff(vcData.vcStartTime))
                .asSeconds(),
            timezone: vcData.timezone,
            maxMemberCount: vcData.maxMemberCount,
            //logs: vcData.logs,
            events: vcData.events,
            logParts: vcData.logPart,
        }).save();
        log.db(`SAVED VOICE ${vcData.vcID} LOGS FOR ${this.serverName}`);
    }
}

export class Stats {
    async getServerStats(server: Server): Promise<serverStatsI> {
        const avgVCLength = await logsHistoryModel.aggregate([
            { $match: { serverId: server.serverID } },
            { $group: { _id: "$item", avgTime: { $avg: "$vcLengthSeconds" } } },
        ]);

        const recordedVoiceChats = await logsHistoryModel
            .find({ serverId: server.serverID })
            .countDocuments();
        const longestVC = await logsHistoryModel
            .find({ serverId: server.serverID })
            .sort({ vcLengthSeconds: -1 })
            .limit(1);

        return {
            avgVCLength: Math.floor(avgVCLength[0]?.avgTime) ?? 0,
            recordedVoiceChats: recordedVoiceChats,
            longestVCLength: Math.floor(longestVC[0]?.vcLengthSeconds) ?? 0,
        };
    }

    async getUserStats(server: Server, username: string): Promise<userStatsI> {
        const vcJoinActivity = await logsHistoryModel.aggregate([
            {
                $match: {
                    serverId: server.serverID,
                    events: {
                        $ne: null,
                    },
                },
            },
            {
                $unwind: {
                    path: "$events",
                },
            },
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                {
                                    "events.action": "USER_JOINED",
                                    "events.data": [username],
                                },
                                {
                                    "events.action": "USER_LEFT",
                                    "events.data": [username],
                                },
                            ],
                        },
                    ],
                },
            },
            {
                $sort: {
                    "events.timestamp": 1,
                },
            },
        ]);

        let lastJoin: Date | undefined;
        let vcLenghts: { vcLength: number; date: Date }[] = [];

        for (const [index, event] of vcJoinActivity.entries()) {
            if (
                event.events.action === VCEventActions.USER_JOINED &&
                !lastJoin
            ) {
                lastJoin = event.events.timestamp;
            } else if (
                event.events.action === VCEventActions.USER_LEFT &&
                lastJoin
            ) {
                const vcLength = Math.floor(
                    (event.events.timestamp.getTime() - lastJoin.getTime()) /
                        1000
                );
                vcLenghts.push({ vcLength: vcLength, date: lastJoin });

                lastJoin = undefined;
            }
        }

        //console.log(vcLenghts);

        if (vcLenghts.length === 0) {
            return {
                vcJoins: 0,
                avgVCLength: 0,
                longestVCLength: 0,
            };
        }

        const avgVCLength = getAvg(vcLenghts.map((item) => item.vcLength));
        const longestVCLength = vcLenghts.sort((a, b) => b.vcLength - a.vcLength)[0].vcLength;

        const vcJoinsCount = vcJoinActivity.filter(
            (event) => event.events.action === VCEventActions.USER_JOINED
        ).length;

        return {
            vcJoins: vcJoinsCount ?? 0,
            avgVCLength: avgVCLength ?? 0,
            longestVCLength: longestVCLength ?? 0,
        };
    }
}
