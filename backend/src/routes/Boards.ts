// Routes to /api/baords end points
import {Request, Response, Router} from "express"
import bcrypt from "bcrypt"
import { compile } from "morgan"
import jwt, {JwtPayload} from "jsonwebtoken"
import {body, validationResult} from 'express-validator'
import {Board} from "../models/Boards"
import { validateUser, validateAdmin, CustomRequest } from '../middleware/validateToken';

const boardsRouter: Router = Router()

// Create board for the user.
boardsRouter.post("/", validateUser, async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;

  console.log(req.user)

  try {
    // Create new Board to MongoDB
    const newBoard = new Board({name: "Default", userId });
    const id = await newBoard.save();

    res.status(200).json({success: true, boardId: {id}})
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error.'});
    return
  }

 });

// Route to get all boards. If admin returns all boards and if not then returns own board plus boards shared with this user.
boardsRouter.get("/", validateUser, async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }

        // Find boards where the user is either the owner or sharedWith
        const boards = await Board.find({
          $or: [{ userId }, { sharedWith: userId }]
        });
        res.json(boards);
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
});

export default boardsRouter;