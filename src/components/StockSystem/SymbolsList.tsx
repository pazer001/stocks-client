import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
} from "@mui/material";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import axios, { AxiosResponse } from "axios";
import { useSymbol } from "../../atoms/symbol";
import SymbolChooser from "./SymbolChooser";

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

  const [openSymbolChooser, setOpenSymbolChooser] = useState<boolean>(false);

  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={moveTab}>
          <Tab label="Random symbols" />
          <Tab label="My lists" />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <List dense disablePadding sx={{ height: "100%", overflowY: "auto" }}>
          {supportedSymbols.map((item) => (
            <ListItem
              key={item._id}
              dense
              disableGutters
              disablePadding
              divider
            >
              <ListItemButton dense onClick={() => changeSymbol(item.symbol)}>
                <ListItemText>{item.symbol}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {/*<DataGrid*/}
        {/*  sx={{ height: "100%" }}*/}
        {/*  density="compact"*/}
        {/*  columns={[*/}
        {/*    {*/}
        {/*      field: "symbol",*/}
        {/*      headerName: "Symbol",*/}
        {/*      description: "Symbol",*/}
        {/*      type: "string",*/}
        {/*    },*/}
        {/*  ]}*/}
        {/*  rows={supportedSymbols}*/}
        {/*  initialState={{*/}
        {/*    columns: {*/}
        {/*      columnVisibilityModel: {*/}
        {/*        fullExchangeName: false,*/}
        {/*        longName: false,*/}
        {/*        region: false,*/}
        {/*        displayName: false,*/}
        {/*      },*/}
        {/*    },*/}
        {/*  }}*/}
        {/*  getRowId={(row) => row.symbol}*/}
        {/*  hideFooter*/}
        {/*  onRowClick={(params) => changeSymbol(params.row.symbol)}*/}
        {/*  loading={!supportedSymbols}*/}
        {/*/>*/}
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <IconButton onClick={() => setOpenSymbolChooser(true)}>
          <AddCircleOutlineRoundedIcon fontSize="small" />
        </IconButton>
        <SymbolChooser
          open={openSymbolChooser}
          onClose={() => setOpenSymbolChooser(false)}
          onConfirm={(ids: string[]) => {
            setOpenSymbolChooser((prevState) => false);
            addWatchlistSymbols(ids);
          }}
        />

        <List dense disablePadding sx={{ height: "100%", overflowY: "auto" }}>
          {watchlistItems.map((item) => (
            <ListItem
              key={item._id}
              dense
              disableGutters
              disablePadding
              divider
            >
              <ListItemButton dense onClick={() => changeSymbol(item.symbol)}>
                <ListItemText>{item.symbol}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </TabPanel>
    </Box>
  );
};

export default React.memo(SymbolsList);
