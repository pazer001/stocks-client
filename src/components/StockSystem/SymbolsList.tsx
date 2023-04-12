import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";

import axios, { AxiosResponse } from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import { getSelectedSymbol, symbolAtom, useSymbol } from "../../atoms/symbol";

interface ISupportedSymbols {
  _id: number;
  exchange: string;
  symbol: string;
  currency: string;
  esgPopulated: boolean;
  exchangeTimezoneName: string;
  exchangeTimezoneShortName: string;
  financialCurrency: string;
  firstTradeDateMilliseconds: number;
  fullExchangeName: string;
  gmtOffSetMilliseconds: number;
  language: string;
  longName: string;
  market: string;
  marketState: string;
  quoteSourceName: string;
  quoteType: string;
  region: string;
  shortName: string;
  tradeable: boolean;
  triggerable: boolean;
}

const API_HOST = `http://85.64.194.77:3000`;

const columnDefinition: Array<GridColDef> = [
  { field: "symbol", headerName: "Symbol" },
  // { field: "exchange", headerName: "Exchange" },
  { field: "currency", headerName: "Currency" },
  { field: "fullExchangeName", headerName: "Full Exchange Name" },
  // { field: "longName", headerName: "Long Name" },
  { field: "quoteType", headerName: "Quote Type" },
];

const SymbolsList = () => {
  const { changeSymbol } = useSymbol();
  const [symbolState, setSymbolState] = useRecoilState(symbolAtom);
  const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const [supportedSymbols, setSupportedSymbols] = useState<
    Array<ISupportedSymbols>
  >([]);
  const [symbolFilterCriteria, setSymbolFilterCriteria] = useState("");

  useEffect(() => {
    const getSupportedSymbols = async () => {
      const supportedSymbolsResult: AxiosResponse<Array<ISupportedSymbols>> =
        await axios.get(`${API_HOST}/analyze/supportedSymbols`);

      setSupportedSymbols(
        supportedSymbolsResult.data.map((symbolData) => ({
          ...symbolData,
          id: symbolData._id,
        }))
      );
    };
    getSupportedSymbols();
  }, []);

  return useMemo(
    () => (
      <Box sx={{ height: 440 }}>
        <DataGrid
          density="compact"
          columns={columnDefinition}
          rows={supportedSymbols}
          // autoHeight
          hideFooter
          disableColumnFilter
          // disableColumnSelector
          // disableDensitySelector
          onRowClick={(params) =>
            changeSymbol(params.row.symbol, params.row.intervals)
          }
          loading={!supportedSymbols}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </Box>
    ),
    [supportedSymbols]
  );
};

export default React.memo(SymbolsList);
