import { Colors, EmbedBuilder, Message, VoiceBasedChannel } from "discord.js";
import { vcDataI } from "../database/interface";
import { editLogMessage } from "./sendApi";

function buildLogEmbed(vcData: vcDataI, footerText?: string) {
    let embed = new EmbedBuilder()
        .setColor(Colors.White)
        .setTitle(`Войс от ${vcData.vcStartTime?.toLocaleString("ru-RU")}`)
        .setDescription(vcData.logs.join("\n"))

    if (footerText) embed.setFooter({ text: footerText });

    return embed;
}

export async function sendToVCChat(vc: VoiceBasedChannel | null, vcData: vcDataI): Promise<Message<true>> {
    const embed = buildLogEmbed(vcData);
    if (!vc) throw Error("VC is null");

    const message = await vc.send({ embeds: [embed] });
    if (!message) throw Error("message is undefined");

    return message;
}

export async function updateLogMessage(vcData: vcDataI, footerText?: string) {
    if (!vcData.logMessage) return;
    const embed = buildLogEmbed(vcData, footerText);
    
    editLogMessage(vcData.logMessage, embed)
}