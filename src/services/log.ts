import { Colors, EmbedBuilder, Message, VoiceBasedChannel } from "discord.js";
import { vcDataI } from "../database/interface";
import { deleteLogMessage, editLogMessage } from "./sendApi";
import { i18nI } from "../i18n/interface";

function buildLogEmbed(lang: i18nI, vcData: vcDataI, footerText?: string) {
    let logPartText = "";
    if (vcData.logPart && Number(vcData.logPart) > 1)
        logPartText = `. ${lang.VC_LOGS.PART} ${vcData.logPart}`;

    // const events = vcData.events
    //     .map((event) =>
    //         getLogMessage(lang, event, vcData.vcStartTime, vcData.timezone)
    //     )
    //     .join("\n");

    let embed = new EmbedBuilder()
        .setColor(Colors.White)
        .setTitle(
            `${lang.VC_LOGS.VOICE_FROM} ${vcData.vcStartTime?.toLocaleString(
                "ru-RU"
            )}${logPartText}`
        )
        .setDescription(vcData.logs.join("\n"));

    if (footerText) embed.setFooter({ text: footerText });

    return embed;
}

export async function sendToVCChat(
    lang: i18nI,
    vc: VoiceBasedChannel | null,
    vcData: vcDataI
): Promise<Message<true>> {
    const embed = buildLogEmbed(lang, vcData);
    if (!vc) throw Error("VC is null");

    const message = await vc.send({ embeds: [embed] });
    if (!message) throw Error("message is undefined");

    return message;
}

export async function updateLogMessage(
    lang: i18nI,
    vcData: vcDataI,
    channel: VoiceBasedChannel | null,
    footerText?: string
): Promise<Message<true> | undefined> {
    if (!vcData.logMessage) return;
    const embed = buildLogEmbed(lang, vcData, footerText);

    try {
        const res = await editLogMessage(vcData.logMessage, embed);
        return;
    } catch(err: any) {
        // не тестил может сломаться
        if (err.data.code === 30046) {
            await deleteLogMessage(vcData.logMessage);
            return sendToVCChat(lang, channel, vcData);
        }
        else return;
    }
    
    //console.log(res);
}
