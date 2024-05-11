import { Colors, EmbedBuilder, Message, VoiceState } from "discord.js";
import { vcDataI } from "../database/interface";
import { client } from "../client";
import { editLogMessage } from "./sendApi";

function buildLogEmbed(vcData: vcDataI, footerText?: string) {
    let embed = new EmbedBuilder()
        .setColor(Colors.White)
        .setTitle(`Войс от ${vcData.vcStartTime?.toLocaleString("ru-RU")}`)
        .setDescription(vcData.logs.join("\n"))

    if (footerText) embed.setFooter({ text: footerText });

    return embed;
}

export async function sendToVCChat(vc: VoiceState, vcData: vcDataI): Promise<Message<true>> {
    const embed = buildLogEmbed(vcData)

    const message = await vc.channel?.send({ embeds: [embed] });
    if (!message) throw Error("message is undefined");

    return message;
}

export async function updateLogMessage(vcData: vcDataI, footerText?: string) {
    if (!vcData.logMessage) return;
    const embed = buildLogEmbed(vcData, footerText);
    
    editLogMessage(vcData.logMessage, embed)
}