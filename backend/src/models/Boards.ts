import mongoose, {Document, Schema, Types} from "mongoose";

// Interface for a Board document in MongoDB.
interface IBoard extends Document {
    name: String;                   // Board name
    userId: Schema.Types.ObjectId;  // Id of the user that owns this board
    columns: Types.ObjectId[];      // Columns of the board
    sharedWith: Types.ObjectId[];   // User ids that this board is shared with
}

// Schema for Board collection
const boardSchema: Schema = new Schema({
    name: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, required: true},
    columns:  [Types.ObjectId],
    sharedWith: [Types.ObjectId]
})

// Model for the board collection.
const Board: mongoose.Model<IBoard> = mongoose.model<IBoard>("Boards", boardSchema)

export {Board}