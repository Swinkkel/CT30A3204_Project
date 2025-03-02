import * as React from 'react'
import Column from "./Column";
import { Box, Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField } from "@mui/material";

// Interface to Column that we expect to receive from backend.
interface IColumn {
    _id: string;        // MongoDB ObjectId of this column
    boardId: string;    // MongoDB ObjectId of the board that column belongs to.
    title: string;      // Column title
    position: number;   // Column position on board. 0 is leftmost.
}

// Props for Board component.
type BoardProps = {
    boardId: string // MongoDB ObjectId of the board we want to show in this component.
};

// Board component function.
const Board = ({boardId}: BoardProps) => {
    const url: string = `/api/columns/${boardId}`;  // URL to fecth columns of board

    const [loading, setLoading] = React.useState<boolean>(true);    // State to define if fetch is loading data.
    const [error, setError] = React.useState<string>("");           // State to store error from fetch
    const [columns, setColumns] = React.useState<IColumn[]>([]);    // State to store columns of the board returned by the fetch
    const [showCreateColumnDialog, setShowCreateColumnDialog] = React.useState(false);  // State to define should "Create column" dialog be visible.
    const [columnTitle, setColumnTitle] = React.useState("");   // State to store column title for new column in "Create column" dialog.
    const [reloadBoard, setReloadBoard] = React.useState(true); // State that is used to trigger useEffect to re-render the board.

    // When useEffect is triggered then fetch and update columns of the board.
    React.useEffect(() => {

        // This AbortController allows us to cancel current fetch if the component unmounts or re-renders.
        const abortCtrl: AbortController = new AbortController()

        // Function that fetches columns from the backend
        const fetchData = async () => {
            setLoading(true);

            try {
                const response: Response = await fetch(url, {
                    signal: abortCtrl.signal, 
                    method: "GET", 
                    credentials: "include"
                });

                if (!response.ok) {
                    // Backend returned error.
                    throw new Error("Failed to fetch data!")
                }

                // Parse backend response JSON.
                const data: unknown = await response.json()

                if (data) {
                    setColumns([...data as IColumn[]]);
                    console.log(`Setting columns: ${columns}`)
                 }
                setError("")    // Clear possible errors beacuse fetch succeeded.
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
                setReloadBoard(false);
            }
        }

        if (!boardId) return;

        fetchData();
        return () => abortCtrl.abort();

    }, [reloadBoard, boardId, url])
  
    const handleCreateColumnOpen = () => {
        setShowCreateColumnDialog(true);
      }
    
    const handleCreateColumnClose = () => {
       setShowCreateColumnDialog(false);
    }

    // Function to add a new column
    const handleAddColumn = async () => {
        console.log("handleAddColumn");

        try {
            // Call backend end point to add new column.
            const response = await fetch("/api/columns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({title: columnTitle, boardId}),
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to create column");

            const newColumn = await response.json();

            // Update state with the new column
            setColumns((prevColumns) => [...prevColumns, newColumn]);
            handleCreateColumnClose(); // Close dialog
        } catch (error) {
            console.error("Error adding column:", error);
        }
    };

    const handleDeleteColumn = async (id: string) => {
        // Call delete column end point with column id.
        try {
          console.log("id: " + id)
    
          // Call backend end point to delete the column.
          const response = await fetch(`/api/columns`, {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ id }),
              credentials: "include",
          });
    
          if (!response.ok) {
              throw new Error("Failed to delete column");
          }
    
          console.log("Column deleted successfully");
          setReloadBoard(true);
          // Optionally, refresh the state or refetch columns
        } catch (error) {
          console.error("Error deleting column:", error);
        }
    }

    // Callback called from Column component when column is renamed.
    const handleRenameColumn = async (columnId: string, newTitle: string) => {
        try {
            // Call backend end point to rename the column.
            const response = await fetch(`/api/columns/${columnId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({title: newTitle}),
              credentials: "include",
            });
      
            if (!response.ok) throw new Error("Failed to rename the column");
            setReloadBoard(true);
           } catch (error) {
            console.error("Error renaming the column:", error);
          }
    };

    // Either column order changed or card changed from column to another. Reload board.
    const handleChangeColumnOrder = () => {
        console.log("handleChangeColumnOrder called");
        setReloadBoard(true);
    }

    return (
    <>
        <Box display="flex" flexDirection="column" gap={2} p={2}>
            <Box top={8} right={8}>
                {boardId != null &&
                    <Button variant="contained" onClick={handleCreateColumnOpen}>
                        Add Column
                    </Button>
                }
            </Box>
            <Box display="flex" gap={2} overflow="auto">
                {boardId && loading && <p>Loading...</p>}
                {boardId && error && <p>{error}</p>}
                {boardId && columns.map((column) => (
                    <Column key={column._id} columnId={column._id} title={column.title} onDeleteColumn={handleDeleteColumn} 
                    onRenameColumn={handleRenameColumn} onChangeOrder={handleChangeColumnOrder} columns={columns} onChangeColumn={handleChangeColumnOrder} />
                ))}
            </Box>
        </Box>

        {/* Dialog to create new column. */}
        <Dialog
            open={showCreateColumnDialog}
            onClose={handleCreateColumnClose}
        >

            <DialogTitle>Create column</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="title"
                    name="title"
                    label="Column title"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={columnTitle}
                    onChange={(e) => setColumnTitle(e.target.value)}
                    placeholder="Enter column title"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCreateColumnClose}>Cancel</Button>
                <Button onClick={handleAddColumn}>Create</Button>
            </DialogActions>
        </Dialog>
    </>
    );
};

export default Board;
