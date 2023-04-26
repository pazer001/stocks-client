import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridValueFormatterParams,
} from "@mui/x-data-grid";

import axios, { AxiosResponse } from "axios";
import { useSymbol } from "../../atoms/symbol";
import { startCase } from "lodash";

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
  marketCap: number;
  marketState: string;
  quoteSourceName: string;
  quoteType: string;
  region: string;
  shortName: string;
  tradeable: boolean;
  triggerable: boolean;
}

const API_HOST = import.meta.env.VITE_API_HOST;

interface Currency {
  [key: string]: string;
}

const currencies: Currency = {
  usd: "$",
  eur: "€",
  gbp: "£",
  jpy: "¥",
  chf: "CHF",
  cad: "CAD$",
  aud: "AUD$",
  cny: "¥",
  hkd: "HK$",
  nzd: "NZD$",
  sek: "SEK",
  nok: "NOK",
  dkk: "DKK",
  rub: "₽",
  inr: "₹",
  brl: "R$",
  zar: "ZAR",
  krw: "₩",
  idr: "IDR",
  mxn: "MXN$",
  sgd: "SGD$",
  myr: "MYR",
  try: "TRY",
  thb: "THB",
  php: "PHP",
  pln: "PLN",
  huf: "HUF",
  czk: "CZK",
  ron: "RON",
  ils: "₪",
  clp: "CLP",
  pen: "PEN",
  cop: "COP",
  ars: "ARS",
  isk: "ISK",
  kwd: "KWD",
  bhd: "BHD",
  omr: "OMR",
  jod: "JOD",
  egp: "EGP",
  qar: "QAR",
  sar: "SAR",
  aed: "AED",
};

const columnDefinition: Array<GridColDef> = [
  {
    field: "symbol",
    headerName: "Symbol",
    description: "Symbol",
    type: "string",
    flex: 2,
  },
  {
    field: "exchange",
    headerName: "Exchange",
    description: "Exchange",
    type: "string",
    flex: 1,
  },
  {
    field: "marketCap",
    headerName: "Market Cap",
    description: "Market Capitalization",
    flex: 2,
    pinnable: true,
    type: "number",
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      if (params.value == null) {
        return "";
      }

      const valueFormatted = Number(params.value / 1000 / 1000)
        .toFixed(0)
        .toLocaleString();
      return `${valueFormatted} bn.`;
    },
  },
  {
    field: "currency",
    headerName: "Currency",
    description: "Currency",
    type: "string",
    flex: 1,
    valueFormatter: (params: GridValueFormatterParams<string>) => {
      if (params.value == null) {
        return "";
      }

      const currencyName = params.value.toLowerCase();
      return currencies[currencyName];
    },
  },
  {
    field: "fullExchangeName",
    headerName: "Full Exchange Name",
    description: "Full Exchange Name",
    type: "string",
    flex: 2,
  },
  {
    field: "displayName",
    headerName: "Company Name",
    description: "Company Name",
    type: "string",
    flex: 2,
  },
  {
    field: "longName",
    headerName: "Long Name",
    description: "Long Name",
    type: "string",
    flex: 2,
  },
  {
    field: "market",
    headerName: "Market",
    description: "Market",
    type: "string",
    flex: 1,
    valueFormatter: (params: GridValueFormatterParams<number>) => {
      return startCase(String(params.value)).split(" ")[0].toUpperCase();
    },
  },
  {
    field: "quoteType",
    headerName: "Quote Type",
    description: "Quote Type",
    type: "string",
    flex: 1,
  },
  {
    field: "region",
    headerName: "Region",
    description: "Full Exchange Name",
    type: "string",
    flex: 1,
  },
];

const SymbolsList = () => {
  const { changeSymbol } = useSymbol();
  const [supportedSymbols, setSupportedSymbols] = useState<
    Array<ISupportedSymbols>
  >([]);

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
          initialState={{
            columns: {
              columnVisibilityModel: {
                fullExchangeName: false,
                longName: false,
                region: false,
                displayName: false,
              },
            },
          }}
          hideFooter
          disableColumnFilter
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
