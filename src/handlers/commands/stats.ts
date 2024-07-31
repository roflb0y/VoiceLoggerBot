import { CacheType, ChatInputCommandInteraction } from "discord.js";
import * as database from "../../database/database";
import { formatSeconds } from "../../utils/utils";
import { getLang, formatString } from "../../i18n/getLang";

export async function statsCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    if (!interaction.guild) return;

    const server = await database.getServer(interaction.guild.id);
    if (!server) return;

    const lang = getLang(server.config.language);

    const stats = await new database.serverStats().generate(server);
    const avgVCLength = stats.avgVCLength > 0 ? formatSeconds(stats.avgVCLength) : lang.STATS_NO_VC_RECORDS;
    const longestVCLength = stats.longestVCLength > 0 ? formatSeconds(stats.longestVCLength) : lang.STATS_NO_VC_RECORDS;

    interaction.reply(formatString(lang.STATS, [ stats.recordedVoiceChats, avgVCLength, longestVCLength ]));
}