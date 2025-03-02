import { client } from "../../client";
import { Events, PermissionsBitField } from "discord.js";
import { setLanguageCommand } from "../commands/setLanguage";
import { setTimezoneCommand } from "../commands/setTimezone";
import * as database from "../../database/database";
import { defaultServerConfig } from "../../database/interface";
import { getLang } from "../../i18n/getLang";
import { statsCommand, userStatsCommand } from "../commands/stats";

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction || !interaction.guild || !interaction.channel) return;
    if (!interaction.isChatInputCommand()) return;

    const server = await database.addServer({
        serverID: interaction.guild.id,
        serverName: interaction.guild.name,
        memberCount: interaction.guild.memberCount,
        config: { ...defaultServerConfig }
    });

    const lang = getLang(server.config.language);

    if (interaction.commandName === "stats") {
        statsCommand(interaction);
    }
    else if (interaction.commandName === "userstats") {
        userStatsCommand(interaction);
    }
    else if (interaction.commandName === "config") {
        if (!interaction.memberPermissions) return;
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ content: lang.NO, options: { ephemeral: true } } );
            return;
        }

        if (interaction.options.getSubcommand() === "language") setLanguageCommand(interaction);
        if (interaction.options.getSubcommand() === "timezone") setTimezoneCommand(interaction);
    }
})