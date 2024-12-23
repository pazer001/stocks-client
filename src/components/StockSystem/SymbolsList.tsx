import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box, Button, ButtonGroup, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  MenuItem, TextField,
  useMediaQuery,
  Tooltip, Typography, useTheme,
} from '@mui/material';
import { green, red, grey, blue, yellow } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';

import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
// import NewspaperIcon from '@mui/icons-material/Newspaper';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import MoneyOffCsredIcon from '@mui/icons-material/MoneyOffCsred';
import {
  getByType,
  getInterval,
  getSelectedSymbol, getSymbolData,
  symbolAtom, SymbolData, TRiskLevel,
  useSymbol,
} from '../../atoms/symbol';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Interval } from './enums/Interval';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel, useGridApiRef,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import styled from '@emotion/styled';
import LinearProgress from '@mui/material/LinearProgress';
import { FilterListRounded, PlaylistRemoveOutlined } from '@mui/icons-material';
import { useExtraData } from '../../atoms/extraData';
import numeral from 'numeral';

const ANALYZE_SYMBOLS_LIMIT = 200;


export const FlickerAnimation = styled.span`
    @keyframes flickerAnimation {
        0% {
            text-shadow: ${red.A700} 0 0 0;
        }
        50% {
            text-shadow: ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px, ${red.A700} 0 0 20px;
        }
        100% {
            text-shadow: ${red.A700} 0 0 0;
        }
        /* from {
          text-shadow: 0 0 0px ${red.A700}, 0 0 0px ${red.A700}, 0 0 0px ${red.A700},
          0 0 0px ${red.A700};
        } to {
          text-shadow: 0 0 10px ${red.A700}, 0 0 20px ${red.A700}, 0 0 30px ${red.A700},
          0 0 40px ${red.A700};
        } */
    }

    animation: flickerAnimation .7s infinite;
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
  stopLoss?: Array<number>;
  newsSentiment?: 'positive' | 'negative' | 'neutral';
  riskLevel: TRiskLevel;
  priorityScore: number;
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
  const dataGridRef = useGridApiRef();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { historicalDataCombined } = useExtraData();
  const [informativeEvent, setInformativeEvent] = useState<string>('');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleInformativeEvent = async () => {
    const currentDate = DateTime.now();
    let date;
    switch (currentDate.weekday) {
      case 5:
        date = DateTime.now().plus({ days: 3 }).toISODate();
        break;
      case 6:
        date = DateTime.now().plus({ days: 2 }).toISODate();
        break;
      default:
        date = DateTime.now().plus({ days: 1 }).toISODate();
        break;
    }


    const possibleAlertsStrings = ['Fed Interest Rate Decision', 'PPI', 'CPI', 'Core CPI', 'Core PPI', 'Core PCE Price Index', 'PCE Price index'];


    const startDate = DateTime.now().minus({ days: 1 }).toUnixInteger();
    const endDate = DateTime.now().toUnixInteger();
    const historicalDataCombinedResponse = await historicalDataCombined('^VIX', '1d', startDate, endDate);

    if (historicalDataCombinedResponse !== undefined && historicalDataCombinedResponse.normal.close.length) {
      const lastClose = historicalDataCombinedResponse.normal.close[historicalDataCombinedResponse.normal.close.length - 1];
      if (lastClose > 20) {
        setInformativeEvent('Market is volatile. Consider hedging your positions.');
      }

    }
    // if (getEconomicEventsDataResponse !== undefined) {
    //   getEconomicEventsDataResponse.forEach((event) => {
    //     if (possibleAlertsStrings.includes(event.eventName)) {
    //       setInformativeEvent(`Next trading day: ${event.eventName} report.`);
    //       return;
    //     }
    //   });
    //
    // }
  };

  useEffect(() => {
    handleInformativeEvent();
  }, []);

  const updatedSuggestedSymbols = (suggestedSymbols: ISymbol[], symbolData: SymbolData | undefined, index: number): ISymbol[] => {
    const newSuggestedSymbols = [...suggestedSymbols];
    if (symbolData) {
      const { minBuy, minSell } = symbolData.recommendationsLines.bestPermutation;
      const score = symbolData.recommendations[symbolData.recommendations.length - 1].recommendation.score;
      if (score >= minBuy) {
        suggestedSymbols[index].recommendation = 'Buy';
      } else if (score <= minSell) {
        suggestedSymbols[index].recommendation = 'Sell';
      } else {
        suggestedSymbols[index].recommendation = 'Hold';
      }

      if (symbolData.nextEarning) {
        const end = DateTime.fromSeconds(symbolData.nextEarning);
        const start = DateTime.now();

        const diffInMonths = end.diff(start, 'days');
        newSuggestedSymbols[index].nextEarningReport = Number(diffInMonths.days.toFixed(0));
      }

      newSuggestedSymbols[index].isPennyStock = symbolData.isPennyStock;
      newSuggestedSymbols[index].lastClose = symbolData.recommendations[symbolData.recommendations.length - 1].point.close;
      newSuggestedSymbols[index].symbol = symbolData.symbol;
      newSuggestedSymbols[index].stopLoss = symbolData.stopLoss;
      newSuggestedSymbols[index].score = score;
      newSuggestedSymbols[index].riskLevel = symbolData.riskLevel;
      newSuggestedSymbols[index].priorityScore = symbolData.priorityScore;
    }

    return newSuggestedSymbols;
  };


  const handleCheckedSymbols = (rowSelectionModel: GridRowSelectionModel) => {
    if (!currentWatchlistName) return;

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
      .filter((supportedSymbol) => searchTerm ? supportedSymbol.symbol.includes(searchTerm.toUpperCase()) : true)
      .filter((symbol: ISymbol) => showOnlyChecked && currentWatchlistName ? watchlist[currentWatchlistName].includes(symbol.symbol) : true)
    ,
    [suggestedSymbols, showOnlyChecked, watchlist, currentWatchlistName, searchTerm],
  );

  const checkSymbols = async () => {
    setCheckSymbolsLoader(true);
    let count = 0;
    const limit = showOnlyChecked && currentWatchlistName ? watchlist[currentWatchlistName].length : ANALYZE_SYMBOLS_LIMIT;
    setAnalyzedCount(() => 0);
    setMaxAnalyzedCount(() => limit);
    const data = dataGridRef.current.state.filter.filteredRowsLookup;

    for (let i in data) {
      if (dataGridRef.current.state.filter.filteredRowsLookup[i] === false) continue;
      const index = Number(i);
      if (count < limit && !suggestedSymbols[index].recommendation) {
        const symbol = suggestedSymbols[index].symbol;

        if (showOnlyChecked && !watchlist[currentWatchlistName].includes(symbol)) continue;

        try {
          const analyzedSymbol = await analyzeSymbol(symbol);
          const newSuggestedSymbols = updatedSuggestedSymbols(suggestedSymbols, analyzedSymbol.data, index);

          const rowExists = dataGridRef.current.getRow(newSuggestedSymbols[index].id) != null;
          if (rowExists) {
            dataGridRef.current.updateRows([{ ...newSuggestedSymbols[index] }]);
          }

          // setSuggestedSymbols(() => [...newSuggestedSymbols]);
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
        return <TrendingUpRoundedIcon fontSize="small" sx={{ color: green[400] }} />;
      }
      case 'Sell': {
        return <TrendingDownRoundedIcon fontSize="small" sx={{ color: red[400] }} />;
      }
      case 'Hold': {
        return <TrendingFlatRoundedIcon fontSize="small" sx={{ color: grey[400] }} />;
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
    if (value <= 3) {
      return <FlickerAnimation>2</FlickerAnimation>;
    } else if (value > 3) {
      return value;
    }

    return '-';
  };


  const renderLogo = (iconUrl: string, symbol: string) => {
    return <Avatar sx={{ width: 24, height: 24, bgcolor: blue[500] }} src={iconUrl}>{symbol[0]}</Avatar>;
  };

  const renderStopLoss = (values: Array<number>) => {
    if (!values || values.length === 0) return '-';
    return <Box sx={{ lineHeight: 0.5 }} display="flex" justifyContent="center" height="100%" flexDirection="column">
      {values.map((value, index) => {
        return <Box key={index}><Typography sx={{ lineHeight: 1.2 }}
                                            variant="caption">SL{index + 1}: {value.toFixed(1)}%</Typography></Box>;
      })}
    </Box>;
  };

  const renderPrice = (price: number, isPennyStock: boolean) => {
    return (
      <Box alignItems={'center'}>
        {isPennyStock
          ? <Tooltip placement="top" title={'Penny Stock'}><Chip icon={<MoneyOffCsredIcon fontSize="small" />}
                                                                 color="warning" label={price.toFixed(2)} size="small"
                                                                 variant="outlined" /></Tooltip>
          : <Typography variant="caption">
            {price.toFixed(2)}
          </Typography>
        }
      </Box>
    );
  };

  const renderWatchlistCheckbox = useCallback((symbol: string, watchlist: Record<string, Array<string>>, currentWatchlistName: string) => {
    if (watchlist && currentWatchlistName) {
      const checked = watchlist[currentWatchlistName].includes(symbol);
      return useMemo(() =>
        <Checkbox
          checked={checked}
          onClick={(event) => {
            event.stopPropagation(); // Stop the click from propagating to the row
          }}
          onChange={(event) => {
            event.stopPropagation(); // Also stop the change event from propagating
            checkWatchlistSymbols(symbol, currentWatchlistName, event.target.checked);
          }}
        />, [checked],
      );
    }
  }, [currentWatchlistName, watchlist]);


  const checkWatchlistSymbols = (symbol: string, currentWatchlistName: string, isChecked: boolean) => {
    if (isChecked) {
      setWatchlist((prevWatchlist) => {
        const modifiedWatchlist = {
          ...prevWatchlist,
          [currentWatchlistName]: [...prevWatchlist[currentWatchlistName], symbol],
        };
        localStorage.setItem('watchlist', JSON.stringify(modifiedWatchlist));
        return modifiedWatchlist;
      });
    } else {
      setWatchlist((prevWatchlist) => {
        const modifiedWatchlist = {
          ...prevWatchlist,
          [currentWatchlistName]: prevWatchlist[currentWatchlistName].filter((watchlistSymbol) => watchlistSymbol !== symbol),
        };
        localStorage.setItem('watchlist', JSON.stringify(modifiedWatchlist));
        return modifiedWatchlist;
      });
    }
  };

  // const renderNewsSentiment = (sentiment: string) => {
  //   switch (sentiment) {
  //     case 'positive': {
  //       return <NewspaperIcon sx={{ color: green[400] }} />;
  //     }
  //     case 'negative': {
  //       return <NewspaperIcon sx={{ color: red[400] }} />;
  //     }
  //     case 'neutral': {
  //       return null;
  //     }
  //     default: {
  //       return null;
  //     }
  //   }
  // };

  const renderRiskLevel = (riskLevel: TRiskLevel) => {
    switch (riskLevel) {
      case 'Low': {
        return <SignalCellularAltIcon fontSize="small" sx={{ color: green[400] }} />;
      }
      case 'Medium': {
        return <SignalCellularAltIcon fontSize="small" sx={{ color: yellow[400] }} />;
      }
      case 'High': {
        return <SignalCellularAltIcon fontSize="small" sx={{ color: red[400] }} />;
      }
      default: {
        return '-';
      }
    }
  };


  const columns: GridColDef[] = [
    {
      field: 'watchlist',
      headerName: '',
      minWidth: 20,
      flex: 1,
      sortable: false,
      filterable: false,
      hideable: true,
      renderCell: (params) => renderWatchlistCheckbox(params.row.symbol, watchlist, currentWatchlistName),

    },
    {
      field: 'symbolNumber',
      headerName: 'Priority',
      minWidth: 60,
      flex: 1,
      sortable: true,
      filterable: false,
    },
    {
      field: 'symbol',
      headerName: 'Symbol',
      minWidth: 100,
      flex: 1,
      sortable: false,
      filterable: true,
      renderCell: (params) => <Box display="flex" alignItems="center"
                                   gap={theme => theme.spacing(1)}>{renderLogo(params.row.logo, params.row.symbol)} {params.row.symbol}</Box>,
    },
    {
      field: 'recommendation',
      headerName: 'Status',
      minWidth: 56,
      flex: 1,
      renderCell: (params) => <Box display="flex" alignItems="center"
                                   height="100%">{getRecommendationSymbol(params.row.recommendation)}</Box>,
      sortable: false,
      filterable: false,
    },

    {
      field: 'stopLoss',
      headerName: 'SL',
      // valueGetter: (params) => `${params.row.stopLoss ? `${params.row.stopLoss.toFixed(2)}%` : '-'}`,
      minWidth: 80,
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => renderStopLoss(params.row.stopLoss || []),
    },
    {
      field: 'nextEarningReport',
      headerName: 'Earning Report',
      minWidth: 50,
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => nextEarningReportValue(params.row.nextEarningReport),
    },

    {
      field: 'lastClose',
      headerName: 'Price',
      minWidth: 80,
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => params.row.lastClose ? renderPrice(params.row.lastClose, params.row.isPennyStock) : '-',
    },
    {
      field: 'averageVolume',
      headerName: 'Average Volume',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => params.row.averageVolume ? numeral(params.row.averageVolume).format('0.0a') : '-',
      valueGetter: (value) => value !== undefined ? Number(Number(value).toFixed(0)) : '-',
      sortComparator: (v1, v2) => Number(v1) - Number(v2),
      sortable: true,
      filterable: true,
      type: 'number',
    },
    {
      field: 'marketCapitalization',
      headerName: 'Market Cap',
      minWidth: 100,
      flex: 1,
      valueGetter: (value) => value !== undefined ? numeral(Number(value) * 1000).format('0.0a') : '-',
      sortComparator: (v1, v2) => Number(v1) - Number(v2),
      sortable: true,
      filterable: true,
      type: 'number',
    },
    {
      field: 'priorityScore',
      headerName: 'Priority Score',
      minWidth: 60,
      flex: 1,
      sortable: true,
      filterable: false,
      valueGetter: (value) => value !== undefined ? Number(value).toFixed(0) : '-',
      sortComparator: (v1, v2) => Number(v1) - Number(v2),
    },
    // {
    //   field: 'score',
    //   headerName: 'Score',
    //   width: 20,
    //   valueGetter: (value) => value !== undefined ? Number(value).toFixed(0) : '-',
    //   sortComparator: (v1, v2) => Number(v1) - Number(v2),
    //   sortable: true,
    //   filterable: false,
    // },


    // {
    //   field: 'newsSentiment',
    //   headerName: 'News Sentiment',
    //   minWidth: 60,
    //   hideable: true,
    //   sortable: false,
    //   filterable: false,
    //   renderCell: (params) => renderNewsSentiment(params.row.newsSentiment || ''),
    // },
    // {
    //   field: 'riskLevel',
    //   headerName: 'Risk',
    //   minWidth: 20,
    //   hideable: true,
    //   sortable: false,
    //   filterable: false,
    //   renderCell: (params) => renderRiskLevel(params.row.riskLevel),
    // },

    {
      field: 'name',
      headerName: 'Company Name',
      // minWidth: 60,
      hideable: true,
      sortable: false,
      filterable: false,
    },

  ];

  interface AnalyzedCountProps {
    analyzedCount: number;
    maxAnalyzedCount: number;
  }

  const AnalyzedCount = (props: AnalyzedCountProps) => {
    return <Box width="100%">
      <LinearProgress variant="determinate" value={props.analyzedCount / props.maxAnalyzedCount * 100} />
    </Box>;
  };

  // const handleSearch = useCallback(
  //   (event: React.ChangeEvent<HTMLInputElement>) => {
  //     setSearchTerm(event.target.value);
  //   },
  //   [setSearchTerm], // dependencies array, setSearchTerm is stable and doesn't technically need to be included, but it's a good practice
  // );

  // const CustomToolbar = useCallback(() => {
  //   const [showAddWatchlist, setShowAddWatchlist] = useState<boolean>(false);
  //   const addWatchlistName = useRef<HTMLInputElement>(null);
  //
  //   return <Box display="flex" gap={theme.spacing(1)} flexDirection="column">
  //
  //     {/*<GridToolbarFilterButton />*/}
  //     {/*<GridToolbarDensitySelector />*/}
  //
  //     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
  //
  //
  //       <TextField
  //         select
  //         disabled={Object.keys(watchlist).length === 0}
  //         fullWidth
  //         label="Watchlist"
  //         size="small"
  //         value={currentWatchlistName}
  //         onChange={(e) => setCurrentWatchlistName(e.target.value as string)}
  //         sx={{ width: '70%' }}
  //       >
  //         {Object.keys(watchlist).map((watchlistName) => (
  //           <MenuItem dense key={watchlistName}
  //                     value={watchlistName}>{watchlistName} ({watchlist[watchlistName].length})</MenuItem>
  //         ))}
  //       </TextField>
  //
  //       <ButtonGroup sx={{ marginInlineStart: theme.spacing(1) }}>
  //         <Tooltip title="Filter watchlist">
  //           <span>
  //           <Button
  //             disabled={!currentWatchlistName || watchlist[currentWatchlistName].length === 0}
  //             size="large"
  //             variant={showOnlyChecked ? 'contained' : 'outlined'}
  //             onClick={() => setShowOnlyChecked(!showOnlyChecked)}
  //           >
  //             <FilterListRounded />
  //           </Button>
  //             </span>
  //         </Tooltip>
  //         <Tooltip title="Add watchlist">
  //           <Button size="large" onClick={() => setShowAddWatchlist(true)}>
  //             <PlaylistAddRoundedIcon />
  //           </Button>
  //         </Tooltip>
  //         <Tooltip title="Remove watchlist">
  //           <Button size="large" onClick={() => removeWatchlist(currentWatchlistName)}>
  //             <PlaylistRemoveOutlined />
  //           </Button>
  //         </Tooltip>
  //
  //       </ButtonGroup>
  //
  //
  //       <Dialog open={showAddWatchlist} onClose={() => setShowAddWatchlist(false)} fullWidth>
  //         <DialogTitle>Add watchlist</DialogTitle>
  //         <DialogContent dividers>
  //           <FormControl fullWidth>
  //             <TextField label="Watchlist name" size="small" inputRef={addWatchlistName} />
  //           </FormControl>
  //         </DialogContent>
  //         <DialogActions disableSpacing>
  //           <Button onClick={() => setShowAddWatchlist(false)} autoFocus>
  //             Cancel
  //           </Button>
  //           <Button onClick={() => {
  //             const watchlistName = addWatchlistName.current?.value;
  //             if (watchlistName) {
  //               setWatchlist((prevWatchlist) => {
  //                 const modifiedWatchlist = { ...prevWatchlist, [watchlistName]: [] };
  //                 localStorage.setItem('watchlist', JSON.stringify(modifiedWatchlist));
  //                 return modifiedWatchlist;
  //               });
  //               setCurrentWatchlistName(addWatchlistName.current.value);
  //               setShowAddWatchlist(false);
  //             }
  //           }}>
  //             Create
  //           </Button>
  //         </DialogActions>
  //       </Dialog>
  //
  //     </Box>
  //
  //
  //     <AnalyzedCount />
  //   </Box>;
  // }, [suggestedSymbols, watchlist, currentWatchlistName]);

  const Filter = useCallback(() => {
    const [showAddWatchlist, setShowAddWatchlist] = useState<boolean>(false);
    const addWatchlistName = useRef<HTMLInputElement>(null);

    const addWatchlist = () => {
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
    };
    return useMemo(() =>
      <Box sx={{ display: 'flex', alignItems: 'center'}}>
        <TextField
          select
          disabled={Object.keys(watchlist).length === 0}
          fullWidth
          label="Watchlist"
          size="small"
          value={currentWatchlistName}
          onChange={(e) => setCurrentWatchlistName(e.target.value as string)}
        >
          {Object.keys(watchlist).map((watchlistName) => (
            <MenuItem dense key={watchlistName}
                      value={watchlistName}>{watchlistName} ({watchlist[watchlistName].length})</MenuItem>
          ))}
        </TextField>

        <ButtonGroup sx={{ marginInlineStart: theme.spacing(1) }}>
          <Tooltip title="Filter watchlist">
            <span>
            <Button
              disabled={!currentWatchlistName || watchlist[currentWatchlistName].length === 0}
              size="large"
              variant={showOnlyChecked ? 'contained' : 'outlined'}
              onClick={() => setShowOnlyChecked(!showOnlyChecked)}
            >
              <FilterListRounded />
            </Button>
              </span>
          </Tooltip>
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
        </ButtonGroup>

        <Dialog open={showAddWatchlist} onClose={() => setShowAddWatchlist(false)} fullWidth>
          <DialogTitle>Add watchlist</DialogTitle>
          <DialogContent dividers>
            <FormControl fullWidth>
              <TextField label="Watchlist name" size="small" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addWatchlist();
                }
              }} inputRef={addWatchlistName} />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddWatchlist(false)} autoFocus>
              Cancel
            </Button>
            <Button variant="contained" onClick={addWatchlist}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

      </Box>, [watchlist, currentWatchlistName, showOnlyChecked, showAddWatchlist]);
  }, [watchlist, currentWatchlistName, showOnlyChecked]);


  interface SearchProps {
    checkSymbolsLoader: boolean;
  }

  const Search = useCallback((props: SearchProps) => {
    return useMemo(() =>
      <Box display="flex" width="100%" justifyContent="center" alignItems="center">
        <TextField label="Search" fullWidth size="small" onChange={e => setSearchTerm(e.target.value)} />
        <ButtonGroup sx={{ marginInlineStart: theme.spacing(1) }}>
          <Tooltip title={`Check next ${ANALYZE_SYMBOLS_LIMIT} symbols`}>
            <Button onClick={checkSymbols} size="large">
              <QueryStatsRoundedIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Clear recommendations">
              <span>
                <Button size="large" onClick={clearSuggestions} disabled={props.checkSymbolsLoader}>
                  <ReplayRoundedIcon />
                </Button>
              </span>
          </Tooltip>

        </ButtonGroup>

      </Box>, [props.checkSymbolsLoader]);
  }, [suggestedSymbols]);


  // const rowSelectionModel = useMemo(() => currentWatchlistName ? suggestedSymbols.filter((symbol) => watchlist[currentWatchlistName].includes(symbol.symbol)).map((symbol) => symbol.id) : [], [watchlist, suggestedSymbols, currentWatchlistName]);

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

  useEffect(() => {
    const symbolIndex = suggestedSymbols.findIndex((symbol) => symbol.symbol === selectedSymbol);
    if (symbolIndex !== -1 && symbolData) {
      const newSuggestedSymbols = updatedSuggestedSymbols(suggestedSymbols, symbolData, symbolIndex);

      dataGridRef.current.updateRows([{ ...newSuggestedSymbols[symbolIndex] }]);
    }
  }, [symbolData]);

  return useMemo(() => <Box
    sx={{
      height: `calc(100dvh - 65px - ${isMobile ? '53px' : '0px'})`,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1),
    }}>
    {Boolean(informativeEvent) && <Alert severity="warning" variant="outlined" onClose={isMobile ? () => {
      setInformativeEvent('');
    } : undefined}>{informativeEvent}</Alert>}
    <Filter />
    <Search checkSymbolsLoader={checkSymbolsLoader} />
    <AnalyzedCount analyzedCount={analyzedCount} maxAnalyzedCount={maxAnalyzedCount} />
    <DataGrid sx={{
      '& .MuiDataGrid-row': { // Targeting the row class
        cursor: 'pointer', // Set the cursor to pointer
      },
      '& .MuiDataGrid-cell:focus': {
        outline: 'none',
      },
    }}
              apiRef={dataGridRef}
      // checkboxSelection={currentWatchlistName !== ''}
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
      // checkboxSelection
      // rowSelectionModel={rowSelectionModel}
      //         disableColumnFilter
              disableColumnSelector
              disableDensitySelector
      // onStateChange={(state) => {
      //   console.log(state);
      // }}
      // disableColumnMenu
              disableRowSelectionOnClick
              density="standard"
              onRowSelectionModelChange={handleCheckedSymbols}
              rows={filteredSymbols}
              columns={columns}
      //           slotProps={{
      //   toolbar: {
      //     showQuickFilter: true,
      //   },
      // }}
      // slots={{ toolbar: React.memo(CustomToolbar) }}
      //         sortModel={[
      //           {
      //             field: 'priorityScore',
      //             sort: 'desc',
      //           },
      //         ]}
              columnVisibilityModel={{
                watchlist: currentWatchlistName !== '',
                name: false,
              }}
              filterModel={{
                items: [
                  { field: 'averageVolume', operator: '>', value: 500000 },
                ],
              }}

              initialState={{
                pagination: { paginationModel: { pageSize: 100 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'priorityScore',
                      sort: 'desc',
                    },
                  ],
                },

                filter: {
                  filterModel: {
                    items: [],
                    quickFilterExcludeHiddenColumns: false,
                  },
                },
              }}
    />

  </Box>, [filteredSymbols, analyzedCount, informativeEvent]);

};

export default React.memo(SymbolsList);
