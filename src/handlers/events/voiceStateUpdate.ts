import { client } from "../../client";
import * as utils from "../../utils/utils";
import { sendToVCChat, updateLogMessage } from "../../services/log";
import pms from "ms-prettify";
import * as database from "../../database/database";
import { Events } from "discord.js";
import { defaultServerConfig } from "../../database/interface";
import { getLang, formatString } from "../../i18n/getLang";

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const server = await database.addServer({
        serverID: newState.guild.id,
        serverName: newState.guild.name,
        memberCount: newState.guild.memberCount,
        config: { ...defaultServerConfig }
    });
    const lang = getLang(server.config.language);

    const VCmembers = oldState.channel?.members ?? newState.channel?.members;
    if (!VCmembers) return;

    const membersVCCount = VCmembers.size;
    const vcID = oldState.channelId ?? newState.channelId;
    if (!vcID) return;

    const vcData = await database.getVoiceChannel(vcID);
    const vcChannel = newState.channel ?? oldState.channel;
    const vcStartTime = vcData?.vcStartTime ?? new Date();

    const logMsg = utils.generateLogMsg(lang, oldState, newState, vcStartTime, vcData?.timezone ?? server.config.timezone);
    if (!logMsg) return;

    if (vcData && utils.getLogLength(vcData.logs) > 4000) {
        const msg = await sendToVCChat(vcChannel, vcData);
        await vcData.clearLogs();
        await vcData.setLogMessage(msg);
    }

    // есле бот еще не знает о войсе
    if (!vcData && membersVCCount !== 0) {
        const voiceStartLog = utils.formatLogMsg(lang.VC_LOGS.VC_STARTED, vcStartTime, server.config.timezone);
        const VC = await database.addVoiceChannel({ vcID: vcID, vcStartTime: new Date(), timezone: server.config.timezone, memberCount: membersVCCount, logs: [voiceStartLog, logMsg] });

        const msg = await sendToVCChat(vcChannel, VC);
        await VC.setLogMessage(msg);
    }

    // есле войс закончился
    else if (membersVCCount === 0 && vcData && vcData?.memberCount !== 0 && vcData?.vcStartTime) {
        const voiceTime = new Date().getTime() - vcData.vcStartTime.getTime();
        await vcData.addLogLine(logMsg);
        updateLogMessage(vcData, formatString(lang.VC_LOGS.VC_ENDED, [ pms(voiceTime) ]));

        await vcData.delete();
    }

    else if (membersVCCount !== 0 && vcData && vcData?.memberCount !== 0) {
        await vcData.addLogLine(logMsg);
        updateLogMessage(vcData);
    }

    //console.log(voiceChats);
});