import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from "@mui/material";
import axios, { AxiosResponse } from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { getSelectedSymbol, symbolAtom } from "../../atoms/symbol";

interface ISupportedSymbols {
  label: string;
}

const API_HOST = `http://85.64.194.77:3000`;

const SymbolsList = () => {
  const [symbolState, setSymbolState] = useRecoilState(symbolAtom);
  const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const [supportedSymbols, setSupportedSymbols] = useState<
    Array<ISupportedSymbols>
  >([]);
  const [symbolFilterCriteria, setSymbolFilterCriteria] = useState("");

  const onSearchSymbol = useCallback(
    (event: { target: { value: React.SetStateAction<string> } }) => {
      setSymbolFilterCriteria(event.target.value);
    },
    []
  );

  const filteredSymbols = useMemo(
    () =>
      Boolean(symbolFilterCriteria)
        ? supportedSymbols.filter((symbol) =>
            symbol.label.includes(symbolFilterCriteria.toUpperCase())
          )
        : supportedSymbols,
    [symbolFilterCriteria, supportedSymbols]
  );

  const renderRow = (props: ListChildComponentProps) => {
    const { index, style } = props;
    const symbol = filteredSymbols[index];
    return useMemo(
      () => (
        <ListItem style={style} dense disablePadding key={index}>
          <ListItemButton
            onClick={() =>
              setSymbolState((prevSymbolState) => ({
                ...prevSymbolState,
                selectedSymbol: symbol.label,
                selectedSignal: undefined,
              }))
            }
            selected={symbol.label === selectedSymbol}
          >
            <ListItemText primary={symbol.label} />
          </ListItemButton>
        </ListItem>
      ),
      [index, symbol, style]
    );
  };

  useEffect(() => {
    const getSupportedSymbols = async () => {
      const supportedSymbolsResult: AxiosResponse<Array<string>> =
        await axios.get(`${API_HOST}/analyze/supportedSymbols`);

      setSupportedSymbols(
        supportedSymbolsResult.data.map((symbol: string) => ({
          label: symbol,
        }))
      );
    };
    getSupportedSymbols();
  }, []);

  return useMemo(
    () => (
      <Box>
        <TextField
          fullWidth
          size="small"
          label="Search symbol"
          onChange={onSearchSymbol}
        />
        <List>
          <FixedSizeList
            height={390}
            width="100%"
            itemSize={30}
            itemCount={filteredSymbols.length}
          >
            {renderRow}
          </FixedSizeList>
        </List>
      </Box>
    ),
    [filteredSymbols]
  );
};

export default React.memo(SymbolsList);
