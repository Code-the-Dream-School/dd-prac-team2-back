import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    scheduleId: Schema.Types.ObjectId;
    name: Schema.Types.ObjectId;
    content: string;
  }

const CommentSchema = new mongoose.Schema<IComment>({
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
    },
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String, 
        trim: true,
        required: [true, "Content can not be blank"],
    }, 
},
{ timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema)