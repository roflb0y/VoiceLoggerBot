import { VoiceState } from "discord.js";
import { getLang, formatString } from "../i18n/getLang";
import { i18nI } from "../i18n/interface";
import moment from "moment";

export function getLogDate(timezone?: string) {
  const date = new Date()
  return `${date.toLocaleString("ru-RU", { timeZone: timezone })}`
};

export function getDate() {
  const date = new Date();
  return `${date.toLocaleDateString()}`
}

export function getDatesDiffString(startTime: Date, endTime: Date): string {
  let secsDiff = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  let minutesDiff = Math.floor(secsDiff / 60);
  let hoursDiff = Math.floor(minutesDiff / 60);
  let daysDiff = Math.floor(hoursDiff / 24);

  secsDiff = secsDiff - (minutesDiff*60);
  minutesDiff = minutesDiff - (hoursDiff*60);
  hoursDiff = hoursDiff - (daysDiff*24);

  const secsDiffString = `${secsDiff < 10 ? "0" : ""}${secsDiff}`;
  const minutesDiffString = `${minutesDiff < 10 ? "0" : ""}${minutesDiff}`;
  const hoursDiffString = `${hoursDiff < 10 ? "0" : ""}${hoursDiff}`;
  const daysDiffString = `${daysDiff < 10 ? "0" : ""}${daysDiff}`;

  //return "a";
  return `${daysDiff > 0 ? daysDiffString + ":" : ""}${hoursDiffString}:${minutesDiffString}:${secsDiffString}`;
}

export function formatLogMsg(msg: string, vcStartTime: Date, timezone: string): string {
  const vcTimeString = getDatesDiffString(vcStartTime, new Date());
  return `\`${getLogDate(timezone)}, ${vcTimeString}\` ${msg}`;
}

export function generateLogMsg(lang: i18nI, oldState: VoiceState, newState: VoiceState, vcStartTime: Date, timezone: string): string | undefined {
  let logMsg = "хуй";
    
  const memberJoinedVC = !oldState.channel && newState.channel;
  const memberLeftVC = oldState.channel && !newState.channel;
  const memberMuted = !oldState.selfMute && newState.selfMute;
  const memberUnmuted = oldState.selfMute && !newState.selfMute;
  const memberStartedStreaming = !oldState.streaming && newState.streaming;
  const memberEndedStreaming = oldState.streaming && !newState.streaming;
  const memberStartedWebcam = !oldState.selfVideo && newState.selfVideo;
  const memberEndedWebcam = oldState.selfVideo && !newState.selfVideo;
  const memberMovedChannels = oldState.channel?.id !== newState.channel?.id;

  if (memberJoinedVC) {
      logMsg = formatString(lang.VC_LOGS.MEMBER_ENTERED_VC, [ newState.member?.displayName ]);
  }
  else if (memberLeftVC) {
      logMsg = formatString(lang.VC_LOGS.MEMBER_LEFT_VC, [ newState.member?.displayName ]);
  }
  else if (memberMuted) {
      logMsg = formatString(lang.VC_LOGS.MEMBER_MUTED, [ newState.member?.displayName ]);
  }
  else if (memberUnmuted) {
      logMsg = formatString(lang.VC_LOGS.MEMBER_UNMUTED, [ newState.member?.displayName ]);
  }
  else if (memberStartedStreaming) {
    logMsg = formatString(lang.VC_LOGS.MEMBER_STARTED_STREAM, [ newState.member?.displayName ]);
  }
  else if (memberEndedStreaming) {
      logMsg = formatString(lang.VC_LOGS.MEMBER_ENDED_STREAM, [ newState.member?.displayName ]);
  }
  else if (memberStartedWebcam) {
      logMsg = formatString(lang.VC_LOGS.MEMBER_STARTED_WEBCAM, [ newState.member?.displayName ]);
  }
  else if (memberEndedWebcam) {
      logMsg = formatString(lang.VC_LOGS.MEMBER_ENDED_WEBCAM, [ newState.member?.displayName ]);
  }
  else if (memberMovedChannels) {
      logMsg = formatString(lang.VC_LOGS.MEMBER_MOVED_CHANNELS, [ newState.member?.displayName, newState.channel?.name ]);
  }
  else { return undefined }

  return formatLogMsg(logMsg, vcStartTime, timezone);
}

export function getLogLength(vcLogs: string[]) {
  return vcLogs.join("\n").length
}

export function formatSeconds(s: number) {
  return moment.utc(s*1000).format("HH:mm:ss")
}