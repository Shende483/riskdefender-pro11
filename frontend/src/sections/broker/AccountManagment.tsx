import React, { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import {
  Typography,
  Button,
  TextField,
  Container,
  Card,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

// Define types for socket events
interface SubaccountResponse {
  totalSubaccounts?: number;
  totalNames?: string[];
}

const socket: Socket = io("http://localhost:3001");

export default function AccountManagment() {
  const [subaccountName, setSubaccountName] = useState<string>("");
  const [subaccounterror, setSubAccountError] = useState<string>("");
  const [totalSubaccounts, setTotalSubaccounts] = useState<number>(0);
  const [totalNames, setTotalNames] = useState<string[]>([]);
  const [userinfoshow, setUserinfoshow] = useState<string[]>([]);

  useEffect(() => {
    socket.on("subaccountManagementError", (data: { message: string }) => {
      setSubAccountError(data.message);
    });
  
    socket.on("subaccountManagementSuccess", ({ 
      totalSubaccounts: receivedTotalSubaccounts, 
      totalNames: receivedTotalNames 
    }: SubaccountResponse) => {
      if (receivedTotalSubaccounts !== undefined && receivedTotalNames !== undefined) {
        setTotalSubaccounts(receivedTotalSubaccounts);
        setTotalNames(receivedTotalNames);
      } else {
        console.log("Waiting for data...");
      }
    });
  
    socket.on("userinf", (subi: string[]) => {
      if (subi !== undefined) {
        setUserinfoshow(subi);
      } else {
        console.log("Waiting for data...");
      }
    });
  
    // Cleanup socket event listeners when component unmounts
    return () => {
      socket.off("subaccountManagementError");
      socket.off("subaccountManagementSuccess");
      socket.off("userinf");
    };
  }, []);
  
  

  const handleCreateSubaccount = () => {
    if (!subaccountName.trim()) {
      alert("Please enter a subaccount name");
      return;
    }

    socket.emit("manageSubaccount", { action: "create", newAccount: subaccountName });
  };

  const handleDeleteSubaccount = (name: string) => {
    if (!name.trim()) {
      alert("Please enter a subaccount name");
      return;
    }

    socket.emit("manageSubaccount", { action: "delete", newAccount: name });
  };

  return (
    <Card sx={{ py: 2, my: 2 }} >
      <Box marginLeft={3} marginBottom={2} display="flex" gap={2}>
        <TextField
          label="Subaccount Name"
          variant="outlined"
          value={subaccountName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubaccountName(e.target.value)}
        />
        <Button onClick={handleCreateSubaccount}>Create Subaccount</Button>
        <Typography variant="body1" color="error">
          {subaccounterror}
        </Typography>
      </Box>

      <Container>
        <Typography variant="h6">Total Subaccounts: {totalSubaccounts}</Typography>
        <Typography variant="h6">Subaccount Names:</Typography>
        <ul>
          {totalNames.map((name, index) => (
            <li key={index}>
              <Typography variant="body1" color="primary" style={{ cursor: "pointer" }}>
                {name}
              </Typography>
              <Button onClick={() => handleDeleteSubaccount(name)}>Delete</Button>
            </li>
          ))}
        </ul>
        <Typography variant="h6">Account User: {userinfoshow.join(", ")}</Typography>
      </Container>

      <FormControl sx={{ mt: '30px', ml: 2, pr: 4 }} fullWidth>
        <InputLabel id="subaccount-name-label">Select Subaccount Name</InputLabel>
        <Select
          labelId="subaccount-name-label"
          id="subaccount-name"
          name="subaccountName"
        >
          <MenuItem value="subaccount">
            subaccount
          </MenuItem>
        </Select>
        <Button variant="contained" sx={{mt: 2}} >submit subaccount name</Button>
      </FormControl>
    </Card>
  );
};
