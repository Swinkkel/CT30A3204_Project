import mongoose, {Document, Schema, Types} from "mongoose";

interface IColumn extends Document {
    boardId: Types.ObjectId;
    title: string;
    position: number;
}

const columnSchema: Schema = new Schema({
    boardId: {type: Types.ObjectId},
    title: {type: String, required: true},
    position:  {type: Number, required: true},
})

const Column: mongoose.Model<IColumn> = mongoose.model<IColumn>("Columns", columnSchema)

export {Column}