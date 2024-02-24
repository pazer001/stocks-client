import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box, Divider, FormControl,
  IconButton, InputLabel, MenuItem, Select,

  Tooltip,
} from '@mui/material';
import { green, red, grey, blue } from '@mui/material/colors';

import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import CircularProgress from '@mui/material/CircularProgress';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
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
  // const [searchTerm, setSearchTerm] = useState<string>('');
  const [checkSymbolsLoader, setCheckSymbolsLoader] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<Record<string, Array<string>>>(localStorage.getItem('watchlist') ? JSON.parse(localStorage.getItem('watchlist') as string) : {});
  const [currentWatchlistId, setCurrentWatchlistId] = useState<string>('');
  const [showOnlyChecked] = useState<boolean>(false); // [
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


        return newSuggestedSymbols;
      });
    }
  }, [symbolData]);


  const handleCheckedSymbols = (rowSelectionModel: GridRowSelectionModel) => {
    if (!rowSelectionModel.length) return;

    setWatchlist(prevWatchlist => {
      const newWatchlist: Record<string, string[]> = {
        ...prevWatchlist,
        [currentWatchlistId]: rowSelectionModel.map(id => suggestedSymbols.find(symbol => symbol.id === id)?.symbol).filter((symbol): symbol is string => symbol !== undefined),
      };

      localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
      return newWatchlist;
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
    () => suggestedSymbols
      // .filter((supportedSymbol) => searchTerm ? supportedSymbol.symbol.includes(searchTerm.toUpperCase()) : true,)
      .filter((symbol: ISymbol) => showOnlyChecked ? watchlist[currentWatchlistId].includes(symbol.symbol) : true)
    ,
    [suggestedSymbols, showOnlyChecked, watchlist],
  );


  const checkSymbols = async () => {
    setCheckSymbolsLoader(true);
    let count = 0;
    for (const i in suggestedSymbols) {
      if (count < 200 && !suggestedSymbols[i].recommendation) {
        const symbol = suggestedSymbols[i].symbol;
        if (showOnlyChecked && !watchlist[currentWatchlistId].includes(symbol)) continue;
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
      const suggestedSymbols = await getSuggestedSymbols();
      setSuggestedSymbols(() => suggestedSymbols.map((symbol, index) => ({
        ...symbol,
        id: index,
        symbolNumber: index + 1,
      })));
    };
    changeSuggestedSymbols();
  }, [byType]);


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
      sortable: false,
      filterable: false,
    },
    {
      field: 'logo',
      headerName: 'Logo',
      width: 20,
      sortable: false,
      filterable: false,
      renderCell: (params) => renderLogo(params.row.logo, params.row.symbol),
    },
    {
      field: 'symbol',
      headerName: 'Symbol',
      width: 70,
      sortable: false,
      filterable: false,
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
      field: 'score',
      headerName: 'Score',
      width: 20,
      renderCell: (params) => params.row.score !== undefined ? params.row.score.toFixed(0) : '-',
      sortable: true,
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
    return (
      <GridToolbarContainer>
        <GridToolbarQuickFilter sx={{ width: '100%' }} />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
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
            <span>
          <IconButton onClick={clearSuggestions} disabled={checkSymbolsLoader}>
            <ReplayRoundedIcon />
          </IconButton>
              </span>
          </Tooltip>


          {/*<FormControlLabel sx={{ marginInlineStart: 'auto' }}*/}
          {/*                  control={<Switch checked={showOnlyChecked}*/}
          {/*                                   onChange={(e) => setShowOnlyChecked(e.target.checked)}*/}
          {/*                  />*/}
          {/*                  }*/}
          {/*                  disabled={!watchlist.length}*/}
          {/*                  label={`Filter selected (${watchlist.length})`} />*/}
          <FormControl margin="none" size="small" sx={{ width: '30%', marginInlineStart: 'auto', marginRight: '1em' }}>
            <InputLabel>Watchlist</InputLabel>
            <Select fullWidth
                    placeholder={'Watchlist'}
                    size="small"
              // variant="standard"
                    value={currentWatchlistId}
                    label="Watchlist"
                    onChange={(e) => setCurrentWatchlistId(e.target.value as string)}
            >
              <MenuItem value={0}>My Watchlist</MenuItem>

            </Select>

          </FormControl>
          <Tooltip title="Add new watchlist">
            <IconButton size="small">
              <AddCircleRoundedIcon />
            </IconButton>
          </Tooltip>

        </Box>
        <Divider variant={'fullWidth'} />
      </GridToolbarContainer>
    );
  }

  const rowSelectionModel = useMemo(() => currentWatchlistId ? suggestedSymbols.filter((symbol) => watchlist[currentWatchlistId].includes(symbol.symbol)).map((symbol) => symbol.id) : [], [watchlist, suggestedSymbols]);


  return useMemo(
    () => (
      <Box>

        <DataGrid sx={{
          height: 'calc(100dvh - 48px)',
          '& .MuiDataGrid-row': { // Targeting the row class
            cursor: 'pointer', // Set the cursor to pointer
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }} checkboxSelection
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
        <br />

      </Box>
    ),
    [filteredSymbols, selectedSymbol, checkSymbolsLoader, watchlist, showOnlyChecked, rowSelectionModel, currentWatchlistId],
  );
};

export default React.memo(SymbolsList);
