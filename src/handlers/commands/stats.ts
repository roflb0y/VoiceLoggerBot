import { CacheType, ChatInputCommandInteraction } from "discord.js";
import * as database from "../../database/database";
import { formatSeconds } from "../../utils/utils";
import { getLang, formatString } from "../../i18n/getLang";

export async function statsCommand(
    interaction: ChatInputCommandInteraction<CacheType>
) {
    if (!interaction.guild) return;

    const server = await database.getServer(interaction.guild.id);
    if (!server) return;

    const lang = getLang(server.config.language);

    const stats = await new database.Stats().getServerStats(server);
    const avgVCLength =
        stats.avgVCLength > 0
            ? formatSeconds(stats.avgVCLength)
            : lang.STATS_NO_VC_RECORDS;
    const longestVCLength =
        stats.longestVCLength > 0
            ? formatSeconds(stats.longestVCLength)
            : lang.STATS_NO_VC_RECORDS;

    interaction.reply(
        formatString(lang.STATS, [
            stats.recordedVoiceChats,
            avgVCLength,
            longestVCLength,
        ])
    );
}

export async function userStatsCommand(
    interaction: ChatInputCommandInteraction<CacheType>
) {
    if (!interaction.guild) return;

    const server = await database.getServer(interaction.guild.id);
    if (!server) return;

    const user = interaction.options.getUser("user");
    if (!user) {
        interaction.reply("User is null ты че бля");
        return;
    }

    const lang = getLang(server.config.language);

    const stats = await new database.Stats().getUserStats(
        server,
        user.username
    );

    const avgVCLength =
        stats.avgVCLength > 0
            ? formatSeconds(stats.avgVCLength)
            : lang.STATS_NO_VC_RECORDS;
    const longestVCLength =
        stats.longestVCLength > 0
            ? formatSeconds(stats.longestVCLength)
            : lang.STATS_NO_VC_RECORDS;

    interaction.reply(
        formatString(lang.USER_STATS, [
            user.username,
            stats.vcJoins,
            avgVCLength,
            longestVCLength,
        ])
    );

    //const lang = getLang(server.config.language);
}
