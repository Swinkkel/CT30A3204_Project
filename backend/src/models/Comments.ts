// Comment collection. Not used yet.
import mongoose, {Document, Schema, Types} from "mongoose";

// Interface for a Comment document in MongoDB.
interface IComment extends Document {
    cardId: Types.ObjectId;
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

// Schema for Comment collection
const commentSchema: Schema = new Schema(
    {
        cardId: {type: Types.ObjectId, required: true},
        userId:  {type: Types.ObjectId, required: true},
        content: {type: String, required: true}
    },
    {
        timestamps: true
    }
)

// Model for the comments collection.
const Comments: mongoose.Model<IComment> = mongoose.model<IComment>("Comments", commentSchema)

export {Comments}