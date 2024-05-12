import { CacheType, ChatInputCommandInteraction } from "discord.js";
import * as database from "../../database/database";
import { getLang, formatString } from "../../i18n/getLang";

export async function setLanguageCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    if (!interaction.guild) return;

    const server = await database.getServer(interaction.guild.id);
    if (!server) return;

    const languageOption = interaction.options.getString("language") ?? "ты че нахуй";
    await server.setLanguage(languageOption);

    let lang = getLang(languageOption);

    interaction.reply(formatString(lang.CONFIG.LANGUAGE_SET, [ languageOption ]));
}