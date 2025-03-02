import mongoose, {Document, Schema, Types} from "mongoose";

interface IComment extends Document {
    cardId: Types.ObjectId;
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

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

const Comments: mongoose.Model<IComment> = mongoose.model<IComment>("Comments", commentSchema)

export {Comments}