import mongoose, {Document, Schema, Types} from "mongoose";

// Interface for a Column document in MongoDB.
interface IColumn extends Document {
    boardId: Types.ObjectId;
    title: string;
    position: number;
}

// Schema for Column collection
const columnSchema: Schema = new Schema({
    boardId: {type: Types.ObjectId},
    title: {type: String, required: true},
    position:  {type: Number, required: true},
})

// Model for the column collection.
const Column: mongoose.Model<IColumn> = mongoose.model<IColumn>("Columns", columnSchema)

export {Column}