import mongoose, {Document, Schema, Types} from "mongoose";

// Interface for a Card document in MongoDB.
interface ICard extends Document {
    title: string;
    content: string;
    color: string;
    columnId: Types.ObjectId;       // Column id of this card
    position: number;               // Position of card in column
    comments: Types.ObjectId[];     // Array of comments, links to objects in Comments collection
    assignedTo: Types.ObjectId;     // If card is assigned to someone, then no one else can touch it.
    createdAt: Date;
    updatedAt: Date;
}

// Schema for Card collection
const cardSchema: Schema = new Schema({
    title: {type: String, required: true, unique: true},
    content:  {type: String, required: true},
    color: {type: String, required: true},
    columnId: {type: Types.ObjectId, required: true},
    position: {type: Number, required: true},
    comments: [Types.ObjectId],
    assignedTo: {type: Types.ObjectId}},
    { timestamps: true}
 )

 // Model for the cards collection.
const Card: mongoose.Model<ICard> = mongoose.model<ICard>("Cards", cardSchema)

export {Card}