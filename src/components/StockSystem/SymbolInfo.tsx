import React, { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  getByType,
  getNextEarning,
  getPricesMode,
  getSelectedSignal,
  getSymbolData,
} from '../../atoms/symbol';
import axios from 'axios';

import { green, red, grey, deepOrange, deepPurple, pink } from '@mui/material/colors';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemText,
  // IconButton,
  // List,
  // ListItem,
  // ListItemIcon,
  // ListItemText,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { startCase } from 'lodash';
import ReactECharts from 'echarts-for-react';
import { DateTime } from 'luxon';

const API_HOST = import.meta.env.VITE_API_HOST;

// function InfoIcon() {
//   return null;
// }

const SymbolInfo = () => {
  const symbolData = useRecoilValue(getSymbolData);
  const selectedSignal = useRecoilValue(getSelectedSignal);
  const byType = useRecoilValue(getByType);
  const priceMode = useRecoilValue(getPricesMode);
  const nextEarning = useRecoilValue(getNextEarning);
  const [strategyName, setStrategyName] = useState<string>('');
  const [strategyModalOpen, setStrategyModalOpen] = useState<boolean>(false);
  const [strategyDescription, setStrategyDescription] = useState<string>('');
  const [indicatorInfoDialog, setIndicatorInfoDialog] =
    useState<boolean>(false);

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
    if (symbolData.recommendationsLinesModified) {
      const { minBuy, minSell } =
        symbolData.recommendationsLinesModified.bestPermutation;
      const currentRecommendation =
        symbolData.prices[symbolData.prices.length - 1].recommendation;

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

  const symbolBuy = symbolData?.prices[symbolData.prices.length - 1].reasons.buy.symbol;
  const indexBuy = symbolData?.prices[symbolData.prices.length - 1].reasons.buy.index;
  const sectorBuy = symbolData?.prices[symbolData.prices.length - 1].reasons.buy.sector;
  const symbolSell = symbolData?.prices[symbolData.prices.length - 1].reasons.sell.symbol;
  const indexSell = symbolData?.prices[symbolData.prices.length - 1].reasons.sell.index;
  const sectorSell = symbolData?.prices[symbolData.prices.length - 1].reasons.sell.sector;
  const sectionIcon: Record<number, string> = {
    0: 'Symbol',
    1: 'Index',
    2: 'Sector',
  };

  const sectionColor: Record<number, string> = {
    0: deepOrange[500],
    1: deepPurple[500],
    2: pink[500],
  };


  return useMemo(
    () => (
      <Box>
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
          <Card sx={{ height: '100%', overflowY: 'auto' }}>
            <CardContent>
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
                                symbolData.recommendationsLinesModified
                                  .bestPermutation.minSell,
                              ),
                              red[400],
                            ],
                            [
                              mapNumber(
                                symbolData.recommendationsLinesModified
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
                        length: 12,
                        lineStyle: {
                          color: 'auto',
                          width: 2,
                        },
                      },
                      splitLine: {
                        length: 20,
                        lineStyle: {
                          color: 'auto',
                          width: 5,
                        },
                      },
                      axisLabel: {
                        fontSize: 0,
                      },
                      title: {
                        offsetCenter: [0, '-10%'],
                        fontSize: 16,
                        color: getRecommendationColor(),
                      },
                      detail: {
                        fontSize: 30,
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
                          symbolData.prices[symbolData.prices.length - 1]
                            .recommendation.score,
                          name: getRecommendation(),
                        },
                      ],
                    },
                  ],
                }}
                notMerge={true}
                lazyUpdate={true}
                style={{ height: '200px' }}
              />
              <div
                className="symbolInfo-reasons"
                style={{ marginTop: '-80px' }}
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


                <Typography><b>Stop
                  Loss:</b> {symbolData?.atrBandsPercent.stopLoss[symbolData?.atrBandsPercent.stopLoss.length - 1].toFixed(2)}%</Typography>
                <br />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                  {Object.values(sectionIcon).map((section, index) => (
                    <>
                      <Avatar alt={sectionIcon[index]}
                              sx={{ width: 24, height: 24, bgcolor: sectionColor[index] }}>
                        {section[0].toUpperCase()}
                      </Avatar>
                      {sectionIcon[index]}
                    </>
                  ))}
                </Box>
                <br />


                {selectedSignal !== undefined && (
                  <>
                    {Boolean(
                      symbolData?.prices[symbolData.prices.length - 1]
                        .recommendation.buyThresholdsReasons.length,
                    ) && (
                      <>
                        <b>Minimum Thresholds:</b>{' '}
                        <List dense disablePadding>
                          {symbolData?.prices[
                          symbolData.prices.length - 1
                            ].recommendation.buyThresholdsReasons.map(
                            (reason: string) => (
                              <ListItem key={reason} dense disablePadding secondaryAction={
                                <IconButton onClick={() => showStrategyModal(reason)}>
                                  <InfoIcon />
                                </IconButton>
                              }>
                                <ListItemAvatar>
                                  <Avatar
                                    sx={{ width: 24, height: 24, bgcolor: sectionColor[0] }}>
                                    {sectionIcon[0][0].toUpperCase()}
                                  </Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                  primary={startCase(reason)}
                                ></ListItemText>
                              </ListItem>
                            ),
                          )}
                        </List>
                      </>
                    )}
                    <br />

                    <b>Reasons to buy:</b>{' '}
                    <List dense disablePadding>
                      {[symbolBuy, indexBuy, sectorBuy].map((section, index) => (
                        section && section.map(
                          (strategyName: string) => (
                            <ListItem key={strategyName} dense disablePadding secondaryAction={

                              <IconButton onClick={() =>
                                showStrategyModal(strategyName)
                              }>
                                <InfoIcon />
                              </IconButton>

                            }>
                              <ListItemAvatar>
                                <Avatar alt={sectionIcon[index]}
                                        sx={{ width: 24, height: 24, bgcolor: sectionColor[index] }}>
                                  {sectionIcon[index][0].toUpperCase()}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`${startCase(strategyName)}`}
                              ></ListItemText>
                            </ListItem>
                          ),
                        )))}
                    </List>
                    <br />
                    <b>Reasons to sell:</b>{' '}
                    <List dense disablePadding>
                      {[symbolSell, indexSell, sectorSell].map((section, index) => (
                        section && section.map(
                          (strategyName: string) => (
                            <ListItem key={strategyName} dense disablePadding secondaryAction={

                              <IconButton onClick={() =>
                                showStrategyModal(strategyName)
                              }>
                                <InfoIcon />
                              </IconButton>

                            }>
                              <ListItemAvatar>
                                <Avatar alt={sectionIcon[index]}
                                        sx={{ width: 24, height: 24, bgcolor: sectionColor[index] }}>
                                  {sectionIcon[index][0].toUpperCase()}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`${startCase(strategyName)}`}
                              ></ListItemText>
                            </ListItem>
                          ),
                        )))}
                    </List>

                    {/*{Boolean(*/}
                    {/*  symbolData?.prices[symbolData.prices.length - 1]*/}
                    {/*    .recommendation.sellReasons.length,*/}
                    {/*) && (*/}
                    {/*  <>*/}
                    {/*    <b>Reasons to sell:</b>{' '}*/}
                    {/*    <List dense disablePadding>*/}
                    {/*      {symbolData?.prices[*/}
                    {/*      symbolData.prices.length - 1*/}
                    {/*        ].recommendation.sellReasons.map(*/}
                    {/*        (strategyName: string) => (*/}
                    {/*          <ListItem key={strategyName} dense disablePadding>*/}
                    {/*            <ListItemIcon*/}
                    {/*              onClick={() =>*/}
                    {/*                showStrategyModal(strategyName)*/}
                    {/*              }*/}
                    {/*            >*/}
                    {/*              <IconButton>*/}
                    {/*                <InfoIcon />*/}
                    {/*              </IconButton>*/}
                    {/*            </ListItemIcon>*/}
                    {/*            <ListItemText*/}
                    {/*              primary={startCase(strategyName)}*/}
                    {/*            ></ListItemText>*/}
                    {/*          </ListItem>*/}
                    {/*        ),*/}
                    {/*      )}*/}
                    {/*    </List>*/}
                    {/*  </>*/}
                    {/*)}*/}
                  </>
                )}
              </div>
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
