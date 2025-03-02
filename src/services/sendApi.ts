import axios from "axios";
import { EmbedBuilder, Message } from "discord.js";
import { client } from "../client";

export async function editLogMessage(msg: Message<true>, embed: EmbedBuilder) {
    const URL = `https://discord.com/api/v10/channels/${msg.channelId}/messages/${msg.id}`;

    return axios.patch(URL, { embeds: [embed.toJSON()] }, { headers: { authorization: `Bot ${client.token}` } });
}

export async function deleteLogMessage(msg: Message<true>) {
    const URL = `https://discord.com/api/v10/channels/${msg.channelId}/messages/${msg.id}`;

    return axios.delete(URL, { headers: { authorization: `Bot ${client.token}` } });
}