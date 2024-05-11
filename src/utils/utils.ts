import pms from "ms-prettify";
import * as log from "./logger";
import { VoiceState } from "discord.js";

export function getLogDate() {
  const date = new Date()
  return `${date.toLocaleString("ru-RU")}`
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

export function formatLogMsg(msg: string, vcStartTime: Date): string {
  const vcTimeString = getDatesDiffString(vcStartTime, new Date());
  return `\`${getLogDate()}, ${vcTimeString}\` ${msg}`;
}

export function generateLogMsg(oldState: VoiceState, newState: VoiceState, vcStartTime: Date): string | undefined {
  let logMsg = "хуй"
    
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
      logMsg = `📥  ${newState.member?.displayName} зашел в войс`;
  }
  else if (memberLeftVC) {
      logMsg = `📤 ${newState.member?.displayName} вышел с войса`;
  }
  else if (memberMuted) {
      logMsg = `🔇 ${newState.member?.displayName} замутился`;
  }
  else if (memberUnmuted) {
      logMsg = `🔊 ${newState.member?.displayName} размутился`;
  }
  else if (memberStartedStreaming) {
    logMsg = `🖥🟢 ${newState.member?.displayName} запустил демку`;
  }
  else if (memberEndedStreaming) {
      logMsg = `🖥🔴 ${newState.member?.displayName} закончил демку`;
  }
  else if (memberStartedWebcam) {
      logMsg = `📸 ${newState.member?.displayName} включил камеру`;
  }
  else if (memberEndedWebcam) {
      logMsg = `📷 ${newState.member?.displayName} выключил камеру`;
  }
  else if (memberMovedChannels) {
      logMsg = `🔁 ${newState.member?.displayName} перешел в войс "${newState.channel?.name}"`;
  }
  else { return undefined }

  return formatLogMsg(logMsg, vcStartTime);
}

export function getLogLength(vcLogs: string[]) {
  return vcLogs.join("\n").length
}