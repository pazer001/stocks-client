import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getInterval, symbolAtom, useSymbol } from '../../atoms/symbol';
import { useRecoilState, useRecoilValue } from 'recoil';
// import { Button } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { DateTime } from 'luxon';
import {
  blue,
  green,
  red,
  // deepOrange,
  // lightBlue,
  // lime,
  grey,
} from '@mui/material/colors';

const Chart = () => {
  // const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const [symbolState] = useRecoilState(symbolAtom);
  const { setSelectSignal } = useSymbol();
  // const byType = useRecoilValue(getByType);
  const interval = useRecoilValue(getInterval);
  // const pricesMode = useRecoilValue(getPricesMode);
  // const { mainLoaderShow, setAlert } = useViewActions();

  const [stockChartOptions, setStockChartOptions] = useState({});

  const setChart = () => {
    if (symbolState.symbolData) {
      setStockChartOptions(() => ({
        legend: {
          show: true,
          top: 20,
          textStyle: {
            color: grey.A100,
          },
          // left: 250,
          // orient: "vertical",
        },
        title: {
          text: symbolState.selectedSymbol,
          textAlign: 'center',
          left: '50%',
          textStyle: {
            color: grey.A100,
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            link: { xAxisIndex: 'all' },
          },
        },
        axisPointer: {
          link: { xAxisIndex: 'all' },
        },
        grid: [
          {
            left: '10%',
            right: '8%',
            height: '50%',
          },
          {
            left: '10%',
            right: '8%',
            top: '60%',
            height: '10%',
          },
          {
            left: '10%',
            right: '8%',
            top: '72%',
            height: '25%',
          },
        ],
        xAxis: [
          {
            type: 'category',
            data: symbolState.symbolData?.recommendations.map((price) =>
              interval === '1d'
                ? DateTime.fromMillis(price.point.timestamp).toISODate()
                : DateTime.fromMillis(price.point.timestamp).toISOTime(),
            ),
            boundaryGap: false,


            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              z: 100,
            },
          },
          {
            type: 'category',
            gridIndex: 1,
            name: 'Volume',
            nameLocation: 'start',
            data: symbolState.symbolData?.recommendations.map(
              (data) => data.point.volume,
            ),
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax',
          },
          {
            type: 'category',
            gridIndex: 2,
            name: 'Score',
            nameLocation: 'start',
            data: symbolState.symbolData?.recommendations.map(
              (data) => data.recommendation.score,
            ),
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax',
          },
        ],
        yAxis: [
          {
            scale: true,
            splitLine: { // This is for the grid lines that are horizontal
              show: true,
              lineStyle: {
                color: grey[800], // Change 'red' to your desired color
              },
            },
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { // This is for the grid lines that are horizontal
              show: true,
              lineStyle: {
                color: grey[800], // Change 'red' to your desired color
              },
            },
          },
          {
            scale: true,
            gridIndex: 2,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
          },
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1, 2],
            start: 0,
            end: 100,
          },
        ],

        series: [
          {
            name: symbolState.selectedSymbol,
            type: 'candlestick',
            itemStyle: {
              color: green[400],
              color0: red[400],
              borderColor: green[400],
              borderColor0: red[400],
            },
            data: symbolState.symbolData?.recommendations.map((data) => [
              Number(data.point.open.toFixed(3)),
              Number(data.point.close.toFixed(3)),
              Number(data.point.low.toFixed(3)),
              Number(data.point.high.toFixed(3)),
            ]),
          },

          // symbolState.symbolData?.buyThresholdData.closeAboveSMA100
          //   ? {
          //     name: 'SMA 100',
          //     type: 'line',
          //     data: symbolState.symbolData?.buyThresholdData.closeAboveSMA100,
          //     smooth: true,
          //     lineStyle: {
          //       color: deepOrange.A200,
          //       opacity: 0.5,
          //     },
          //   }
          //   : undefined,
          // symbolState.symbolData?.buyThresholdData.closeAboveSMA150
          //   ? {
          //     name: 'SMA000 150',
          //     type: 'line',
          //     data: symbolState.symbolData?.buyThresholdData.closeAboveSMA150,
          //     smooth: true,
          //     lineStyle: {
          //       color: deepOrange.A400,
          //       opacity: 0.5,
          //     },
          //   }
          //   : undefined,
          // symbolState.symbolData?.buyThresholdData.closeAboveSMA200
          //   ? {
          //     name: 'SMA 200',
          //     type: 'line',
          //     data: symbolState.symbolData?.buyThresholdData.closeAboveSMA200,
          //     smooth: true,
          //     lineStyle: {
          //       color: deepOrange.A700,
          //       opacity: 0.5,
          //     },
          //   }
          //   : undefined,
          // symbolState.symbolData?.buyThresholdData.closeAboveEMA100
          //   ? {
          //     name: 'EMA 100',
          //     type: 'line',
          //     data: symbolState.symbolData?.buyThresholdData.closeAboveEMA100,
          //     smooth: true,
          //     lineStyle: {
          //       color: lightBlue.A200,
          //       opacity: 0.5,
          //     },
          //   }
          //   : undefined,
          // symbolState.symbolData?.buyThresholdData.closeAboveEMA150
          //   ? {
          //     name: 'EMA 150',
          //     type: 'line',
          //     data: symbolState.symbolData?.buyThresholdData.closeAboveEMA150,
          //     smooth: true,
          //     lineStyle: {
          //       color: lightBlue.A400,
          //       opacity: 0.5,
          //     },
          //   }
          //   : undefined,
          // symbolState.symbolData?.buyThresholdData.closeAboveEMA200
          //   ? {
          //     name: 'EMA 200',
          //     type: 'line',
          //     data: symbolState.symbolData?.buyThresholdData.closeAboveEMA200,
          //     smooth: true,
          //     lineStyle: {
          //       color: lightBlue.A700,
          //       opacity: 0.5,
          //     },
          //   }
          //   : undefined,
          // symbolState.symbolData?.buyThresholdData.closeAboveDEMA100
          //   ? {
          //     name: 'DEMA 100',
          //     type: 'line',
          //     data: symbolState.symbolData?.buyThresholdData
          //       .closeAboveDEMA100,
          //     smooth: true,
          //     lineStyle: {
          //       color: lime.A200,
          //       opacity: 0.5,
          //     },
          //   }
          //   : undefined,
          // symbolState.symbolData?.buyThresholdData.closeAboveDEMA150
          //   ? {
          //     name: 'DEMA 150',
          //     type: 'line',
          //     data: symbolState.symbolData?.buyThresholdData
          //       .closeAboveDEMA150,
          //     smooth: true,
          //     lineStyle: {
          //       color: lime.A400,
          //       opacity: 0.5,
          //     },
          //   }
          //   : undefined,
          // symbolState.symbolData?.buyThresholdData.closeAboveDEMA200
          //   ? {
          //     name: 'DEMA 200',
          //     type: 'line',
          //     data: symbolState.symbolData?.buyThresholdData
          //       .closeAboveDEMA200,
          //     smooth: true,
          //     lineStyle: {
          //       color: lime.A700,
          //       opacity: 0.5,
          //     },
          //   }
          //   : undefined,
          // symbolState.symbolData?.buyThresholdData.supertrend40
          //   ? {
          //       name: "Supertrend (40)",
          //       type: "line",
          //       data: symbolState.symbolData?.buyThresholdData.supertrend40,
          //       smooth: true,
          //       lineStyle: {
          //         opacity: 0,
          //       },
          //       itemStyle: {
          //         borderType: [5, 10],
          //         color: function (params: {
          //           dataIndex: number;
          //           data: number;
          //         }) {
          //           const index = params.dataIndex;
          //           return params.data >
          //             symbolState.symbolData?.prices[index].point.close
          //             ? "red"
          //             : "green";
          //         },
          //
          //         opacity: 0.5,
          //       },
          //     }
          //   : undefined,
          {
            name: 'Volume',
            type: 'bar',
            colorBy: 'series',
            seriesLayoutBy: 'row',
            xAxisIndex: 1,
            yAxisIndex: 1,

            data: symbolState.symbolData?.recommendations.map((data, index) => ({
              value: data.point.volume,
              itemStyle: {
                color:
                  symbolState.symbolData?.recommendations[index - 1] &&
                  data.point.volume >
                  symbolState.symbolData?.recommendations[index - 1].point.volume
                    ? green[400]
                    : red[400],
              },
            })),
          },
          {
            name: 'Score',
            type: 'line',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: symbolState.symbolData?.recommendations.map(
              (data) => data.recommendation.score,
            ),
            lineStyle: {
              color: blue[400],
            },

            markLine: {
              symbol: 'circle',
              data: [
                {
                  lineStyle: {
                    color: green[400],
                  },
                  yAxis:
                    symbolState.symbolData?.recommendationsLines.bestPermutation.minBuy.toFixed(
                      0,
                    ),
                },
                {
                  lineStyle: {
                    color: red[400],
                  },
                  yAxis:
                    symbolState.symbolData?.recommendationsLines.bestPermutation.minSell.toFixed(
                      0,
                    ),
                },
              ],
            },
          },
        ],
      }));
    }

    return symbolState.symbolData;
  };


  useEffect(() => {
    setChart();
  }, [symbolState.symbolData]);


  const mouseover = useCallback((e: { dataIndex: number }) => {
    setSelectSignal(e.dataIndex);
  }, []);  // ensure all dependencies are correctly listed

  const onEvents = useMemo(() => ({
    'mouseover': mouseover,
  }), []); // dependencies array is empty, indicating this callback does not depend on any props or state

  return useMemo(
    () => {
      return (
        <>
          <ReactECharts
            onEvents={onEvents}
            option={stockChartOptions}
            notMerge={true}
            lazyUpdate={true}
            style={{ height: '100%' }}
          />
        </>
      );
    },
    [stockChartOptions],  // include mouseover in the dependency array
  );
};

export default React.memo(Chart);
