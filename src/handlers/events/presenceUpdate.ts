import { client } from "../../client";
import { Events } from "discord.js";

client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
    console.log(oldPresence?.activities);
    console.log(newPresence.activities);
    console.log("\n\n\n");
});