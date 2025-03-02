import * as React from 'react'
import Card from "./Card";
import { Box, Paper, Typography, Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField, IconButton } from "@mui/material";
import Delete from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {NavigateBefore, NavigateNext, Edit} from '@mui/icons-material';

// Interface to Card that we expect to receive from backend end points.
interface ICard {
  _id: string;          // MongoDB ObjectId of this Card
  title: string;        // Card title
  content: string;      // Card content
  color: string;        // Card color
  columnId: string;     // MongoDB ObjectId of Column id that this card belongs to
  position: number;     // Position of card in column. 0 is on top.
  comments: string[];   // Array of comments, MongoDB ObjectIds to objects in Comments collection
  assignedTo: string;   // MongoDB ObjectId of user if card is assigned to someone, then no one else can touch it.
  createdAt: Date;      // Date when card was created
  updatedAt: Date;      // Date when card was modified last time
}

// Interface to Column that we expect to receive from backend.
interface IColumn {
  _id: string;        // MongoDB ObjectId of this column
  boardId: string;    // MongoDB ObjectId of the board that column belongs to.
  title: string;      // Column title
  position: number;   // Column position on board. 0 is leftmost.
}

// Props for Column component.
type ColumnProps = {
  columnId: string; // MongoDB ObjectId of the column we should show in this Column component.
  title: string;    // Title of the column.
  onDeleteColumn: (columnId: string) => void; // Callback function that should be called when column delete button is clicked.
  onRenameColumn: (columnId: string, newTitle: string) => void; // Callback function that should be called when column rename button is clicked.
  onChangeOrder: () => void;  // Callback funtion that should be called when column order has been changed.
  columns: IColumn[]; // Columns shown in the board. This is delivered to each Card component to show list of possible columns when changing the column.
  onChangeColumn: () => void; // Callback function that is delivered for Card components and should be called when card column is changed.
};

// Column component function.
const Column = ({ columnId, title, onDeleteColumn, onRenameColumn, onChangeOrder, columns, onChangeColumn }: ColumnProps) => {
  console.log(`Column ${title} function called.`);

  const [loading, setLoading] = React.useState<boolean>(true);  // State to store loading status of fetch.
  const [error, setError] = React.useState<string>("");         // State to store error of fetch.
  const [reloadColumn, setReloadColumn] = React.useState(true); // State to trigger useEffect if we need to reload columns.
  
  const [showCreateTaskDialog, setShowCreateTaskDialog] = React.useState(false);  // State to define if "Create task" dialog should be visible. 
  const [showRenameColumnDialog, setShowRenameColumnDialog] = React.useState(false);  // State to define if "Rename column" dialog should be visible.
  const [columnTitle, setColumnTitle] = React.useState(""); // State to store column title in "Rename column" dialog
  const [cards, setCards] = React.useState<ICard[]>([]);  // State to store cards in this column.

  // Get tasks of the column
  const url: string = `/api/cards/${columnId}`;

  // When useEffect is triggered then fetch and update cards of the column.
  React.useEffect(() => {

    console.log(`Load column: ${columnId}`); // Debug message to follow when we end here.

    // This AbortController allows us to cancel current fetch if the component unmounts or re-renders. 
    const abortCtrl: AbortController = new AbortController();

    // Fetch cards from the backend.
    const fetchData = async () => {
      setLoading(true);

      try {
        const response: Response = await fetch(url, {
          signal: abortCtrl.signal, 
          method: "GET", 
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cards!")
        }
        const data: unknown = await response.json();

        if (data) {
          // Set cards
          setCards(data as ICard[]);
        }
        
        setError("");
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            console.log("Fetch aborted")
          } else {
            setError(error.message);
            setLoading(false);
          }
        }
      } finally {
        setLoading(false);
        setReloadColumn(false);
      }
    }

    if (!columnId) return;

    fetchData()
    return () => abortCtrl.abort()

  }, [reloadColumn, columnId, columns, url])

  // Called when Add task button is clicked.
  const handleCreateTaskOpen = () => {
    setShowCreateTaskDialog(true);
  }

  // Called when Add task dialog is closed.
  const handleCreateTaskClose = () => {
    setShowCreateTaskDialog(false);
  }

  // Called when Rename button is clicked.
  const openRenameColumnDialog = () => {
    setShowRenameColumnDialog(true);
  }

  // Called when Add task dialog is closed.
  const closeRenameColumnDialog = () => {
    setShowRenameColumnDialog(false);
  }

  // Function to add a new column
  const handleRenameColumn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("handleRenameColumn");  // Just debugging message. Can be removed.
    closeRenameColumnDialog(); // Close dialog
    onRenameColumn(columnId, columnTitle);
  };

  // Function to add a new column
  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("handleCreateTask");

    const formData = new FormData(event.currentTarget);
    const taskTitle = formData.get("title") as string;
    const taskContent = formData.get("content") as string;
    const taskColor = formData.get("color") as string;

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({title: taskTitle, content: taskContent, color: taskColor, columnId}),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create card");

        const newCard = await response.json();

        // Update state with the new column
        setCards((prevCards) => [...prevCards, newCard]);
        handleCreateTaskClose(); // Close dialog
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };

  // Callback function called when Card is deleted
  const handleDeleteCard = async (cardId: string) => {
    // Call delete card end point with column id.
     // Call delete card end point with card id.
     try {
      console.log("id: " + cardId)

      const response = await fetch(`/api/cards`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ cardId }),
          credentials: "include",
      });

      if (!response.ok) {
          throw new Error("Failed to delete card");
      }

      console.log("Card deleted successfully");
      setCards(prevCards => prevCards.filter(card => card._id !== cardId));    
      // Optionally, refresh the state or refetch cards
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  }

  const handleChangeOrder = () => {
    // Order of the cards is changed so we need to fetch cards and render column.
    setReloadColumn(true);
  }
  
  const handleBackClick = async () => {
    // Move column left by one.
    console.log("Arrow back clicked");

    try {
      const response = await fetch(`/api/columns/${columnId}/move-left`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create card");
      onChangeOrder();
      return await response.json();
    } catch (error) {
      console.error("Error moving column left: ", error);
    }
  };

  const handleForwardClick = async () => {
    console.log("Arrow forward clicked");

    try {
      const response = await fetch(`/api/columns/${columnId}/move-right`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create card");
      onChangeOrder();
      return await response.json();
    } catch (error) {
      console.error("Error moving column right: ", error);
    }
  };

  return (
    <>
    <Paper sx={{ width: 300, minHeight: 400, p: 2 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" alignItems="center" justifyContent="center">
          <IconButton onClick={handleBackClick} size="small">
            <NavigateBefore />
          </IconButton>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={handleForwardClick} size="small">
            <NavigateNext />
          </IconButton>
        </Box>

        <Box display="flex" alignItems="center">
          <Button variant="outlined" startIcon={<Delete />} onClick={() => onDeleteColumn(columnId)}>
            Delete
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreateTaskOpen}>
           Add task
          </Button>
          <Button variant="outlined" startIcon={<Edit />} onClick={() => openRenameColumnDialog()}>
            Rename
          </Button>
    
        </Box>
      </Box>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {columnId && cards.map((card => (
        <Box key={card._id} display="flex" flexDirection="column" gap={2} mt={2}>
          <Card  cardId={card._id} title={card.title} content={card.content} color={card.color} 
          onDeleteCard={handleDeleteCard} onChangeOrder={handleChangeOrder} columns={columns} onChangeColumn={onChangeColumn} />
        </Box>
      )))}
    </Paper>
    
    {/* Create task dialog. */}
    <Dialog
      open={showCreateTaskDialog}
      onClose={handleCreateTaskClose}
    >
      <form onSubmit={handleCreateTask}>
        <DialogTitle>Create task</DialogTitle>
        <DialogContent>
          <TextField autoFocus required margin="dense" fullWidth variant="standard"
            id="title"
            name="title"
            label="Title"
            type="text"
          />
          <TextField autoFocus required margin="dense" fullWidth variant="standard"
            id="content"
            name="content"
            label="Content"
            type="text"
          />
          <TextField autoFocus required margin="dense" fullWidth variant="standard"
            id="color"
            name="color"
            label="Color"
            type="text"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateTaskClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
    </form>

  </Dialog>

  {/* Rename column dialog. */}
  <Dialog
      open={showRenameColumnDialog}
      onClose={closeRenameColumnDialog}
  >
    <form onSubmit={handleRenameColumn}>
      <DialogTitle>Rename column</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          required
          margin="dense"
          id="name"
          name="columnTitle"
          label="New column title"
          type="text"
          fullWidth
          onChange={(e) => setColumnTitle(e.target.value)}
          variant="standard" 
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeRenameColumnDialog}>Cancel</Button>
        <Button type="submit">Rename</Button>
      </DialogActions>
    </form>

  </Dialog>
  </>
  );
};

export default Column;
