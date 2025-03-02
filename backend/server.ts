import express, {Express} from "express"
import path from "path"
import boardsRouter from "./src/routes/Boards"
import cardsRouter from "./src/routes/Cards"
import columnsRouter from "./src/routes/Columns"
import commentsRouter from "./src/routes/Comments"
import usersRouter from "./src/routes/Users"
import authRouter from "./src/routes/Auth"
import morgan from "morgan"
import mongoose, { Connection } from 'mongoose'
import dotenv from "dotenv"
import cors, {CorsOptions} from 'cors'
import cookieParser from "cookie-parser";

// Load environment variables defined in .env file
dotenv.config()

// Create Express instance
const app: Express = express()

const mongoDB: string = "mongodb://127.0.0.1:27017/projectdb"
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection = mongoose.connection

db.on("error", console.error.bind(console, "MongoDB connection error"))

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser());
app.use(morgan("dev"))


app.use(express.static(path.join(__dirname, "../public")))
app.use("/api/users", usersRouter);
app.use("/api/boards", boardsRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/columns", columnsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/authme", authRouter);

if (process.env.NODE_ENV === 'development') {
    console.log("Cors on")
    const corsOptions: CorsOptions = {
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 200
    }
    app.use(cors(corsOptions))
}

const port = 1234
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})