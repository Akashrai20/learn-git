import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

export const ProjectNote = mongoose.model("ProjectNote", projectSchema);
