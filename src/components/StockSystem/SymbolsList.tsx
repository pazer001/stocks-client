import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import axios, { AxiosResponse } from "axios";
import {
  getByType,
  getInterval,
  getSelectedSymbol,
  symbolAtom,
  useSymbol,
} from "../../atoms/symbol";
import { useRecoilState, useRecoilValue } from "recoil";
import { Interval } from "./enums/Interval";

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
  symbol: string;
  intervals: Array<Interval>;
  mainScore: number;
  updatedAt: string;
}

const API_HOST = import.meta.env.VITE_API_HOST;

const SymbolsList = () => {
  const [tab, setTab] = React.useState(0);
  const moveTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={moveTab} variant="fullWidth">
          <Tab label="Suggested symbols" />
          {/*<Tab label='My lists' />*/}
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <RandomSymbols />
      </TabPanel>
      {/*<TabPanel value={tab} index={1}>*/}
      {/*  <WatchlistSymbols />*/}
      {/*</TabPanel>*/}
    </Box>
  );
};

const RandomSymbols = () => {
  useSymbol();
  const [, setSymbolState] = useRecoilState(symbolAtom);
  const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const interval = useRecoilValue(getInterval);
  const byType = useRecoilValue(getByType);
  const [suggestedSymbols, setSuggestedSymbols] = useState<Array<ISymbol>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredSymbols = useMemo(
    () =>
      searchTerm
        ? suggestedSymbols.filter((supportedSymbol) =>
            supportedSymbol.symbol.includes(searchTerm.toUpperCase()),
          )
        : suggestedSymbols,
    [searchTerm, suggestedSymbols],
  );

  const getSuggestedSymbols = async () => {
    const supportedSymbolsResult: AxiosResponse<Array<ISymbol>> =
      await axios.get(
        `${API_HOST}/analyze/suggestedSymbols/${interval}/${byType}`,
      );
    setSuggestedSymbols(supportedSymbolsResult.data);
  };

  useEffect(() => {
    getSuggestedSymbols();
  }, []);

  return useMemo(
    () => (
      <Box height={{ height: "100%" }}>
        <TextField
          label="Search symbol"
          fullWidth
          margin="dense"
          size="small"
          onChange={(event) => setSearchTerm(event.target.value)}
          inputProps={{
            style: { textTransform: "uppercase" },
          }}
        />
        <List dense disablePadding sx={{ height: "86%", overflowY: "auto" }}>
          {filteredSymbols.map((item) => (
            <ListItem
              key={item.symbol}
              dense
              disableGutters
              disablePadding
              divider
            >
              <ListItemButton
                selected={item.symbol === selectedSymbol}
                dense
                onClick={() => {
                  const newInterval = item.intervals.includes(interval)
                    ? interval
                    : item.intervals[0];
                  const newIntervals: Array<Interval> = [];
                  const systemIntervals = Object.values(Interval);

                  systemIntervals.forEach((systemInterval) => {
                    if (item.intervals.includes(systemInterval)) {
                      newIntervals.push(systemInterval);
                    }
                  });

                  setSymbolState((prevSymbolState) => ({
                    ...prevSymbolState,
                    selectedSymbol: item.symbol,
                    settings: {
                      ...prevSymbolState.settings,
                      intervals: newIntervals,
                      interval: newInterval,
                    },
                  }));
                }}
              >
                <ListItemText primary={item.symbol}></ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    ),
    [filteredSymbols, selectedSymbol],
  );
};

// const WatchlistSymbols = () => {
//   useSymbol();
//   const [_, setSymbolState] = useRecoilState(symbolAtom);
//   const interval = useRecoilValue(getInterval);
//   const byType = useRecoilValue(getByType);
//   const [watchlistItems, setWatchlistItems] = useState<Array<ISymbol>>([]);
//   const [openSymbolChooser, setOpenSymbolChooser] = useState<boolean>(false);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const filteredSymbols = useMemo(
//     () =>
//       searchTerm
//         ? watchlistItems.filter((supportedSymbol) =>
//             supportedSymbol.symbol.includes(searchTerm.toUpperCase()),
//           )
//         : watchlistItems,
//     [searchTerm, watchlistItems],
//   );
//
//   const getWatchlistSymbols = async () => {
//     const watchListItemsResult = await axios.get(
//       `${API_HOST}/analyze/watchlist/${interval}/${byType}`,
//     );
//     setWatchlistItems(watchListItemsResult.data);
//   };
//
//   const addWatchlistSymbols = async (symbols: Array<string>) => {
//     await axios.post(`${API_HOST}/analyze/watchlist/items`, symbols);
//
//     const watchListItemsResult = await axios.get(`${API_HOST}/watchlist/items`);
//     setWatchlistItems(watchListItemsResult.data);
//   };
//
//   useEffect(() => {
//     getWatchlistSymbols();
//   }, []);
//
//   return useMemo(
//     () => (
//       <Box sx={{ height: "100%" }}>
//         <Grid container alignItems="center">
//           <Grid item>
//             <TextField
//               label="Search symbol"
//               margin="dense"
//               size="small"
//               onChange={(event) => setSearchTerm(event.target.value)}
//               inputProps={{
//                 style: { textTransform: "uppercase" },
//               }}
//             />
//           </Grid>
//           <Grid item>
//             <IconButton onClick={() => setOpenSymbolChooser(true)}>
//               <AddCircleOutlineRoundedIcon fontSize="small" />
//             </IconButton>
//           </Grid>
//         </Grid>
//         <SymbolChooser
//           open={openSymbolChooser}
//           onClose={() => setOpenSymbolChooser(false)}
//           onConfirm={(ids: string[]) => {
//             setOpenSymbolChooser(() => false);
//             addWatchlistSymbols(ids);
//           }}
//         />
//         <List dense disablePadding sx={{ height: "86%", overflowY: "auto" }}>
//           {filteredSymbols.map((item) => (
//             <ListItem
//               key={item._id}
//               dense
//               disableGutters
//               disablePadding
//               divider
//             >
//               <ListItemButton
//                 dense
//                 onClick={() => {
//                   const newInterval = item.intervals.includes(interval)
//                     ? interval
//                     : item.intervals[0];
//                   const newIntervals: Array<Interval> = [];
//                   const systemIntervals = Object.values(Interval);
//
//                   systemIntervals.forEach((systemInterval) => {
//                     if (item.intervals.includes(systemInterval)) {
//                       newIntervals.push(systemInterval);
//                     }
//                   });
//
//                   setSymbolState((prevSymbolState) => ({
//                     ...prevSymbolState,
//                     selectedSymbol: item.symbol,
//                     settings: {
//                       ...prevSymbolState.settings,
//                       intervals: newIntervals,
//                       interval: newInterval,
//                     },
//                   }));
//                 }}
//               >
//                 <ListItemText
//                   primary={item.symbol}
//                   secondary={`Suggest score: ${
//                     item.mainScore && item.mainScore.toFixed(0)
//                   }`}
//                 ></ListItemText>
//               </ListItemButton>
//             </ListItem>
//           ))}
//         </List>
//       </Box>
//     ),
//     [filteredSymbols, openSymbolChooser],
//   );
// };

export default React.memo(SymbolsList);
