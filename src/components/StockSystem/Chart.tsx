import React, { useEffect, useMemo, useState } from "react";
import { getInterval, symbolAtom } from "../../atoms/symbol";
import { useRecoilState, useRecoilValue } from "recoil";
import { Button } from "@mui/material";
import styled from "@emotion/styled";
import ReactECharts from "echarts-for-react";
import { DateTime } from "luxon";
import {
  blue,
  green,
  red,
  deepOrange,
  lightBlue,
  lime,
} from "@mui/material/colors";

const ChartContainer = styled.div`
  height: 100%;
`;

const Chart = () => {
  // const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const [symbolState] = useRecoilState(symbolAtom);
  // const byType = useRecoilValue(getByType);
  const interval = useRecoilValue(getInterval);
  // const pricesMode = useRecoilValue(getPricesMode);
  // const { mainLoaderShow, setAlert } = useViewActions();

  const [stockChartOptions, setStockChartOptions] = useState({});

  const setChart = () => {
    if (symbolState.symbolData) {
      setStockChartOptions(() => ({
        title: {
          text: symbolState.selectedSymbol,
          textAlign: "center",
          left: "50%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            link: { xAxisIndex: "all" },
          },
        },
        axisPointer: {
          link: { xAxisIndex: "all" },
        },
        grid: [
          {
            left: "10%",
            right: "8%",
            height: "50%",
          },
          {
            left: "10%",
            right: "8%",
            top: "60%",
            height: "10%",
          },
          {
            left: "10%",
            right: "8%",
            top: "72%",
            height: "25%",
          },
        ],
        xAxis: [
          {
            type: "category",
            data: symbolState.symbolData?.prices.map((price) =>
              interval === "1d"
                ? DateTime.fromMillis(price.point.timestamp).toISODate()
                : DateTime.fromMillis(price.point.timestamp).toISOTime(),
            ),
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: "dataMin",
            max: "dataMax",
            axisPointer: {
              z: 100,
            },
          },
          {
            type: "category",
            gridIndex: 1,
            name: "Volume",
            nameLocation: "start",
            data: symbolState.symbolData?.prices.map(
              (data) => data.point.volume,
            ),
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: "dataMin",
            max: "dataMax",
          },
          {
            type: "category",
            gridIndex: 2,
            name: "Score",
            nameLocation: "start",
            data: symbolState.symbolData?.prices.map(
              (data) => data.recommendation.score,
            ),
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: "dataMin",
            max: "dataMax",
          },
        ],
        yAxis: [
          {
            scale: true,
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
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
            type: "inside",
            xAxisIndex: [0, 1, 2],
            start: 0,
            end: 100,
          },
        ],

        series: [
          {
            name: symbolState.selectedSymbol,
            type: "candlestick",
            itemStyle: {
              color: green[400],
              color0: red[400],
              borderColor: green[400],
              borderColor0: red[400],
            },
            data: symbolState.symbolData?.prices.map((data) => [
              Number(data.point.open.toFixed(3)),
              Number(data.point.close.toFixed(3)),
              Number(data.point.low.toFixed(3)),
              Number(data.point.high.toFixed(3)),
            ]),
          },
          symbolState.symbolData?.buyThresholdData.closeAboveSMA100
            ? {
                name: "Simple Moving Average (100)",
                type: "line",
                data: symbolState.symbolData?.buyThresholdData.closeAboveSMA100,
                smooth: true,
                lineStyle: {
                  color: deepOrange.A200,
                  opacity: 0.5,
                },
              }
            : undefined,
          symbolState.symbolData?.buyThresholdData.closeAboveSMA150
            ? {
                name: "Simple Moving Average (150)",
                type: "line",
                data: symbolState.symbolData?.buyThresholdData.closeAboveSMA150,
                smooth: true,
                lineStyle: {
                  color: deepOrange.A400,
                  opacity: 0.5,
                },
              }
            : undefined,
          symbolState.symbolData?.buyThresholdData.closeAboveSMA200
            ? {
                name: "Simple Moving Average (200)",
                type: "line",
                data: symbolState.symbolData?.buyThresholdData.closeAboveSMA200,
                smooth: true,
                lineStyle: {
                  color: deepOrange.A700,
                  opacity: 0.5,
                },
              }
            : undefined,
          symbolState.symbolData?.buyThresholdData.closeAboveEMA100
            ? {
                name: "Exponential Moving Average (100)",
                type: "line",
                data: symbolState.symbolData?.buyThresholdData.closeAboveEMA100,
                smooth: true,
                lineStyle: {
                  color: lightBlue.A200,
                  opacity: 0.5,
                },
              }
            : undefined,
          symbolState.symbolData?.buyThresholdData.closeAboveEMA150
            ? {
                name: "Exponential Moving Average (150)",
                type: "line",
                data: symbolState.symbolData?.buyThresholdData.closeAboveEMA150,
                smooth: true,
                lineStyle: {
                  color: lightBlue.A400,
                  opacity: 0.5,
                },
              }
            : undefined,
          symbolState.symbolData?.buyThresholdData.closeAboveEMA200
            ? {
                name: "Exponential Moving Average (200)",
                type: "line",
                data: symbolState.symbolData?.buyThresholdData.closeAboveEMA200,
                smooth: true,
                lineStyle: {
                  color: lightBlue.A700,
                  opacity: 0.5,
                },
              }
            : undefined,
          symbolState.symbolData?.buyThresholdData.closeAboveDEMA100
            ? {
                name: "Double Exponential Moving Average (100)",
                type: "line",
                data: symbolState.symbolData?.buyThresholdData
                  .closeAboveDEMA100,
                smooth: true,
                lineStyle: {
                  color: lime.A200,
                  opacity: 0.5,
                },
              }
            : undefined,
          symbolState.symbolData?.buyThresholdData.closeAboveDEMA150
            ? {
                name: "Double Exponential Moving Average (150)",
                type: "line",
                data: symbolState.symbolData?.buyThresholdData
                  .closeAboveDEMA150,
                smooth: true,
                lineStyle: {
                  color: lime.A400,
                  opacity: 0.5,
                },
              }
            : undefined,
          symbolState.symbolData?.buyThresholdData.closeAboveDEMA200
            ? {
                name: "Double Exponential Moving Average (200)",
                type: "line",
                data: symbolState.symbolData?.buyThresholdData
                  .closeAboveDEMA200,
                smooth: true,
                lineStyle: {
                  color: lime.A700,
                  opacity: 0.5,
                },
              }
            : undefined,
          // symbolState.symbolData?.buyThresholdData.supertrend40
          //   ? {
          //     name: "Supertrend (40)",
          //     type: "line",
          //     data: symbolState.symbolData?.buyThresholdData
          //       .supertrend40,
          //     smooth: true,
          //     lineStyle: {
          //       color: lime.A700,
          //       opacity: 0.5,
          //     },
          //   }
          //   : undefined,
          {
            name: "Volume",
            type: "bar",
            colorBy: "series",
            seriesLayoutBy: "row",
            xAxisIndex: 1,
            yAxisIndex: 1,

            data: symbolState.symbolData?.prices.map((data, index) => ({
              value: data.point.volume,
              itemStyle: {
                color:
                  symbolState.symbolData?.prices[index - 1] &&
                  data.point.volume >
                    symbolState.symbolData?.prices[index - 1].point.volume
                    ? green[400]
                    : red[400],
              },
            })),
          },
          {
            name: "Score",
            type: "line",
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: symbolState.symbolData?.prices.map(
              (data) => data.recommendation.score,
            ),
            lineStyle: {
              color: blue[400],
            },

            markLine: {
              symbol: "circle",
              data: [
                {
                  lineStyle: {
                    color: green[400],
                  },
                  yAxis:
                    symbolState.symbolData?.recommendationsLinesModified.bestPermutation.minBuy.toFixed(
                      0,
                    ),
                },
                // {
                //   label: {
                //     show: false
                //   },
                //   lineStyle : {
                //     color: 'white'
                //   },
                //   yAxis: 0,
                // },

                {
                  lineStyle: {
                    color: red[400],
                  },
                  yAxis:
                    symbolState.symbolData?.recommendationsLinesModified.bestPermutation.minSell.toFixed(
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

  return useMemo(
    () => (
      <ChartContainer>
        <Button onClick={() => setChart()}>Refresh</Button>
        <ReactECharts
          option={stockChartOptions}
          notMerge={true}
          lazyUpdate={true}
          style={{ height: "90vh", left: "-5vw", top: 0, width: "85vw" }}
        />
      </ChartContainer>
    ),
    [stockChartOptions],
  );
};

export default React.memo(Chart);
