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
        type: String,
        required: true
    },
    memberCount: {
        type: Number,
        default: 1
    },
    maxMemberCount: {
        type: Number,
        default: 1
    },
    logs: {
        type: [String],
        default: []
    },
    events: {
        type: [
            {
                action: { type: String, required: true },
                data: { type: [String], required: true },
                timestamp: { type: Date, required: true }
            }
        ],
        default: []
    },
    logPart: {
        type: Number,
        default: 1
    },
    logMessage: {
        type: Schema.Types.Mixed,
        default: {}
    }
});

const logsHistorySchema = new mongoose.Schema({
    serverId: {
        type: String,
        default: ""
    },
    vcID: {
        type: String,
        default: ""
    },
    vcStartTime: {
        type: Date
    },
    vcEndTime: {
        type: Date,
        default: () => new Date()
    },
    vcLengthSeconds: {
        type: Number,
        default: 0
    },
    timezone: {
        type: String
    },
    maxMemberCount: {
        type: Number
    },
    logs: {
        type: [String]
    },
    events: {
        type: [
            {
                action: String,
                data: [String],
                timestamp: Date
            }
        ]
    },
    logParts: {
        type: Number
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
});

export const voiceChannelsModel = mongoose.model("voicechannels", voiceChannelsSchema);
export const logsHistoryModel = mongoose.model("logs", logsHistorySchema);
export const serversModel = mongoose.model("servers", serversSchema);