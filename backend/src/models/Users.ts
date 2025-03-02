import mongoose, {Document, Schema} from "mongoose";

interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    picture?: string;
    isAdmin?: boolean;
}

const userSchema: Schema = new Schema({
    email: {type: String, required: true, unique: true},
    password:  {type: String, required: true},
    username: {type: String, required: true},
    picture: {type: String},
    isAdmin: {type: Boolean, default: false}
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>("User", userSchema)

export {User}