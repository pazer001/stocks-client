import React, { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  getByType,
  getNextEarning,
  getPricesMode,
  getSelectedSignal,
  getSymbolData, TDataSourceType,
} from '../../atoms/symbol';
import axios from 'axios';

import { green, red, grey, deepOrange, deepPurple, pink, blue, cyan, lime } from '@mui/material/colors';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemText,
  Paper,
  // IconButton,
  // List,
  // ListItem,
  // ListItemIcon,
  // ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { startCase } from 'lodash';
import ReactECharts from 'echarts-for-react';
import { DateTime } from 'luxon';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PieChartIcon from '@mui/icons-material/PieChart';

const API_HOST = import.meta.env.VITE_API_HOST;

// function InfoIcon() {
//   return null;
// }

const etfIcons: Record<'sector' | 'index', React.ReactElement> = {
  sector: <PieChartIcon />,
  index: <MonetizationOnIcon />,
};

const SymbolInfo = () => {
  const theme = useTheme();
  const symbolData = useRecoilValue(getSymbolData);
  const selectedSignal = useRecoilValue(getSelectedSignal);
  const byType = useRecoilValue(getByType);
  const priceMode = useRecoilValue(getPricesMode);
  const nextEarning = useRecoilValue(getNextEarning);
  const [strategyName, setStrategyName] = useState<string>('');
  const [strategyModalOpen, setStrategyModalOpen] = useState<boolean>(false);
  const [strategyDescription, setStrategyDescription] = useState<string>('');
  const [indicatorInfoDialog, setIndicatorInfoDialog] = useState<boolean>(false);
  const reasonsInfoContainerRef = React.useRef<HTMLDivElement>(null);

  console.log('symbolData', symbolData);

  useEffect(() => {
    const getStrategyDescription = async () => {
      if (strategyName) {
        try {
          const strategyDescriptionResult = await axios.get(
            `${API_HOST}/strategies/strategyDescription/${strategyName}`,
          );
          const strategyDescription =
            strategyDescriptionResult.data.description;
          setStrategyDescription(strategyDescription);
        } catch (e) {
          console.error(e);
        }
      }
    };

    getStrategyDescription();
  }, [strategyName]);

  const showStrategyModal = (strategyName: string) => {
    setStrategyName(() => strategyName);
    setStrategyModalOpen(() => true);
  };
  const getRecommendation = () => {
    if (!symbolData) return null;
    if (symbolData.recommendationsLines) {
      const { minBuy, minSell } =
        symbolData.recommendationsLines.bestPermutation;
      const currentRecommendation =
        symbolData.recommendations[symbolData.recommendations.length - 1].recommendation;

      if (currentRecommendation.score >= minBuy) {
        return 'Buy';
      } else if (
        currentRecommendation.score > minSell &&
        currentRecommendation.score < minBuy
      ) {
        return 'Hold';
      } else if (currentRecommendation.score <= minSell) {
        return 'Sell';
      } else {
        return `No decision`;
      }
    } else {
      return `Not enough data`;
    }
  };

  const getRecommendationColor = () => {
    const recommendation = getRecommendation();
    switch (recommendation) {
      case 'Buy':
        return green[400];
      case 'Sell':
        return red[400];
      default:
        return 'inherit';
    }
  };

  const mapNumber = (value: number) => {
    const min = -100;
    const max = 100;
    return (value - min) / (max - min);
  };

  const sectionIcon: Record<TDataSourceType, string> = {
    symbol: 'Symbol',
    sector: 'Sector',
    index: 'Index',
  };

  const sectionColor: Record<TDataSourceType, string> = {
    symbol: deepOrange[500],
    sector: pink[500],
    index: deepPurple[500],
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // const reasonToBuy = Object.keys(symbolData?.recommendations[selectedSignal].reasons.buy) as TDataSourceType[];
  // const hasMinimumThresholds = Boolean(Object.keys(symbolData?.recommendations[selectedSignal].recommendation.buyThresholdsReasons as Record<TDataSourceType, string[]>).length);
  // const hasReasonToBuy = Object.values(symbolData?.recommendations[selectedSignal].reasons.buy as Record<TDataSourceType, string[]>).some((reasons) => reasons.length > 0);
  // const hasReasonToSell = Object.values(symbolData?.recommendations[selectedSignal].reasons.sell as Record<TDataSourceType, string[]>).some((reasons) => reasons.length > 0);

  return useMemo(
    () => (
      <Box sx={{ height: isMobile ? 'calc(100dvh - 117px)' : '100%' }}>
        {symbolData && strategyModalOpen && strategyName && (
          <Dialog open={strategyModalOpen} onClose={() => setStrategyName('')}>
            <DialogTitle>{startCase(strategyName)}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <b>Best Permutation:</b> [
                {Object.keys(
                  symbolData.analyzedResult.results[priceMode][byType][
                    strategyName
                    ].bestPermutation,
                )
                  .map(
                    (param) =>
                      `${startCase(param)}: ${
                        symbolData.analyzedResult.results[priceMode][byType][
                          strategyName
                          ].bestPermutation[param]
                      }`,
                  )
                  .join(', ')}
                ]
              </DialogContentText>
              <DialogContentText>
                <b>Scanned Permutations: </b>
                {new Intl.NumberFormat().format(
                  symbolData.analyzedResult.results[priceMode][byType][
                    strategyName
                    ].scannedPermutations,
                )}
              </DialogContentText>
              <DialogContentText>
                <b>Win Rate: </b>
                {symbolData.analyzedResult.results[priceMode][byType][
                  strategyName
                  ].winRate.toFixed(2)}
                %
              </DialogContentText>
              {strategyDescription && (
                <DialogContentText>
                  <b>Description: </b>{' '}
                  <span
                    dangerouslySetInnerHTML={{ __html: strategyDescription }}
                  />
                </DialogContentText>
              )}
            </DialogContent>
          </Dialog>
        )}

        <IndicatorInfoDialog
          open={indicatorInfoDialog}
          onClose={() => setIndicatorInfoDialog(false)}
        />

        {symbolData && (
          <Card sx={{ height: '100%',  overscrollBehaviorY: 'none' }}>
            <CardContent sx={{height: 'inherit', position: 'relative'}}>
              <Box position='absolute' zIndex={1} top={'2px'} left={theme.spacing(1)}>
                <Box display={"flex"} justifyContent={"flex-start"} alignItems={"center"} gap={theme.spacing(1)}>
                  <Typography variant="caption">{symbolData.name}</Typography>
                </Box>
              </Box>
              
              <ReactECharts
                option={{
                  series: [
                    {
                      type: 'gauge',
                      startAngle: 180,
                      endAngle: 0,
                      center: ['50%', '50%'],
                      radius: '90%',
                      min: -100,
                      max: 100,
                      splitNumber: 8,
                      axisLine: {
                        lineStyle: {
                          width: 6,
                          color: [
                            [
                              mapNumber(
                                symbolData.recommendationsLines
                                  .bestPermutation.minSell,
                              ),
                              red[400],
                            ],
                            [
                              mapNumber(
                                symbolData.recommendationsLines
                                  .bestPermutation.minBuy,
                              ),
                              grey[400],
                            ],
                            [1, green[400]],
                          ],
                        },
                      },
                      pointer: {
                        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                        length: '12%',
                        width: 20,
                        offsetCenter: [0, '-50%'],
                        itemStyle: {
                          color: getRecommendationColor(),
                        },
                      },
                      axisTick: {
                        length: isMobile ? 8 : 12,
                        lineStyle: {
                          color: 'auto',
                          width: isMobile ? 1 : 2,
                        },
                      },
                      splitLine: {
                        length: isMobile ? 15: 20,
                        lineStyle: {
                          color: 'auto',
                          width: isMobile ? 0.5 : 5,
                        },
                      },
                      axisLabel: {
                        show: false
                      },
                      title: {
                        offsetCenter: [0, '-10%'],
                        fontSize: 16,
                        color: getRecommendationColor(),
                      },
                      detail: {
                        fontSize: isMobile ? 16 : 30,
                        offsetCenter: [0, '-35%'],
                        valueAnimation: true,
                        formatter: function(value: number) {
                          return Math.round(value);
                        },
                        color: getRecommendationColor(),
                      },
                      data: [
                        {
                          value:
                          symbolData.recommendations[selectedSignal]
                            .recommendation.score,
                          name: getRecommendation(),
                        },
                      ],
                    },
                  ],
                }}
                notMerge={true}
                lazyUpdate={true}
                style={{ height: isMobile ? '150px' : '200px' }}
              />
              <Box
                className="symbolInfo-reasons"
                sx={{ marginTop: isMobile ? '-57px' : '-80px' }}
              >
                {nextEarning && (
                  <Typography>
                    <b>Next earnings report: </b>
                    {DateTime.fromSeconds(nextEarning).toISODate()} (
                    {DateTime.fromSeconds(nextEarning)
                      .diff(DateTime.now(), 'days')
                      .toObject()
                      .days?.toFixed(0)}{' '}
                    Days)
                  </Typography>
                )}

                <Typography marginBottom={theme.spacing(1)}><b>Stop
                  Loss:</b> {symbolData?.stopLoss[0].toFixed(1)}%</Typography>
                <Box sx={{ display: 'flex', marginBottom: theme.spacing(2), gap: 1 }}>
                  {(Object.keys(sectionIcon) as TDataSourceType[]).map((key) => {
                    if (!symbolData.info[key].symbol) return null;
                    return (
                    <Box width='32%'>
                      <Paper variant="outlined" sx={{marginBottom: theme.spacing(1), bgcolor: pink[900]}}><Typography variant='body2' borderRadius={'2px'} paddingInline={theme.spacing(1)}>{startCase(key)}</Typography></Paper>
                      <Paper variant="outlined" key={key} sx={{display: 'flex', flexDirection: 'column', gap: 1,  padding: theme.spacing(1)}}>
                        <Box display={'flex'} gap={1} width={'80%'}>
                          <Avatar alt={sectionIcon[key]} sx={{ width: 24, height: 24, bgcolor: sectionColor[key] }} src={key === 'symbol' ? symbolData.info[key].logo : undefined} >
                            {/* <Typography color="white">{sectionIcon[key][0].toUpperCase()}</Typography> */}
                            {key !== 'symbol' && etfIcons[key]}
                          </Avatar>
                          {symbolData.info[key].symbol}
                        </Box>
                        <Typography noWrap variant="caption">{ 
                          key === 'symbol' 
                            ? symbolData.info[key].name
                            : symbolData.info[key].etfTheme
                        }</Typography>
                      </Paper>
                    </Box>
                  )})}
                </Box>
                <Paper 
                  ref={reasonsInfoContainerRef} 
                  variant="outlined" 
                  sx={{
                    height: `calc(100dvh - ${isMobile ? '382': '358'}px - ${nextEarning ? '24': '0'}px)`, 
                    overflowY: 'auto', 
                    padding: theme.spacing(1), 
                    bgcolor: grey[900]
                  }}
                >
                  {selectedSignal !== undefined && (
                    <>
                      {Boolean(Object.keys(symbolData?.recommendations[selectedSignal].recommendation.buyThresholdsReasons as Record<TDataSourceType, string[]>).length) && (
                        <Box display={'flex'} flexDirection={'column'} gap={1}>
                          <b>Minimum Thresholds:</b>{' '}
                          <List dense disablePadding>
                            {(Object.keys(symbolData?.recommendations[selectedSignal].recommendation.buyThresholdsReasons) as TDataSourceType[]).map(
                              (dataSource: TDataSourceType, index) => (
                                symbolData?.recommendations[selectedSignal].recommendation.buyThresholdsReasons[dataSource]?.map(
                                  (reason, reasonIndex) => (
                                    <ListItem key={reasonIndex} dense disablePadding >
                                      <ListItemAvatar>
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: sectionColor[dataSource] }} src={dataSource === 'symbol' ? symbolData.info[dataSource].logo : undefined}>
                                          {/* <Typography color="white">{sectionIcon[dataSource][0].toUpperCase()}</Typography> */}
                                          {dataSource !== 'symbol' && etfIcons[dataSource]}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText primary={<Typography variant='body2' noWrap>{startCase(reason)}</Typography>} />
                                    </ListItem>
                                  )
                                ) || null  // Add this to handle null or undefined
                              )
                            )}
                          </List>

                          <br />
                        </Box>
                      )}
                    
                      
                      {Object.values(symbolData?.recommendations[selectedSignal].reasons.buy as Record<TDataSourceType, string[]>)?.some((reasons) => reasons.length > 0) && 
                        (<Box display={'flex'} flexDirection={'column'} gap={1}>
                        <b>Reasons to buy:</b>{' '}
                        <List dense disablePadding>
                          {(Object.keys(symbolData?.recommendations[selectedSignal].reasons.buy) as TDataSourceType[]).map(
                            (dataSource: TDataSourceType, index) => (
                              (symbolData?.recommendations[selectedSignal].reasons.buy[dataSource] || []).map(
                                (reason, reasonIndex) => (
                                  <ListItem key={reasonIndex} dense disablePadding >
                                    <ListItemAvatar>
                                      <Avatar sx={{ width: 24, height: 24, bgcolor: sectionColor[dataSource] }} src={dataSource === 'symbol' ? symbolData.info[dataSource].logo : undefined}>
                                        {/* <Typography color="white">{sectionIcon[dataSource][0].toUpperCase()}</Typography> */}
                                        {dataSource !== 'symbol' && etfIcons[dataSource]}
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={<Typography variant='body2' noWrap>{startCase(reason)}</Typography>} />
                                  </ListItem>
                                ),
                              )
                            ),
                          )}
                        </List>
                        <br />
                        </Box>)
                      }
                      
                      {Object.values(symbolData?.recommendations[selectedSignal].reasons.sell as Record<TDataSourceType, string[]>).some((reasons) => reasons.length > 0) &&
                        <Box display={'flex'} flexDirection={'column'} gap={1}>
                          <b>Reasons to sell:</b>{' '}
                          <List dense disablePadding>
                            {/* {(Object.keys(symbolData?.recommendations[selectedSignal].reasons.sell) as TDataSourceType[]).map((dataSource: TDataSourceType, index) => {
                              return (
                                <ListItem key={index} dense disablePadding >
                                  <ListItemAvatar>
                                    <Avatar sx={{ width: 24, height: 24, bgcolor: sectionColor[dataSource] }} src={dataSource === 'symbol' ? symbolData.logo : undefined}>
                                    <Typography color="white">{sectionIcon[dataSource][0].toUpperCase()}</Typography>
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText key={index} primary={startCase(dataSource)} secondary={(
                                    <Box display={'flex'} flexDirection={'column'} gap={1}>
                                      {
                                        (symbolData?.recommendations[selectedSignal].reasons.sell[dataSource] || []).map(
                                          (reason, reasonIndex) => (
                                            <Typography key={reasonIndex}>{startCase(reason)}</Typography>
                                          ),
                                        )
                                      }
                                    </Box>
                                  )} />
                                </ListItem>
                              ); 
                            })} */}
                            
                            {(Object.keys(symbolData?.recommendations[selectedSignal].reasons.sell) as TDataSourceType[]).map(
                              (dataSource: TDataSourceType, index) => (
                                (symbolData?.recommendations[selectedSignal].reasons.sell[dataSource] || []).map(
                                  (reason, reasonIndex) => (
                                    <ListItem key={reasonIndex} dense disablePadding >
                                      <ListItemAvatar>
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: sectionColor[dataSource] }} src={dataSource === 'symbol' ? symbolData.info[dataSource].logo : undefined}>
                                          {/* <Typography color="white">{sectionIcon[dataSource][0].toUpperCase()}</Typography> */}
                                          {dataSource !== 'symbol' && etfIcons[dataSource]}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText primary={<Typography variant='body2' noWrap>{startCase(reason)}</Typography>} />
                                    </ListItem>
                                  ),
                                )
                              ),
                            )} 
                            
                          </List>
                        </Box> 
                      }
                    </>
                  )}
                </Paper>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    ),
    [
      symbolData,
      strategyModalOpen,
      strategyName,
      selectedSignal,
      byType,
      strategyName,
      indicatorInfoDialog,
      strategyDescription,
    ],
  );
};

interface IIndicatorInfoDialogProps {
  open: boolean;
  onClose: () => void;
}

const IndicatorInfoDialog = (props: IIndicatorInfoDialogProps) => {
  const { open, onClose } = props;
  return useMemo(
    () => (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Indicator Info</DialogTitle>
        <DialogContent>
          After collecting data from various strategies, an accumulation
          indicator is generated that summarizes the results of the strategies.{' '}
          <br />
          A logical approach is to initiate a long trade when the indicator
          value is greater than 0 and to sell when it is less than 0. <br />
          However, we conduct additional backtesting on the accumulation
          indicator to determine the optimal threshold for buying/selling.{' '}
          <br /> <br />
          The outcome is represented by two lines - green and red - along with
          corresponding Win Rate/Profit values. <br />
          These metrics are derived from a subset of trades where the buy signal
          was above the green line and the sell signal was below the red line.
        </DialogContent>
      </Dialog>
    ),
    [open, onClose],
  );
};

export default SymbolInfo;
