import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl,
  IconButton, MenuItem, TextField,

  Tooltip, useTheme,
} from '@mui/material';
import { green, red, grey, blue } from '@mui/material/colors';

import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';

import {
  getByType,
  getInterval,
  getSelectedSymbol, getSymbolData,
  symbolAtom,
  useSymbol,
} from '../../atoms/symbol';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Interval } from './enums/Interval';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridToolbarContainer, GridToolbarDensitySelector,
  GridToolbarFilterButton, GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import styled from '@emotion/styled';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LinearProgress from '@mui/material/LinearProgress';
import { FilterListRounded, PlaylistRemoveOutlined } from '@mui/icons-material';

const ANALYZE_SYMBOLS_LIMIT = 200;


const FlickerAnimation = styled.div`

    @keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0.3;
        }
        100% {
            opacity: 1;
        }
    }

    color: red;
    animation: flickerAnimation 1s infinite;

`;


export interface ISymbol {
  id: number;
  symbolNumber: number;
  symbol: string;
  intervals: Array<Interval>;
  score: number;
  recommendation: 'Buy' | 'Sell' | 'Hold' | '';
  updatedAt: string;
  nextEarningReport: number;
  isPennyStock: boolean;
  logo: string;
  lastClose: number;
  name: string;
  stopLoss?: number;
}


const SymbolsList = () => {
  const [, setSymbolState] = useRecoilState(symbolAtom);
  const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const symbolData = useRecoilValue(getSymbolData);
  const interval = useRecoilValue(getInterval);
  const byType = useRecoilValue(getByType);
  const [suggestedSymbols, setSuggestedSymbols] = useState<Array<ISymbol>>([]);
  const theme = useTheme();
  const [checkSymbolsLoader, setCheckSymbolsLoader] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<Record<string, Array<string>>>(localStorage.getItem('watchlist') ? JSON.parse(localStorage.getItem('watchlist') as string) : {});
  const [currentWatchlistName, setCurrentWatchlistName] = useState<string>('');
  const [showOnlyChecked, setShowOnlyChecked] = useState<boolean>(false);
  const [analyzedCount, setAnalyzedCount] = useState<number>(0);
  const [maxAnalyzedCount, setMaxAnalyzedCount] = useState<number>(ANALYZE_SYMBOLS_LIMIT);
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

        if (symbolData.nextEarning) {
          const end = DateTime.fromSeconds(symbolData.nextEarning);
          const start = DateTime.now();

          const diffInMonths = end.diff(start, 'days');
          newSuggestedSymbols[symbolIndex].nextEarningReport = Number(diffInMonths.days.toFixed(0));
        }

        newSuggestedSymbols[symbolIndex].isPennyStock = symbolData.isPennyStock;
        newSuggestedSymbols[symbolIndex].lastClose = symbolData.prices[symbolData.prices.length - 1].point.close;
        newSuggestedSymbols[symbolIndex].name = symbolData.name;
        newSuggestedSymbols[symbolIndex].stopLoss = symbolData.atrBandsPercent.stopLoss.at(-1);
        newSuggestedSymbols[symbolIndex].score = score;


        return newSuggestedSymbols;
      });
    }
  }, [symbolData]);


  const handleCheckedSymbols = (rowSelectionModel: GridRowSelectionModel) => {
    if (!rowSelectionModel.length || !currentWatchlistName) return;

    setWatchlist(prevWatchlist => {
      const newWatchlist: Record<string, string[]> = {
        ...prevWatchlist,
        [currentWatchlistName]: rowSelectionModel.map(id => suggestedSymbols.find(symbol => symbol.id === id)?.symbol).filter((symbol): symbol is string => symbol !== undefined),
      };

      localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  };

  const clearSuggestions = () => {
    setAnalyzedCount(() => 0);
    setMaxAnalyzedCount(() => ANALYZE_SYMBOLS_LIMIT);
    setSuggestedSymbols((prevSuggestedSymbols) =>
      prevSuggestedSymbols.map((symbol) => ({
        ...symbol,
        recommendation: '',
      })),
    );
  };

  const filteredSymbols = useMemo(
    () => suggestedSymbols
      // .filter((supportedSymbol) => searchTerm ? supportedSymbol.symbol.includes(searchTerm.toUpperCase()) : true,)
      .filter((symbol: ISymbol) => showOnlyChecked && currentWatchlistName ? watchlist[currentWatchlistName].includes(symbol.symbol) : true)
    ,
    [suggestedSymbols, showOnlyChecked, watchlist, currentWatchlistName],
  );


  const checkSymbols = async () => {
    setCheckSymbolsLoader(true);
    let count = 0;
    // if (maxAnalyzedCount >= ANALYZE_SYMBOLS_LIMIT) {
    //   setMaxAnalyzedCount(analyzedCount + ANALYZE_SYMBOLS_LIMIT);
    // }
    setAnalyzedCount(() => 0);
    for (const i in suggestedSymbols) {
      if (count < ANALYZE_SYMBOLS_LIMIT && !suggestedSymbols[i].recommendation) {
        const symbol = suggestedSymbols[i].symbol;
        if (showOnlyChecked && !watchlist[currentWatchlistName].includes(symbol)) continue;
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

          if (analyzedSymbol.data.nextEarning) {
            const end = DateTime.fromSeconds(analyzedSymbol.data.nextEarning);
            const start = DateTime.now();

            const diffInMonths = end.diff(start, 'days');
            suggestedSymbols[i].nextEarningReport = Number(diffInMonths.days.toFixed(0));
          }

          suggestedSymbols[i].isPennyStock = analyzedSymbol.data.isPennyStock;
          suggestedSymbols[i].lastClose = analyzedSymbol.data.prices[analyzedSymbol.data.prices.length - 1].point.close;
          suggestedSymbols[i].name = analyzedSymbol.data.name;
          suggestedSymbols[i].stopLoss = analyzedSymbol.data.atrBandsPercent.stopLoss.at(-1);

          setSuggestedSymbols(() => [...suggestedSymbols]);
          setAnalyzedCount((prevAnalyzedCount) => prevAnalyzedCount + 1);
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

  const removeWatchlist = (watchlistName: string) => {

    setWatchlist((prevWatchlist) => {
      const modifiedWatchlist = { ...prevWatchlist };
      delete modifiedWatchlist[watchlistName];
      localStorage.setItem('watchlist', JSON.stringify(modifiedWatchlist));
      if (Object.keys(modifiedWatchlist).length) {
        setCurrentWatchlistName(() => Object.keys(modifiedWatchlist)[0]);
      } else {
        setCurrentWatchlistName(() => '');
      }

      return modifiedWatchlist;
    });

  };


  const nextEarningReportValue = (value: number) => {
    if (value === 1) {
      return <FlickerAnimation>{value}</FlickerAnimation>;
    } else if (value > 1) {
      return value;
    } else {
      return '-';
    }
  };

  const isPennyStock = (value: boolean) => {
    if (value === undefined || value === false) return '-';
    if (value) {
      return <CheckRoundedIcon sx={{ color: red[400] }} />;
    }
  };

  const renderLogo = (iconUrl: string, symbol: string) => {
    return <Avatar sx={{ width: 24, height: 24, bgcolor: blue[500] }} src={iconUrl}>{symbol[0]}</Avatar>;
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Priority',
      width: 20,
      sortable: true,
      filterable: false,
    },
    {
      field: 'symbol',
      headerName: 'Symbol',
      width: 85,
      sortable: false,
      filterable: true,
      renderCell: (params) => <Box display="flex"
                                   gap={theme => theme.spacing(1)}>{renderLogo(params.row.logo, params.row.symbol)} {params.row.symbol}</Box>,
    },
    {
      field: 'recommendation',
      headerName: 'Recommendation',
      width: 20,
      renderCell: (params) => getRecommendationSymbol(params.row.recommendation),
      sortable: false,
      filterable: false,
    },

    {
      field: 'stopLoss',
      headerName: 'Stop Loss',
      valueGetter: (params) => `${params.row.stopLoss ? `${params.row.stopLoss.toFixed(2)}%` : '-'}`,
      width: 70,
      sortable: false,
      filterable: false,
    },
    {
      field: 'nextEarningReport',
      headerName: 'Earning Report',
      width: 20,
      sortable: false,
      filterable: false,
      renderCell: (params) => nextEarningReportValue(params.row.nextEarningReport),
    },
    {
      field: 'score',
      headerName: 'Score',
      width: 20,
      renderCell: (params) => params.row.score !== undefined ? params.row.score.toFixed(0) : '-',
      sortable: true,
      filterable: false,
    },
    {
      field: 'lastClose',
      headerName: 'Last Close',
      valueGetter: (params) => params.row.lastClose ? params.row.lastClose.toFixed(2) : '-',
      minWidth: 70,
      sortable: false,
      filterable: false,

    },

    {
      field: 'name',
      headerName: 'Company Name',
      // valueGetter: (params) => params.row.lastClose ? params.row.lastClose.toFixed(2) : '-',
      minWidth: 60,
      hideable: true,
      sortable: false,
      filterable: false,
    },
    {
      field: 'isPennyStock',
      headerName: 'Penny Stock',
      width: 30,
      sortable: false,
      filterable: false,
      renderCell: (params) => isPennyStock(params.row.isPennyStock),
    },
  ];


  function CustomToolbar() {
    const [showAddWatchlist, setShowAddWatchlist] = useState<boolean>(false);
    const addWatchlistName = useRef<HTMLInputElement>(null);

    return (
      <GridToolbarContainer>

        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Tooltip title={`Check next ${ANALYZE_SYMBOLS_LIMIT} symbols`}>
            <IconButton size="small" onClick={checkSymbols}>
              <QueryStatsRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear recommendations">
            <span>
          <IconButton onClick={clearSuggestions} disabled={checkSymbolsLoader}>
            <ReplayRoundedIcon />
          </IconButton>
              </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          <TextField
            select
            disabled={Object.keys(watchlist).length === 0}
            fullWidth
            label="Watchlist"
            size="small"
            value={currentWatchlistName}
            onChange={(e) => setCurrentWatchlistName(e.target.value as string)}
            sx={{ width: '40%', marginInlineStart: 'auto' }}
          >
            {Object.keys(watchlist).map((watchlistName) => (
              <MenuItem dense key={watchlistName}
                        value={watchlistName}>{watchlistName} ({watchlist[watchlistName].length})</MenuItem>
            ))}
          </TextField>


          <ButtonGroup sx={{ marginLeft: theme.spacing(1) }}>
            <Tooltip title="Add watchlist">
              <Button size="large" onClick={() => setShowAddWatchlist(true)}>
                <PlaylistAddRoundedIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Remove watchlist">
              <Button size="large" onClick={() => removeWatchlist(currentWatchlistName)}>
                <PlaylistRemoveOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="Filter watchlist">
              <Button
                size="large"
                variant={showOnlyChecked ? 'contained' : 'outlined'}
                onClick={() => setShowOnlyChecked(!showOnlyChecked)}
              >
                <FilterListRounded />
              </Button>
            </Tooltip>
          </ButtonGroup>


          <Dialog open={showAddWatchlist} onClose={() => setShowAddWatchlist(false)} fullWidth>
            <DialogTitle>Add new watchlist</DialogTitle>
            <DialogContent dividers>
              <FormControl fullWidth>
                <TextField label="Watchlist name" size="small" inputRef={addWatchlistName} />
              </FormControl>
            </DialogContent>
            <DialogActions disableSpacing>
              <Button onClick={() => setShowAddWatchlist(false)} autoFocus>
                Cancel
              </Button>
              <Button onClick={() => {
                const watchlistName = addWatchlistName.current?.value;
                if (watchlistName) {
                  setWatchlist((prevWatchlist) => {
                    const modifiedWatchlist = { ...prevWatchlist, [watchlistName]: [] };
                    localStorage.setItem('watchlist', JSON.stringify(modifiedWatchlist));
                    return modifiedWatchlist;
                  });
                  setCurrentWatchlistName(addWatchlistName.current.value);
                  setShowAddWatchlist(false);
                }
              }}>
                Create
              </Button>
            </DialogActions>
          </Dialog>

        </Box>
        <Box sx={{ width: '100%' }}>
          <LinearProgress variant="determinate" value={analyzedCount / maxAnalyzedCount * 100} />
        </Box>
        <GridToolbarQuickFilter size="medium" sx={{ width: '100%' }} />
      </GridToolbarContainer>
    );
  }

  const rowSelectionModel = useMemo(() => currentWatchlistName ? suggestedSymbols.filter((symbol) => watchlist[currentWatchlistName].includes(symbol.symbol)).map((symbol) => symbol.id) : [], [watchlist, suggestedSymbols, currentWatchlistName]);

  useEffect(() => {
    const changeSuggestedSymbols = async () => {
      const suggestedSymbols = await getSuggestedSymbols();
      setSuggestedSymbols(() => suggestedSymbols.map((symbol, index) => ({
        ...symbol,
        id: index,
        symbolNumber: index + 1,
      })));
    };
    changeSuggestedSymbols();
  }, [byType]);

  return useMemo(
    () => (
      <DataGrid sx={{
        '& .MuiDataGrid-row': { // Targeting the row class
          cursor: 'pointer', // Set the cursor to pointer
        },
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
      }} checkboxSelection={currentWatchlistName !== ''}
                onRowClick={(row) => {
                  const newInterval = row.row.intervals.includes(interval)
                    ? interval
                    : row.row.intervals[0];
                  const newIntervals: Array<Interval> = [];
                  const systemIntervals = Object.values(Interval);

                  systemIntervals.forEach((systemInterval) => {
                    if (row.row.intervals.includes(systemInterval)) {
                      newIntervals.push(systemInterval);
                    }
                  });

                  setSymbolState((prevSymbolState) => ({
                    ...prevSymbolState,
                    selectedSymbol: row.row.symbol,
                    settings: {
                      ...prevSymbolState.settings,
                      intervals: newIntervals,
                      interval: newInterval,
                    },
                  }));
                }}
                rowSelectionModel={rowSelectionModel}
                disableColumnFilter
                disableColumnSelector
                disableDensitySelector
                disableColumnMenu
                disableRowSelectionOnClick
                density="compact"
                onRowSelectionModelChange={handleCheckedSymbols}
                rows={filteredSymbols}
                columns={columns} slotProps={{
        toolbar: {
          showQuickFilter: true,
        },
      }}
                slots={{ toolbar: CustomToolbar }}
                initialState={{
                  pagination: { paginationModel: { pageSize: 100 } },
                  columns: {
                    columnVisibilityModel: {
                      // Hide columns status and traderName, the other columns will remain visible
                      name: false,
                    },
                  },
                }}
      />
    ),
    [filteredSymbols, selectedSymbol, checkSymbolsLoader, watchlist, showOnlyChecked, rowSelectionModel, currentWatchlistName, analyzedCount, maxAnalyzedCount],
  );
};

export default React.memo(SymbolsList);
