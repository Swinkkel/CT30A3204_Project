import mongoose, {Document, Schema, Types} from "mongoose";

interface IBoard extends Document {
    name: String;                   // Board name
    userId: Schema.Types.ObjectId;  // Id of the user that owns this board
    columns: Types.ObjectId[];      // Columns of the board
    sharedWith: Types.ObjectId[];   // User ids that this board is shared with
}

const boardSchema: Schema = new Schema({
    name: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, required: true},
    columns:  [Types.ObjectId],
    sharedWith: [Types.ObjectId]
})

const Board: mongoose.Model<IBoard> = mongoose.model<IBoard>("Boards", boardSchema)

export {Board}