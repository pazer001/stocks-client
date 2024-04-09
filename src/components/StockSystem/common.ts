import { Currency } from './interfaces';
import { GridColDef } from '@mui/x-data-grid';
import { get } from 'lodash';
import { GridValueFormatter } from '@mui/x-data-grid/models/colDef/gridColDef';

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
    flex: 1,
  },
  {
    field: "exchange",
    headerName: "Exchange",
    description: "Exchange",
    type: "string",
    flex: 1,
  },
  {
    field: "marketCapitalization",
    headerName: "Market Cap",
    description: "Market Capitalization",
    flex: 1,
    pinnable: true,
    type: "number",
    valueFormatter: (value: GridValueFormatter) => {
      if (value == null) {
        return "";
      }

      const valueFormatted = Number(Number(value) / 1000 / 1000)
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
    valueFormatter: (value: GridValueFormatter) => {
      if (value == null) {
        return "";
      }

      const currencyName = String(value).toLowerCase();
      return currencies[currencyName];
    },
  },
  {
    field: "exchange",
    headerName: "Exchange",
    description: "Exchange",
    type: "string",
    flex: 2,
  },
  {
    field: "name",
    headerName: "Company Name",
    description: "Company Name",
    type: "string",
    flex: 2,
  },
  {
    field: "quoteType",
    headerName: "Quote Type",
    description: "Quote Type",
    type: "string",
    flex: 1,
    valueGetter: (value, row, column, apiRef) => {
      return get(row, "quoteType.quoteType");
    },
  },
];
