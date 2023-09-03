import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material";
import { green, red, grey } from "@mui/material/colors";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import CircularProgress from "@mui/material/CircularProgress";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingFlatRoundedIcon from "@mui/icons-material/TrendingFlatRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import {
  getByType,
  getInterval,
  getSelectedSymbol,
  symbolAtom,
  useSymbol,
} from "../../atoms/symbol";
import { useRecoilState, useRecoilValue } from "recoil";
import { Interval } from "./enums/Interval";
import Grid from "@mui/material/Grid";
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
      {value === index && <Box sx={{ p: 3, padding: 0 }}>{children}</Box>}
    </div>
  );
}

export interface ISymbol {
  _id: string;
  symbol: string;
  intervals: Array<Interval>;
  score: number;
  recommendation: "Buy" | "Sell" | "Hold";
  updatedAt: string;
}

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
          <Tab label="Watchlists" />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <RandomSymbols />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <WatchlistSymbols />
      </TabPanel>
    </Box>
  );
};

const RandomSymbols = () => {
  const [, setSymbolState] = useRecoilState(symbolAtom);
  const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const interval = useRecoilValue(getInterval);
  const byType = useRecoilValue(getByType);
  const [suggestedSymbols, setSuggestedSymbols] = useState<Array<ISymbol>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [checkSymbolsLoader, setCheckSymbolsLoader] = useState<boolean>(false);
  const { getSuggestedSymbols, analyzeSymbol } = useSymbol();

  const filteredSymbols = useMemo(
    () =>
      searchTerm
        ? suggestedSymbols.filter((supportedSymbol) =>
            supportedSymbol.symbol.includes(searchTerm.toUpperCase()),
          )
        : suggestedSymbols,
    [searchTerm, suggestedSymbols],
  );

  const checkSymbols = async () => {
    setCheckSymbolsLoader(true);
    let count = 0;
    for (const i in suggestedSymbols) {
      if (count < 20 && !suggestedSymbols[i].recommendation) {
        const symbol = suggestedSymbols[i].symbol;
        const analyzedSymbol = await analyzeSymbol(symbol);
        const { minBuy, minSell } =
          analyzedSymbol.data.recommendationsLinesModified.bestPermutation;
        suggestedSymbols[i].score =
          analyzedSymbol.data.prices[
            analyzedSymbol.data.prices.length - 1
          ].recommendation.score;

        if (suggestedSymbols[i].score >= minBuy) {
          suggestedSymbols[i].recommendation = "Buy";
        } else if (suggestedSymbols[i].score <= minSell) {
          suggestedSymbols[i].recommendation = "Sell";
        } else {
          suggestedSymbols[i].recommendation = "Hold";
        }

        setSuggestedSymbols(() => [...suggestedSymbols]);
        count++;
      }
    }
    setCheckSymbolsLoader(false);
  };

  const getRecommendationSymbol = (index: number) => {
    if (index == undefined) return null;
    switch (suggestedSymbols[index].recommendation) {
      case "Buy": {
        return <TrendingUpRoundedIcon sx={{ color: green[400] }} />;
      }
      case "Sell": {
        return <TrendingDownRoundedIcon sx={{ color: red[400] }} />;
      }
      case "Hold": {
        return <TrendingFlatRoundedIcon sx={{ color: grey[400] }} />;
      }
      default: {
        return null;
      }
    }
  };

  useEffect(() => {
    const changeSuggestedSymbols = async () => {
      const suggestedSymbols = await getSuggestedSymbols();
      setSuggestedSymbols(suggestedSymbols);
    };
    changeSuggestedSymbols();
  }, [byType]);

  return useMemo(
    () => (
      <Box>
        <Tooltip title="Check next 10 symbols">
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
        <TextField
          label="Search symbol"
          fullWidth
          margin="dense"
          size="small"
          onChange={(event) => setSearchTerm(event.target.value)}
          inputProps={{
            style: { textTransform: "uppercase" },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
        />
        <List dense disablePadding sx={{ overflowY: "auto", height: "38vh" }}>
          {filteredSymbols.map((item, index) => (
            <ListItem
              key={item.symbol}
              dense
              disableGutters
              disablePadding
              divider
              secondaryAction={getRecommendationSymbol(index)}
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
    [filteredSymbols, selectedSymbol, checkSymbolsLoader],
  );
};

// const WatchlistSymbols = () => <div></div>;

const WatchlistSymbols = () => {
  const { getWatchlistSymbols, addWatchlistSymbols } = useSymbol();
  const [, setSymbolState] = useRecoilState(symbolAtom);
  const interval = useRecoilValue(getInterval);
  const [watchlistItems, setWatchlistItems] = useState<Array<ISymbol>>([]);
  const [openSymbolChooser, setOpenSymbolChooser] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const filteredSymbols = useMemo(
    () =>
      searchTerm
        ? watchlistItems.filter((supportedSymbol) =>
            supportedSymbol.symbol.includes(searchTerm.toUpperCase()),
          )
        : watchlistItems,
    [searchTerm, watchlistItems],
  );

  const getWatchlist = async () => {
    const watchListItemsResult = await getWatchlistSymbols();
    setWatchlistItems(watchListItemsResult.data);
  };

  const addToWatchlist = async (symbols: Array<string>) => {
    addWatchlistSymbols(symbols);
    getWatchlist();
  };

  useEffect(() => {
    getWatchlist();
  }, []);

  return useMemo(
    () => (
      <Box sx={{ height: "100%" }}>
        <Grid container alignItems="center">
          <Grid item>
            <TextField
              label="Search symbol"
              margin="dense"
              size="small"
              onChange={(event) => setSearchTerm(event.target.value)}
              inputProps={{
                style: { textTransform: "uppercase" },
              }}
            />
          </Grid>
          <Grid item>
            <IconButton onClick={() => setOpenSymbolChooser(true)}>
              <AddCircleOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
        <SymbolChooser
          open={openSymbolChooser}
          onClose={() => setOpenSymbolChooser(false)}
          onConfirm={(symbols: string[]) => {
            setOpenSymbolChooser(() => false);
            addToWatchlist(symbols);
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
    [filteredSymbols, openSymbolChooser],
  );
};

export default React.memo(SymbolsList);
