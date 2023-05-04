import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DataGrid, GridRowId } from "@mui/x-data-grid";
import axios, { AxiosResponse } from "axios";
import { debounce } from "lodash";
import { ISymbol } from "./SymbolsList";
import { columnDefinition } from "./common";

interface ISymbolChooserProps {
  open: boolean;
  onSymbolChoose?: () => void;
  onClose: () => void;
  onConfirm: (ids: Array<string>) => void;
}

const API_HOST = import.meta.env.VITE_API_HOST;

const SymbolChooser = (props: ISymbolChooserProps) => {
  const [symbols, setSymbols] = useState<Array<ISymbol>>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<Array<string>>([]);

  const searchSymbols = async (symbol: string) => {
    const searchSymbolsResult: AxiosResponse<Array<ISymbol>> = await axios.get(
      `${API_HOST}/symbols/searchByTerm/${symbol}`
    );
    setSymbols((_) => searchSymbolsResult.data);
  };

  const handleSelectedSymbols = (ids: Array<string>) => {
    const selectedSymbols = ids
      .map((id) => {
        const symbolObj = symbols.find((symbol) => symbol._id === id);
        return symbolObj ? symbolObj.symbol : "";
      })
      .filter((symbol) => symbol !== "");
    setSelectedSymbols(selectedSymbols);
  };

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="xl">
      <DialogTitle>Choose symbol</DialogTitle>
      <DialogContent sx={{ minHeight: 400 }}>
        <TextField
          autoFocus
          size="small"
          fullWidth
          label="Symbol search"
          margin="dense"
          onChange={debounce((e) => searchSymbols(e.target.value))}
          inputProps={{
            style: { textTransform: "uppercase" },
          }}
        />

        <DataGrid
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(results) =>
            handleSelectedSymbols(results as Array<string>)
          }
          autoHeight
          density="compact"
          columns={columnDefinition}
          rows={symbols}
          hideFooter
          getRowId={(row) => row._id}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button onClick={() => props.onConfirm(selectedSymbols)}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SymbolChooser);
