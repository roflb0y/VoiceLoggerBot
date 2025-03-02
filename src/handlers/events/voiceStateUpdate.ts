import { client } from "../../client";
import * as utils from "../../utils/utils";
import { sendToVCChat, updateLogMessage } from "../../services/log";
import pms from "ms-prettify";
import * as database from "../../database/database";
import { Events, VoiceState } from "discord.js";
import {
    defaultServerConfig,
    serverDataI,
    vcEvent,
    VCEventActions,
} from "../../database/interface";
import { getLang, formatString } from "../../i18n/getLang";
import { i18nI } from "../../i18n/interface";
import { deleteLogMessage } from "../../services/sendApi";

async function crossChannelLog(
    lang: i18nI,
    server: serverDataI,
    newState: VoiceState,
    vcStartLog: string,
    event: vcEvent,
    timestamp: Date
) {
    if (!newState.channelId) return;

    const otherVCData = await database.getVoiceChannel(newState.channelId);

    //console.log(otherVCData);

    if (!otherVCData) {
        const otherVC = await database.addVoiceChannel({
            vcID: newState.channelId,
            vcStartTime: timestamp,
            timezone: server.config.timezone,
            memberCount: 1,
            maxMemberCount: 1,
            logs: [
                vcStartLog,
                utils.getLogMessage(
                    lang,
                    event,
                    timestamp,
                    server.config.timezone
                ),
            ],
            events: [
                {
                    action: VCEventActions.VC_START,
                    data: [],
                    timestamp: timestamp,
                },
                event,
            ],
        });

        const msg = await sendToVCChat(lang, newState.channel, otherVC);
        await otherVC.setLogMessage(msg);
    } else {
        await otherVCData.updateMaxMembers(newState.channel?.members.size ?? 0);
        await otherVCData.addVCEvent(event);
        await otherVCData.addLogLine(
            utils.getLogMessage(
                lang,
                event,
                otherVCData.vcStartTime,
                otherVCData.timezone
            )
        );
        updateLogMessage(lang, otherVCData, newState.channel);
    }
}

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const server = await database.addServer({
        serverID: newState.guild.id,
        serverName: newState.guild.name,
        memberCount: newState.guild.memberCount,
        config: { ...defaultServerConfig },
    });
    const lang = getLang(server.config.language);
    const timestamp = new Date();

    const VCmembers = oldState.channel?.members ?? newState.channel?.members;
    if (!VCmembers) return;

    const membersVCCount = VCmembers.size;
    const vcID = oldState.channelId ?? newState.channelId;
    if (!vcID) return;

    const vcData = await database.getVoiceChannel(vcID);
    const vcChannel = newState.channel ?? oldState.channel;
    const vcStartTime = vcData?.vcStartTime ?? new Date();

    if (vcData && utils.getLogLength(vcData.logs) > 3500) {
        const msg = await sendToVCChat(lang, vcChannel, vcData);
        await vcData.clearLogs();
        await vcData.addPart();
        await vcData.setLogMessage(msg);
    }

    const vcStartEvent = {
        action: VCEventActions.VC_START,
        data: [],
        timestamp: timestamp,
    };
    const vcStartLog = utils.formatLogMsg(
        lang.VC_LOGS.VC_START,
        vcStartTime,
        server.config.timezone
    );
    const event = {
        action: VCEventActions.USER_JOINED,
        data: [newState.member?.user.username ?? "`?`"],
        timestamp: timestamp,
    };

    // есле бот еще не знает о войсе
    if (!vcData && membersVCCount !== 0) {
        const VC = await database.addVoiceChannel({
            vcID: vcID,
            vcStartTime: vcStartTime,
            timezone: server.config.timezone,
            memberCount: membersVCCount,
            maxMemberCount: membersVCCount,
            logs: [
                vcStartLog,
                utils.getLogMessage(
                    lang,
                    event,
                    timestamp,
                    server.config.timezone
                ),
            ],
            events: [vcStartEvent, event],
        });

        const msg = await sendToVCChat(lang, vcChannel, VC);
        await VC.setLogMessage(msg);
    }

    // есле войс закончился
    else if (
        membersVCCount === 0 &&
        vcData &&
        vcData?.memberCount !== 0 &&
        vcData?.vcStartTime
    ) {
        const event = utils.getEvent(oldState, newState, timestamp);
        if (event) {
            await vcData.addVCEvent(event);
            await vcData.addLogLine(
                utils.getLogMessage(lang, event, vcStartTime, vcData.timezone)
            );
        }

        if (
            event?.action === VCEventActions.USER_MOVED_CHANNELS &&
            newState.channelId
        ) {
            crossChannelLog(
                lang,
                server,
                newState,
                vcStartLog,
                event,
                timestamp
            );
        }

        const voiceTime = new Date().getTime() - vcData.vcStartTime.getTime();

        const newLogMessage = await updateLogMessage(
            lang,
            vcData,
            vcChannel,
            formatString(lang.VC_LOGS.VC_END, [pms(voiceTime)])
        );

        if (newLogMessage) await vcData.setLogMessage(newLogMessage);

        await server.addLogToHistory(vcData);
        await vcData.delete();
    } else if (membersVCCount !== 0 && vcData && vcData?.memberCount !== 0) {
        await vcData.updateMaxMembers(membersVCCount);

        const event = utils.getEvent(oldState, newState, timestamp);
        if (!event) return;

        if (
            event?.action === VCEventActions.USER_MOVED_CHANNELS &&
            newState.channelId
        ) {
            crossChannelLog(
                lang,
                server,
                newState,
                vcStartLog,
                event,
                timestamp
            );
        }

        await vcData.addVCEvent(event);
        await vcData.addLogLine(
            utils.getLogMessage(lang, event, vcStartTime, vcData.timezone)
        );
        updateLogMessage(lang, vcData, vcChannel);
    }

    //console.log(voiceChats);
});
