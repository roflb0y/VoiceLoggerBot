import { client } from "./client";
import * as log from "./utils/logger";
import * as config from "./config";
import mongoose from "mongoose";
import * as comamnds from "./handlers/commands/commandsInit";

const args = require('args-parser')(process.argv);

// process.on("uncaughtException", (err) => { log.error(err) });
// process.on("unhandledRejection", (err) => { log.error(err) });

import "./handlers/init";

client.on("ready", async ctx => {
    if (!client.user || !client.application) return;
    log.info(`Logged as ${client.user.tag}`);

    //const slashCommands = await client.application.commands.fetch();
    //slashCommands.forEach(async cmd => await client.application?.commands.delete(cmd.id));

    client.application.commands.create(comamnds.configCommand.toJSON());
    client.application.commands.create(comamnds.statsCommand.toJSON());
    client.application.commands.create(comamnds.userStatsCommand.toJSON());

    log.info("Registered commands");
});

log.info("Connecting to DB");
mongoose.connect(config.MONGODB_URI, 
    { 
        user: config.MONGODB_USER,
        pass: config.MONGODB_PASSWORD,
        dbName: config.MONGODB_DB
    }
)
.catch((error) => {
    log.error(error);
    process.exit();
})
.then(async () => {
    log.info("Connected to DB. Launching the bot...");
    client.login(args.dev ? config.DEV_TOKEN : config.BOT_TOKEN);
})