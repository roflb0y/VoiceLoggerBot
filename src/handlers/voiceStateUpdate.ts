import { client } from "../client";
import * as utils from "../utils/utils";
import { sendToVCChat, updateLogMessage } from "../services/log";
import pms from "ms-prettify";
import * as database from "../database/database";
import { Events } from "discord.js";

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const VCmembers = oldState.channel?.members ?? newState.channel?.members;
    if (!VCmembers) return;

    const membersVCCount = VCmembers.size;
    const vcID = oldState.channelId ?? newState.channelId;
    if (!vcID) return;

    const vcData = await database.getVoiceChannel(vcID);
    const vcStartTime = vcData?.vcStartTime ?? new Date();

    const logMsg = utils.generateLogMsg(oldState, newState, vcStartTime);
    if (!logMsg) return;

    if (vcData && utils.getLogLength(vcData.logs) > 4000) {
        const msg = await sendToVCChat(newState, vcData);

        await vcData.setLogMessage(msg);
    }

    // есле бот еще не знает о войсе
    if (!vcData && membersVCCount !== 0) {
        const VC = await database.addVoiceChannel({ vcID: vcID, vcStartTime: new Date(), memberCount: membersVCCount, logs: [logMsg] });

        const msg = await sendToVCChat(newState, VC);
        await VC.setLogMessage(msg);
    }

    // есле войс закончился
    else if (membersVCCount === 0 && vcData && vcData?.memberCount !== 0 && vcData?.vcStartTime) {
        const voiceTime = new Date().getTime() - vcData.vcStartTime.getTime();
        await vcData.addLogLine(logMsg);
        updateLogMessage(vcData, `Войс закончился! Он длился ${pms(voiceTime)}`);

        await vcData.delete();
    }

    else if (membersVCCount !== 0 && vcData && vcData?.memberCount !== 0) {
        await vcData.addLogLine(logMsg);
        updateLogMessage(vcData);
    }

    //console.log(voiceChats);
});