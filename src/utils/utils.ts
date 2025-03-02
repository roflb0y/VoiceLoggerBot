import { VoiceState } from "discord.js";
import { getLang, formatString } from "../i18n/getLang";
import { i18nI } from "../i18n/interface";
import moment from "moment";
import { vcEvent, VCEventActions } from "../database/interface";

export function getLogDate(timezone?: string) {
    const date = new Date();
    return `${date.toLocaleString("ru-RU", { timeZone: timezone })}`;
}

export function getDate() {
    const date = new Date();
    return `${date.toLocaleDateString()}`;
}

export function getAvg(list: number[]) {
    const sum = list.reduce((a, b) => a + b, 0);
    return (sum / list.length) || 0;
}

export function getDatesDiffString(startTime: Date, endTime: Date): string {
    let secsDiff = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    let minutesDiff = Math.floor(secsDiff / 60);
    let hoursDiff = Math.floor(minutesDiff / 60);
    let daysDiff = Math.floor(hoursDiff / 24);

    secsDiff = secsDiff - minutesDiff * 60;
    minutesDiff = minutesDiff - hoursDiff * 60;
    hoursDiff = hoursDiff - daysDiff * 24;

    const secsDiffString = `${secsDiff < 10 ? "0" : ""}${secsDiff}`;
    const minutesDiffString = `${minutesDiff < 10 ? "0" : ""}${minutesDiff}`;
    const hoursDiffString = `${hoursDiff < 10 ? "0" : ""}${hoursDiff}`;
    const daysDiffString = `${daysDiff < 10 ? "0" : ""}${daysDiff}`;

    //return "a";
    return `${
        daysDiff > 0 ? daysDiffString + ":" : ""
    }${hoursDiffString}:${minutesDiffString}:${secsDiffString}`;
}

export function formatLogMsg(
    msg: string,
    vcStartTime: Date,
    timezone: string
): string {
    const vcTimeString = getDatesDiffString(vcStartTime, new Date());
    return `\`${getLogDate(timezone)}, ${vcTimeString}\` ${msg}`;
}

export function getLogMessage(
    lang: i18nI,
    event: vcEvent,
    vcStartTime: Date,
    timezone: string
) {
    const logString = formatString(lang.VC_LOGS[event.action], event.data);
    return formatLogMsg(logString, vcStartTime, timezone);
}

export function getEvent(
    oldState: VoiceState,
    newState: VoiceState,
    timestamp: Date
): vcEvent | undefined {
    const userJoinedVC = !oldState.channel && newState.channel;
    const userLeftVC = oldState.channel && !newState.channel;
    const userMuted = !oldState.selfMute && newState.selfMute;
    const userUnmuted = oldState.selfMute && !newState.selfMute;
    const userStartedStreaming = !oldState.streaming && newState.streaming;
    const userEndedStreaming = oldState.streaming && !newState.streaming;
    const userStartedWebcam = !oldState.selfVideo && newState.selfVideo;
    const userEndedWebcam = oldState.selfVideo && !newState.selfVideo;
    const userMovedChannels = oldState.channel?.id !== newState.channel?.id;

    if (userJoinedVC) {
        return {
            action: VCEventActions.USER_JOINED,
            data: [newState.member?.user.username ?? "\`?\`"],
            timestamp: timestamp,
        };
    } else if (userLeftVC) {
        return {
            action: VCEventActions.USER_LEFT,
            data: [newState.member?.user.username ?? "\`?\`"],
            timestamp: timestamp,
        };
    } else if (userMuted) {
        return {
            action: VCEventActions.USER_MUTED,
            data: [newState.member?.user.username ?? "\`?\`"],
            timestamp: timestamp,
        };
    } else if (userUnmuted) {
        return {
            action: VCEventActions.USER_UNMUTED,
            data: [newState.member?.user.username ?? "\`?\`"],
            timestamp: timestamp,
        };
    } else if (userStartedStreaming) {
        return {
            action: VCEventActions.USER_STARTED_STREAM,
            data: [newState.member?.user.username ?? "\`?\`"],
            timestamp: timestamp,
        };
    } else if (userEndedStreaming) {
        return {
            action: VCEventActions.USER_ENDED_STREAM,
            data: [newState.member?.user.username ?? "\`?\`"],
            timestamp: timestamp,
        };
    } else if (userStartedWebcam) {
        return {
            action: VCEventActions.USER_STARTED_WEBCAM,
            data: [newState.member?.user.username ?? "\`?\`"],
            timestamp: timestamp,
        };
    } else if (userEndedWebcam) {
        return {
            action: VCEventActions.USER_ENDED_WEBCAM,
            data: [newState.member?.user.username ?? "\`?\`"],
            timestamp: timestamp,
        };
    } else if (userMovedChannels) {
        return {
            action: VCEventActions.USER_MOVED_CHANNELS,
            data: [
                newState.member?.user.username ?? "\`?\`",
                oldState.channel?.name ?? "\`?\`",
                newState.channel?.name ?? "\`?\`",
            ],
            timestamp: timestamp,
        };
    } else {
        return undefined;
    }

    //return formatLogMsg(eventMsg, vcStartTime, timezone);
}

export function getLogLength(vcLogs: string[]) {
    return vcLogs.join("\n").length;
}

export function formatSeconds(s: number) {
    return moment.utc(s * 1000).format("HH:mm:ss");
}
