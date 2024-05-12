import { SlashCommandBuilder } from "discord.js";

export const configCommand = new SlashCommandBuilder()
    .setName("config")
    .setDescription("Lets you to change bot config on this server")
    .addSubcommand(subcommand =>
        subcommand
            .setName("language")
            .setDescription("Change language")
            .addStringOption(option => 
                option.setName("language")
                    .setDescription("Choose language")
                    .setRequired(true)
                    .addChoices(
                        { "name": "Русский", "value": "ru" },
                        { "name": "English", "value": "en" }
                    )
                )
        
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("timezone")
            .setDescription("Change timezone")
            .addStringOption(option => 
                option.setName("city")
                    .setDescription("Enter city")
                    .setRequired(true)
        )
    )