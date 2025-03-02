// Routes to /api/columns end points
import {Request, Response, Router} from "express"
import bcrypt from "bcrypt"
import { compile } from "morgan"
import jwt, {JwtPayload} from "jsonwebtoken"
import {body, validationResult} from 'express-validator'
import {Column} from "../models/Columns"
import { validateUser, validateAdmin, CustomRequest } from '../middleware/validateToken';

const columnsRouter: Router = Router()

// Create a new column.
columnsRouter.post("/", validateUser, async (req: Request, res: Response) => {
  const {title, boardId} = req.body;

  console.log(req.body)

  try {
    // Query current positions.
    const lastColumn = await Column.findOne({ boardId })
        .sort({ position: -1 }) // Sort by position in descending order
        .select("position"); // Get only the position field

    const position : number = lastColumn ? lastColumn.position + 1 : 0; // If no columns, start at 0

    const newColumn = new Column({ title, position, boardId });
    const id = await newColumn.save();

    res.status(200).json(newColumn);
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error.'});
    return
  }
});

// Get all columns in all boards. Not used.
columnsRouter.get("/", validateUser, async (req: CustomRequest, res: Response) => {
  try {
    const columns = await Column.find()

    console.log(columns)

    res.status(200).json(columns)  
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error.'});
    return
  }
});

// Get columns in the board and sort them according to position.
columnsRouter.get("/:boardId", validateUser, async (req: CustomRequest, res: Response) => {
  const {boardId} = req.params;

  try {
    // Get columns with the boardId and sort according to position.
    const columns = await await Column.find({boardId}).sort({position: 1});

    console.log(columns)

    res.status(200).json(columns)  
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error.'});
    return
  }
});

// Delete column end point
columnsRouter.delete("/", validateUser, async (req: CustomRequest, res: Response) => {
  console.log("Delete end point called");

  try {
    const { id } = req.body; // Get ID from request body

    if (!id) {
      console.log(req.body);
      console.log("Column ID is required")
      res.status(400).json({ error: "Column ID is required" });
      return 
    }

    const deletedColumn = await Column.findByIdAndDelete(id);

    if (!deletedColumn) {
      console.log("Column not found")
      res.status(404).json({ error: "Column not found" });
      return 
    }

    res.status(200).json({ message: "Column deleted successfully", id });

  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  return
});

// Rename a column title.
columnsRouter.patch("/:columnId", validateUser, async (req: CustomRequest, res: Response) => {
  const { columnId } = req.params;
  const { title } = req.body;

  if (!title) {
    res.status(400).json({ error: "New title is required" });
    return 
  }

  try {
    // Try to update the column
    const updatedColumn = await Column.findByIdAndUpdate(
      columnId,
      { title },
      { new: true }
    );

    if (!updatedColumn) {
      res.status(404).json({ error: "Column not found" });
      return 
    }

    res.status(200).json(updatedColumn);
  } catch (error) {
    console.error("Error updating column title:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Move column left in the current board
columnsRouter.patch("/:columnId/move-left", validateUser, async (req: CustomRequest, res: Response) => {
  const { columnId } = req.params;

  try {
    const column = await Column.findById(columnId);
    if (!column) {
      res.status(404).json({ error: "Column not found" });
      return 
    }

    // Find the column to swap with (left neighbor)
    const leftColumn = await Column.findOne({
      boardId: column.boardId,
      position: column.position - 1
    });

    if (!leftColumn) {
      res.status(400).json({ error: "Column is already at the leftmost position" });
      return 
    }

    // Swap positions
    await Column.findByIdAndUpdate(column._id, { position: leftColumn.position });
    await Column.findByIdAndUpdate(leftColumn._id, { position: column.position });

    res.status(200).json({ message: "Column moved left successfully" });
    return 
  } catch (error) {
    console.error("Error moving column left:", error);
    res.status(500).json({ error: "Internal server error" });
    return 
  }
});

// Move column right in the current board
columnsRouter.patch("/:columnId/move-right", validateUser, async (req: CustomRequest, res: Response) => {
  const { columnId } = req.params;

  try {
    const column = await Column.findById(columnId);
    if (!column) {
      res.status(404).json({ error: "Column not found" });
      return 
    }

    // Find the column to swap with (right neighbor)
    const rightColumn = await Column.findOne({
      boardId: column.boardId,
      position: column.position + 1
    });

    if (!rightColumn) {
      res.status(400).json({ error: "Column is already at the rightmost position" });
      return 
    }

    // Swap positions
    await Column.findByIdAndUpdate(column._id, { position: rightColumn.position });
    await Column.findByIdAndUpdate(rightColumn._id, { position: column.position });

    res.status(200).json({ message: "Column moved right successfully" });
    return 
  } catch (error) {
    console.error("Error moving column right:", error);
    res.status(500).json({ error: "Internal server error" });
    return 
  }
});


export default columnsRouter;