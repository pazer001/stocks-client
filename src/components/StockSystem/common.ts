import { Currency } from "./interfaces";
import { GridColDef, GridValueFormatterParams } from "@mui/x-data-grid";
import { DateTime } from "luxon";
import { startCase } from "lodash";

export const currencies: Currency = {
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

export const columnDefinition: Array<GridColDef> = [
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
    field: "updatedAt",
    headerName: "Updated at",
    description: "Updated at",
    type: "string",
    flex: 1,
    valueFormatter: (params: GridValueFormatterParams<string>) => {
      return DateTime.fromISO(params.value).toISODate();
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
