import mongoose, { Schema } from "mongoose";

const voiceChannelsSchema = new mongoose.Schema({
    vcID: {
        type: String,
        default: ""
    },
    vcStartTime: {
        type: Date,
        default: () => new Date()
    },
    timezone: {
        type: String
    },
    memberCount: {
        type: Number,
        default: 0
    },
    logs: {
        type: [String],
        default: []
    },
    logMessage: {
        type: Schema.Types.Mixed,
        default: {}
    }
});

const serversSchema = new mongoose.Schema({
    serverID: {
        type: String
    },
    serverName: {
        type: String
    },
    memberCount: {
        type: Number
    },
    config: {
        language: { type: String, default: "en" },
        timezone: { type: String, default: "Europe/London" },
    },
    joinTime: {
        type: Date,
        default: () => new Date().setHours(new Date().getHours()),
    }
})

export const voiceChannelsModel = mongoose.model("voicechannels", voiceChannelsSchema);
export const serversModel = mongoose.model("servers", serversSchema);