import React from "react";
import { Card, CardContent, Typography, Button, Box, IconButton, FormControl, Select, InputLabel, MenuItem } from "@mui/material";
import {Delete, KeyboardArrowDown, KeyboardArrowUp} from '@mui/icons-material';

interface IColumn {
  _id: string
  boardId: string;
  title: string;
  position: number;
}

type TaskCardProps = {
  cardId: string 
  title: string; 
  content: string; 
  color: string;
  onDeleteCard: (cardId: string) => void;
  onChangeOrder: () => void;
  columns: IColumn[];
  onChangeColumn: () => void;
};

const TaskCard = ({ cardId, title, content, color, onDeleteCard, onChangeOrder, columns, onChangeColumn }: TaskCardProps) => {
  const [openColumnChange, setOpenColumnChange] = React.useState(false);  // State to define is the change column dialog visible.
  const [selectedColumn, setSelectedColumn] = React.useState("");

  // Move task upwards callback
  const handleUpClick = async () => {
    console.log("handleUpClick");

    try {
      const response = await fetch(`/api/cards/${cardId}/move-up`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to move card");
      onChangeOrder();
      return await response.json();
    } catch (error) {
      console.error("Error moving card up: ", error);
    }
  }

  // Move task downwards callback
  const handleDownClick = async () => {
    console.log("HandleDownClick");

    try {
      const response = await fetch(`/api/cards/${cardId}/move-down`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to move card");
      onChangeOrder();
      return await response.json();
    } catch (error) {
      console.error("Error moving card down: ", error);
    }
  }

  // Change tasks column callback
  const handleChangeColumn = async () => {
    try {
      const response = await fetch(`/api/cards/${cardId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ newColumnId: selectedColumn }),
      });

      if (!response.ok) throw new Error("Failed to change column");
      onChangeColumn();  // To update the parent component's state
      setOpenColumnChange(false);  // Close the modal
    } catch (error) {
      console.error("Error changing column: ", error);
    }
  };

  return (
    <Card sx={{ backgroundColor: color }}>
      <CardContent>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={handleUpClick} size="small">
            <KeyboardArrowUp />
            
          </IconButton>
          
          <IconButton onClick={handleDownClick} size="small">
            <KeyboardArrowDown /> 
          </IconButton>
        </Box>

        <Typography>{content}</Typography>
        <Button variant="outlined" startIcon={<Delete />} onClick={() => onDeleteCard(cardId)}>
          Delete
        </Button>
        <Button variant="outlined" onClick={() => setOpenColumnChange(true)}>
          Change column
        </Button>

        {/* Dialog to change column. */}
        {openColumnChange && (
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: 2, borderRadius: 2, boxShadow: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Select Column</InputLabel>
                <Select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  label="Select Column"
                >
                  {columns.map((column: IColumn) => (
                    <MenuItem key={column._id} value={column._id}>{column.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button onClick={() => setOpenColumnChange(false)} variant="outlined" color="secondary">
                  Cancel
                </Button>
                <Button onClick={handleChangeColumn} variant="contained">
                  Change
                </Button>
              </Box>
            </Box>
          )}
      </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;