import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Checkbox, FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton, ListItemIcon,
  ListItemText, Switch,
  // Tab,
  // Tabs,
  TextField,
  Tooltip,
} from '@mui/material';
import { green, red, grey } from '@mui/material/colors';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import CircularProgress from '@mui/material/CircularProgress';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
// import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
// import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import {
  getByType,
  getInterval,
  getSelectedSymbol, getSymbolData,
  symbolAtom,
  useSymbol,
} from '../../atoms/symbol';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Interval } from './enums/Interval';
// import Grid from "@mui/material/Grid";
// import SymbolChooser from "./SymbolChooser";
// import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
// import SendRoundedIcon from '@mui/icons-material/SendRounded';


// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function TabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;
//
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`simple-tabpanel-${index}`}
//       aria-labelledby={`simple-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ p: 3, padding: 0 }}>{children}</Box>}
//     </div>
//   );
// }

export interface ISymbol {
  _id: string;
  symbolNumber: number;
  symbol: string;
  intervals: Array<Interval>;
  score: number;
  recommendation: 'Buy' | 'Sell' | 'Hold' | '';
  updatedAt: string;
}

const SymbolsList = () => {
  // const [tab, setTab] = React.useState(0);
  // const moveTab = (event: React.SyntheticEvent, newValue: number) => {
  //   setTab(newValue);
  // };

  return (
    <Box sx={{ height: '100%' }}>
      {/*<Box sx={{ borderBottom: 1, borderColor: "divider" }}>*/}
      {/*  <Tabs value={tab} onChange={moveTab} variant="fullWidth">*/}
      {/*    <Tab label="Suggested symbols" />*/}
      {/*    <Tab label="Watchlists" />*/}
      {/*  </Tabs>*/}
      {/*</Box>*/}
      {/*<TabPanel value={tab} index={0}>*/}
      <SuggestedSymbols />
      {/*</TabPanel>*/}
      {/*<TabPanel value={tab} index={1}>*/}
      {/*  <WatchlistSymbols />*/}
      {/*</TabPanel>*/}
    </Box>
  );
};

const SuggestedSymbols = () => {
  const [, setSymbolState] = useRecoilState(symbolAtom);
  const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const symbolData = useRecoilValue(getSymbolData);
  const interval = useRecoilValue(getInterval);
  const byType = useRecoilValue(getByType);
  const [suggestedSymbols, setSuggestedSymbols] = useState<Array<ISymbol>>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [checkSymbolsLoader, setCheckSymbolsLoader] = useState<boolean>(false);
  const [checkedSymbols, setCheckedSymbols] = useState<Array<string>>(localStorage.getItem('watchlist') ? JSON.parse(localStorage.getItem('watchlist') as string) : []); // [
  const [showOnlyChecked, setShowOnlyChecked] = useState<boolean>(false); // [
  const { getSuggestedSymbols, analyzeSymbol } = useSymbol();

  useEffect(() => {
    const symbolIndex = suggestedSymbols.findIndex((symbol) => symbol.symbol === selectedSymbol);
    if (symbolIndex !== -1 && symbolData) {
      setSuggestedSymbols((prevSuggestedSymbols) => {
        const newSuggestedSymbols = [...prevSuggestedSymbols];
        const { minBuy, minSell } = symbolData.recommendationsLinesModified.bestPermutation;
        const score = symbolData.prices[symbolData.prices.length - 1].recommendation.score;
        if (score >= minBuy) {
          newSuggestedSymbols[symbolIndex].recommendation = 'Buy';
        } else if (score <= minSell) {
          newSuggestedSymbols[symbolIndex].recommendation = 'Sell';
        } else {
          newSuggestedSymbols[symbolIndex].recommendation = 'Hold';
        }


        return newSuggestedSymbols;
      });
    }
  }, [symbolData]);


  const handleCheckedSymbols = (value: number) => () => {
    const symbol = suggestedSymbols.find((symbol) => symbol.symbolNumber === value)?.symbol;
    if (symbol === undefined) return console.log('Symbol not found');
    // console.log(checkedSymbols, symbol, checkedSymbols.includes(symbol))

    setCheckedSymbols(prevCheckedSymbols => {
      const isChecked = prevCheckedSymbols.includes(symbol);
      let watchlist = [];
      if (isChecked) {
        watchlist = prevCheckedSymbols.filter((checkedSymbol) => checkedSymbol !== symbol);
      } else {
        watchlist = [...prevCheckedSymbols, symbol];
      }
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      return watchlist;
    });
  };

  const clearSuggestions = () => {
    setSuggestedSymbols((prevSuggestedSymbols) =>
      prevSuggestedSymbols.map((symbol) => ({
        ...symbol,
        recommendation: '',
      })),
    );
  };

  const filteredSymbols = useMemo(
    () => suggestedSymbols.filter((supportedSymbol) =>
      searchTerm ? supportedSymbol.symbol.includes(searchTerm.toUpperCase()) : true,
    ).filter((symbol: ISymbol) => showOnlyChecked ? checkedSymbols.includes(symbol.symbol) : true)
    ,
    [searchTerm, suggestedSymbols, showOnlyChecked, checkedSymbols],
  );

  const checkSymbols = async () => {
    setCheckSymbolsLoader(true);
    let count = 0;
    for (const i in suggestedSymbols) {
      if (count < 200 && !suggestedSymbols[i].recommendation) {
        const symbol = suggestedSymbols[i].symbol;
        if (showOnlyChecked && !checkedSymbols.includes(symbol)) continue;
        try {
          const analyzedSymbol = await analyzeSymbol(symbol);

          const { minBuy, minSell } =
            analyzedSymbol.data.recommendationsLinesModified.bestPermutation;
          suggestedSymbols[i].score =
            analyzedSymbol.data.prices[
            analyzedSymbol.data.prices.length - 1
              ].recommendation.score;

          if (suggestedSymbols[i].score >= minBuy) {
            suggestedSymbols[i].recommendation = 'Buy';
          } else if (suggestedSymbols[i].score <= minSell) {
            suggestedSymbols[i].recommendation = 'Sell';
          } else {
            suggestedSymbols[i].recommendation = 'Hold';
          }

          setSuggestedSymbols(() => [...suggestedSymbols]);
          count++;
        } catch (error) {
          console.log(error);
        }
      }
    }
    setCheckSymbolsLoader(false);
  };

  const getRecommendationSymbol = (recommendation: string) => {
    switch (recommendation) {
      case 'Buy': {
        return <TrendingUpRoundedIcon sx={{ color: green[400] }} />;
      }
      case 'Sell': {
        return <TrendingDownRoundedIcon sx={{ color: red[400] }} />;
      }
      case 'Hold': {
        return <TrendingFlatRoundedIcon sx={{ color: grey[400] }} />;
      }
      default: {
        return <ShowChartRoundedIcon />;
      }
    }
  };

  useEffect(() => {
    const changeSuggestedSymbols = async () => {
      let suggestedSymbols = await getSuggestedSymbols();
      suggestedSymbols = suggestedSymbols.map((symbol, index) => ({
        ...symbol,
        symbolNumber: index + 1,
      }));
      setSuggestedSymbols(suggestedSymbols);
    };
    changeSuggestedSymbols();
  }, [byType]);


  return useMemo(
    () => (
      <Box>
        <Box sx={{ paddingLeft: '0.5em', paddingRight: '0.5em' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Tooltip title="Check next 200 symbols">
              {checkSymbolsLoader ? (
                <IconButton>
                  <CircularProgress size={20} />
                </IconButton>
              ) : (
                <IconButton size="small" onClick={checkSymbols}>
                  <QueryStatsRoundedIcon />
                </IconButton>
              )}
            </Tooltip>
            <Tooltip title="Clear recommendations">
              <IconButton onClick={clearSuggestions} disabled={checkSymbolsLoader}>
                <ReplayRoundedIcon />
              </IconButton>
            </Tooltip>


            <FormControlLabel sx={{ marginInlineStart: 'auto' }}
                              control={<Switch onChange={(e) => setShowOnlyChecked(e.target.checked)}
                              />
                              }
                              disabled={!checkedSymbols.length}
                              label={`Filter selected (${checkedSymbols.length})`} />

          </Box>

          <TextField
            // label="Search symbol"
            fullWidth
            autoFocus
            placeholder="Search symbol"
            variant="standard"
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => setSearchTerm(event.target.value)}
            inputProps={{
              style: { textTransform: 'uppercase' },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <br />
        <List dense disablePadding sx={{ overflowY: 'auto', height: '38vh' }}>
          {filteredSymbols.map((item) => (
            <ListItem
              key={item.symbol}
              dense
              disablePadding
              divider
              secondaryAction={<Checkbox
                edge="start"
                checked={checkedSymbols.includes(item.symbol)}
                onChange={handleCheckedSymbols(item.symbolNumber)}
              />}
            >
              <ListItemButton onClick={() => {
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
              }}>
                <ListItemIcon>
                  {getRecommendationSymbol(item.recommendation)}
                </ListItemIcon>
                <ListItemText>
                  <p style={{ display: 'flex', gap: 12 }}>
                    <span>{item.symbolNumber}) </span>
                    <span>{item.symbol}</span>
                  </p>
                </ListItemText>
              </ListItemButton>

            </ListItem>
          ))}
        </List>
      </Box>
    ),
    [filteredSymbols, selectedSymbol, checkSymbolsLoader, checkedSymbols, showOnlyChecked],
  );
};

// const WatchlistSymbols = () => <div></div>;

// const WatchlistSymbols = () => {
//   const { getWatchlistSymbols, addWatchlistSymbols } = useSymbol();
//   const [, setSymbolState] = useRecoilState(symbolAtom);
//   const interval = useRecoilValue(getInterval);
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
//   const getWatchlist = async () => {
//     const watchListItemsResult = await getWatchlistSymbols();
//     setWatchlistItems(watchListItemsResult.data);
//   };
//
//   const addToWatchlist = async (symbols: Array<string>) => {
//     addWatchlistSymbols(symbols);
//     getWatchlist();
//   };
//
//   useEffect(() => {
//     getWatchlist();
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
//           onConfirm={(symbols: string[]) => {
//             setOpenSymbolChooser(() => false);
//             addToWatchlist(symbols);
//           }}
//         />
//         <List dense disablePadding sx={{ height: "86%", overflowY: "auto" }}>
//           {filteredSymbols.map((item) => (
//             <ListItem
//               key={item.symbol}
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
//                 <ListItemText primary={item.symbol}></ListItemText>
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
