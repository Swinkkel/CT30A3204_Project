// Routes to /api/cards end points
import {Request, Response, Router} from "express"
import { compile } from "morgan"
import {Card} from "../models/Cards"
import { validateUser, validateAdmin, CustomRequest } from '../middleware/validateToken';
import mongoose from "mongoose"

const cardsRouter: Router = Router()

// Route to create a new card
cardsRouter.post("/", async (req: Request, res: Response) => {
  const {title, content, color, columnId} = req.body;
  console.log("New card");

  try {
    // Try to find current last card.
    const lastCard = await Card.findOne({ columnId }).sort({ position: -1 }).exec();

    // Set the new cards position to be one larger than the last or if no cards yet then 0.
    const position = lastCard ? lastCard.position + 1 : 0;

    // Create new Card to MongoDB
    const newCard = new Card({ title, content, color, columnId, position });
    const id = await newCard.save();

    res.status(200).json(newCard)  
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error.'});
    return
  }
});

// Get cards in given column end point
cardsRouter.get("/:columnId", validateUser, async (req: CustomRequest, res: Response) => {
  const isAdmin = req.user?.isAdmin;
  const userId = req.user?.userId;
  const columnId = req.params.columnId;

  console.log(req.user);
  console.log(columnId);

  try {
    // Find cards with column id and sort them according to the position.
    const cards = await Card.find({ columnId }).sort({position: 1});

    console.log(cards)

    res.status(200).json(cards)  
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error.'});
    return
  }
})

// Move card to another column end point
cardsRouter.patch("/:cardId/move", validateUser, async (req: CustomRequest, res: Response) => {
  const { newColumnId } = req.body;
  const { cardId } = req.params;

  if (!cardId || !newColumnId) {
    res.status(400).json({ message: "Missing required fields" });
    return 
  }

  try {
    // Find the card we want to move
    const card = await Card.findById(cardId);
    if (!card) {
      res.status(404).json({ message: "Card not found" });
      return 
    }
    
    // Get current columnId of the card.
    const currentColumnId = card.columnId;
    const currentPosition = card.position;
    
    // Get the highest position in the new column
    const highestCardInNewColumn = await Card.findOne({ columnId: newColumnId }).sort("-position");
    const maxPositionInNewColumn = highestCardInNewColumn ? highestCardInNewColumn.position : -1;

    // Determine the new position: keep the original if within range, otherwise set to last
    const newPosition = Math.min(currentPosition, maxPositionInNewColumn + 1);

    console.log(`New position: ${newColumnId} - ${newPosition}`);

    // Ensure there are no conflicting positions
    const existingCard = await Card.findOne({ columnId: newColumnId, position: newPosition });
    if (existingCard) {
      console.log("Increase position of existing cards.");
      // Adjust the positions of the other cards if necessary
      await Card.updateMany(
        { columnId: newColumnId, position: { $gte: newPosition } },
        { $inc: { position: 1 } }
      );

      console.log("Increase done.");
    }

    // Place the card in the new position
    card.columnId = newColumnId;
    card.position = newPosition;
    await card.save();

    // Adjust positions in the old column by decreasing the position of other cards with larger position by one.
    await Card.updateMany(
      { columnId: currentColumnId, position: { $gt: currentPosition } },
      { $inc: { position: -1 } }
    );

    res.status(200).json({ message: "Card moved successfully", card });
  } catch (error) {
    console.error("Error moving card:", error);
    res.status(500).json({ message: "Internal server error" });
  }

  return;
});

// Delete card end point
cardsRouter.delete("/", validateUser, async (req: CustomRequest, res: Response) => {
  console.log("Delete card end point called");

  try {
    const { cardId } = req.body; // Get ID from request body

    if (!cardId) {
      console.log(req.body);
      console.log("Card ID is required")
      res.status(400).json({ error: "Card ID is required" });
      return 
    }

    const deletedCard = await Card.findByIdAndDelete(cardId);

    if (!deletedCard) {
      console.log("Card not found")
      res.status(404).json({ error: "Card not found" });
      return 
    }

    res.status(200).json({ message: "Card deleted successfully", cardId });

  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  return
});

// End point to move card up in the current column.
cardsRouter.patch("/:cardId/move-up", validateUser, async (req: CustomRequest, res: Response) => {
  const { cardId } = req.params;
  const session = await mongoose.startSession();

  try {
    // Start transaction to ensure that we change position of both cards successfully
    session.startTransaction();

    const card = await Card.findById(cardId);
    if (!card) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ error: "Card not found" });
      return 
    }

    // Find the card to swap with (upper neighbor)
    const upperCard = await Card.findOne({
      columnId: card.columnId,
      position: card.position - 1
    });

    if (!upperCard) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: "Card is already on top of the column." });
      return 
    }

    const currentCardPosition = card.position;
    const upperCardPosition = upperCard.position;

    // Swap positions
    await Card.findByIdAndUpdate(card._id, { position: -1 });
    await Card.findByIdAndUpdate(upperCard._id, { position: currentCardPosition });
    await Card.findByIdAndUpdate(card._id, { position: upperCardPosition });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Card moved up successfully" });
    return 
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error moving card up:", error);
    res.status(500).json({ error: "Internal server error" });
    return 
  }
});


// End point to move card down in the current column.
cardsRouter.patch("/:cardId/move-down", validateUser, async (req: CustomRequest, res: Response) => {
  const { cardId } = req.params;
  const session = await mongoose.startSession();

  try {
    // Start transaction to ensure that we change position of both cards successfully
    session.startTransaction();

    const card = await Card.findById(cardId);
    if (!card) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ error: "Card not found" });
      return 
    }

    // Find the card under this card
    const lowerCard = await Card.findOne({
      columnId: card.columnId,
      position: card.position + 1
    });

    if (!lowerCard) {
      res.status(400).json({ error: "Card is already at the bottom of the column." });
      return 
    }

    const currentCardPosition = card.position;
    const lowerCardPosition = lowerCard.position;

    // Swap positions
    await Card.findByIdAndUpdate(card._id, { position: -1 });
    await Card.findByIdAndUpdate(lowerCard._id, { position: currentCardPosition });
    await Card.findByIdAndUpdate(card._id, { position: lowerCardPosition });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Card moved down successfully" });
    return 
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error moving card up:", error);
    res.status(500).json({ error: "Internal server error" });
    return 
  }
});

export default cardsRouter;