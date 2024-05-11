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

export const voiceChannelsModel = mongoose.model("voicechannels", voiceChannelsSchema);