import React, { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios, { AxiosResponse } from "axios";
import { useSymbol } from "../../atoms/symbol";
import SymbolChooser from "./SymbolChooser";
import { columnDefinition } from "./common";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, height: 400, padding: 0 }}>{children}</Box>
      )}
    </div>
  );
}

export interface ISymbol {
  _id: string;
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

const SymbolsList = () => {
  const { changeSymbol } = useSymbol();
  const [tab, setTab] = React.useState(0);
  const [openSymbolChooser, setOpenSymbolChooser] =
    React.useState<boolean>(false);

  const [supportedSymbols, setSupportedSymbols] = useState<Array<ISymbol>>([]);
  const [watchlistItems, setWatchlistItems] = useState<Array<ISymbol>>([]);

  const moveTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const addWatchlistSymbols = async (symbols: Array<string>) => {
    await axios.post(`${API_HOST}/watchlist/items`, symbols);

    const watchListItemsResult = await axios.get(`${API_HOST}/watchlist/items`);
    setWatchlistItems(watchListItemsResult.data);
  };

  useEffect(() => {
    const getInitialLists = async () => {
      const supportedSymbolsResult: AxiosResponse<Array<ISymbol>> =
        await axios.get(`${API_HOST}/analyze/supportedSymbols`);

      setSupportedSymbols(
        supportedSymbolsResult.data.map((symbolData) => ({
          ...symbolData,
          id: symbolData._id,
        }))
      );

      const watchListItemsResult = await axios.get(
        `${API_HOST}/watchlist/items`
      );
      setWatchlistItems(watchListItemsResult.data);
    };
    getInitialLists();
  }, []);

  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={moveTab}>
          <Tab label="Random symbols" />
          <Tab label="My lists" />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <DataGrid
          sx={{ height: "100%" }}
          density="compact"
          columns={[
            {
              field: "symbol",
              headerName: "Symbol",
              description: "Symbol",
              type: "string",
            },
          ]}
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
          getRowId={(row) => row.symbol}
          hideFooter
          onRowClick={(params) =>
            changeSymbol(params.row.symbol, params.row.intervals)
          }
          loading={!supportedSymbols}
          // slots={{ toolbar: GridToolbar }}
          // slotProps={{
          //   toolbar: {
          //     showQuickFilter: true,
          //     quickFilterProps: { debounceMs: 500 },
          //   },
          // }}
        />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <IconButton onClick={() => setOpenSymbolChooser(true)}>
          <AddCircleOutlineRoundedIcon fontSize="small" />
          <SymbolChooser
            open={openSymbolChooser}
            onClose={() => setOpenSymbolChooser(false)}
            onConfirm={(ids: string[]) => {
              setOpenSymbolChooser(false);
              addWatchlistSymbols(ids);
            }}
          />
        </IconButton>
        <DataGrid
          sx={{ height: "91%" }}
          density="compact"
          columns={[
            {
              field: "symbol",
              headerName: "Symbol",
              description: "Symbol",
              type: "string",
            },
          ]}
          rows={watchlistItems}
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
          getRowId={(row) => row.symbol}
          hideFooter
          disableColumnFilter
          onRowClick={(params) =>
            changeSymbol(params.row.symbol, params.row.intervals)
          }
          loading={!supportedSymbols}
          // slots={{ toolbar: GridToolbar }}
          // slotProps={{
          //   toolbar: {
          //     showQuickFilter: true,
          //     quickFilterProps: { debounceMs: 500 },
          //   },
          // }}
        />
      </TabPanel>
    </Box>
  );
};

export default React.memo(SymbolsList);
