import { ActionRowBuilder, CacheType, ChatInputCommandInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import * as database from "../../database/database";
import { lookupViaCity } from "city-timezones";
import { getLang, formatString } from "../../i18n/getLang";

export async function setTimezoneCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    if (!interaction.guild) return;

    const server = await database.getServer(interaction.guild.id);
    if (!server) return;

    const lang = getLang(server.config.language);

    const cityOption = interaction.options.getString("city") ?? "ты че нахуй";

    const cityLookup = lookupViaCity(cityOption);
    if (cityLookup.length === 0) {
        interaction.reply({ content: lang.CONFIG.TIMEZONE_INVALID_CITY, ephemeral: true }); 
    }
    else if (cityLookup.length === 1) {
        const tz = cityLookup[0].timezone
        await server.setTimezone(tz);

        interaction.reply(formatString(lang.CONFIG.TIMEZONE_SET, [ tz, new Date().toLocaleString("ru-RU", { timeZone: tz }) ]));
    }
    else if (cityLookup.length >= 2) {
        const select = new StringSelectMenuBuilder()
            .setCustomId("choose_city_menu")
            .setPlaceholder("Choose city")

        cityLookup.forEach(city => {
            select.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${city.city}, ${city.province}, ${city.country}`).setValue(city.timezone))
        });

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(select);

        const response = await interaction.reply({
            content: lang.CONFIG.TIMEZONE_FOUND_MULTIPLE_CITIES,
            components: [row],
            ephemeral: false
        });

        try {
            const confirmation = await response.awaitMessageComponent({ time: 60_000 });
            if (confirmation.isStringSelectMenu()) {
                const tz = confirmation.values[0];
                await server.setTimezone(tz);

                await interaction.editReply({ content: formatString(lang.CONFIG.TIMEZONE_SET, [ tz, new Date().toLocaleString("ru-RU", { timeZone: tz }) ]), components: [] });
                return;
            }
        } catch (e) {
            await interaction.editReply({ content: "timeout lmao", components: [] });
            return;
        }
    }
}