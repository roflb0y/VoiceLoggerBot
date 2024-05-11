import axios from "axios";
import { EmbedBuilder, Message } from "discord.js";
import { client } from "../client";

export async function editLogMessage(msg: Message<true>, embed: EmbedBuilder) {
    const URL = `https://discord.com/api/v10/channels/${msg.channelId}/messages/${msg.id}`;

    axios.patch(URL, { embeds: [embed.toJSON()] }, { headers: { authorization: `Bot ${client.token}` } });
}