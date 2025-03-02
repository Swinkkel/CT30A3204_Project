// Routes to /api/comments end points. Not implemented yet.
import {Request, Response, Router} from "express"
import {Board} from "../models/Boards"
import { validateUser, CustomRequest } from '../middleware/validateToken';

const commentsRouter: Router = Router()

// Route to get all boards. If admin returns all boards and if not then returns own board plus boards shared with this user.
commentsRouter.get("/", validateUser, async (req: Request, res: Response) => {
    try {
        const topics = await Board.find();
        res.json(topics);
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
});

// Route to delete board.
commentsRouter.post("/:id", validateUser, async(req: Request, res: Response) => {

})

// Share board with another users.
commentsRouter.put("/:id/share", validateUser, async (req: Request, res: Response) => {

})

// Unshare board with another users
commentsRouter.put("/:id/unshare", validateUser, async (req: Request, res: Response) => {

})

export default commentsRouter;