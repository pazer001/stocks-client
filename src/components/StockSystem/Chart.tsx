import React, { useEffect, useMemo, useRef, useState } from "react";
import HighchartsReact from "highcharts-react-official";
import HighchartsStock from "highcharts/highstock";
import {
  getByType,
  getInterval,
  getPricesMode,
  getSelectedSymbol,
  symbolAtom,
  SymbolData,
} from "../../atoms/symbol";
import { useRecoilState, useRecoilValue } from "recoil";
import AnnotationsModule from "highcharts/modules/annotations";
import HighContrastDark from "highcharts/themes/high-contrast-dark";
import axios, { AxiosResponse } from "axios";
import { useViewActions } from "../../atoms/view";
import HSIndicators from "highcharts/indicators/indicators.js";
import { Button } from "@mui/material";
import styled from "@emotion/styled";
import ReactECharts from 'echarts-for-react';
import { DateTime } from 'luxon';
import { green, red, blue } from '@mui/material/colors';

AnnotationsModule(HighchartsStock);
HighContrastDark(HighchartsStock);
HSIndicators(HighchartsStock);
const API_HOST = import.meta.env.VITE_API_HOST;

const ChartContainer = styled.div`
height: 100%
`;

const Chart = () => {
  const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const [_, setSymbol] = useRecoilState(symbolAtom);
  const byType = useRecoilValue(getByType);
  const interval = useRecoilValue(getInterval);
  const pricesMode = useRecoilValue(getPricesMode);
  const { mainLoaderShow, setAlert } = useViewActions();

  const [stockChartOptions, setStockChartOptions] = useState({
  });
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    setTimeout(() => {
      if (chartRef.current && chartRef.current.chart) {
        chartRef.current.chart.reflow();
      }
    }, 250);
  }, []);

  const analyzeSymbol = async (
    symbol: string,
    byType: string
  ): Promise<Promise<SymbolData> | undefined> => {
    if (!symbol) return;

    mainLoaderShow(true);
    try {
      const symbolAnalyze: AxiosResponse<SymbolData> = await axios.get(
        `${API_HOST}/analyze/combineAnalyzeAndRecommendations/${symbol}/${interval}/${byType}/${pricesMode}`
      );
      if (!symbolAnalyze.data.prices.length) {
        setSymbol((prevSymbolState) => ({
          ...prevSymbolState,
          symbolData: undefined,
          selectedSignal: 0,
        }));

        setAlert(
          true,
          "Error occured while trying to load data for this stock"
        );
        mainLoaderShow(false);
        return;
      }

      setAlert(false);
      setSymbol((prevSymbolState) => ({
        ...prevSymbolState,
        symbolData: symbolAnalyze.data,
        selectedSignal: symbolAnalyze.data.prices.length - 1,
      }));

      setStockChartOptions((prevStockChartOptions) => ({
        title: {
          text: symbol,
          textAlign: 'center',
          left: '50%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        grid: [
          {
            left: '10%',
            right: '8%',
            height: '50%'
          },
          {
            left: '10%',
            right: '8%',
            top: '60%',
            height: '10%'
          },
          {
            left: '10%',
            right: '8%',
            top: '72%',
            height: '25%'
          }
        ],
        xAxis: [{
          type: 'category',
          data: symbolAnalyze.data.prices.map(price => interval === '1d' ? DateTime.fromMillis(price.point.timestamp).toISODate() : DateTime.fromMillis(price.point.timestamp).toISOTime() ),
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          min: 'dataMin',
          max: 'dataMax',
          axisPointer: {
            z: 100
          }
        }, {
          type: 'category',
          gridIndex: 1,
          name: 'Volume',
          nameLocation: 'start',
          data: symbolAnalyze.data.prices.map(data => data.point.volume),
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          min: 'dataMin',
          max: 'dataMax'
        },
          {
            type: 'category',
            gridIndex: 2,
            name: 'Score',
            nameLocation: 'start',
            data: symbolAnalyze.data.prices.map(data => data.recommendation.score),
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax'
          }],
        yAxis: [{
          scale: true,
        }, {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        }, {
          scale: true,
          gridIndex: 2,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        }],
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
        ],
        // visualMap: {
        //   show: false,
        //   pieces: [
        //     {
        //       gt: 0,
        //       lte: symbolAnalyze.data.recommendationsLinesModified.bestPermutation.minBuy,
        //       color: green[400]
        //     },
        //     {
        //       gt: symbolAnalyze.data.recommendationsLinesModified.bestPermutation.minBuy,
        //       lte: 100,
        //       color: green[800]
        //     },
        //     {
        //       gt: symbolAnalyze.data.recommendationsLinesModified.bestPermutation.minSell,
        //       lte: 0,
        //       color: red[400]
        //     },
        //     {
        //       gt: -100,
        //       lte:  symbolAnalyze.data.recommendationsLinesModified.bestPermutation.minSell,
        //       color: red[800]
        //     },
        //   ],
        //   outOfRange: {
        //     color: '#999'
        //   }
        // },
        series: [
          {
            name: symbol,
            type: 'candlestick',
            data: symbolAnalyze.data.prices.map((data) => [
              Number(data.point.close.toFixed(3)),
              Number(data.point.open.toFixed(3)),
              Number(data.point.low.toFixed(3)),
              Number(data.point.high.toFixed(3)),
            ])
          },
          {
            name: 'Volume',
            type: 'bar',
            // colorBy: "data",
            seriesLayoutBy: "row",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: symbolAnalyze.data.prices.map((data, index) => ({
              value: data.point.volume,
              itemStyle: {
                color: symbolAnalyze.data.prices[index - 1] && data.point.volume > symbolAnalyze.data.prices[index - 1].point.volume ? green[400] : red[400]
              }}))
          },
          {
            name: 'Score',
            type: 'line',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: symbolAnalyze.data.prices.map(data => data.recommendation.score),
            lineStyle: {
              color: blue[400]
            },

            markLine: {
              symbol: "circle",
              data: [{
                lineStyle : {
                  color: green[400]
                },
                yAxis: symbolAnalyze.data.recommendationsLinesModified.bestPermutation.minBuy.toFixed(0),
                // precision: 0
              },
                {
                  label: {
                    show: false
                  },
                  lineStyle : {
                    color: 'white'
                  },
                  yAxis: 0,
                  // precision: 0
                },

                {
                  lineStyle : {
                    color: red[400]
                  },
                  yAxis: symbolAnalyze.data.recommendationsLinesModified.bestPermutation.minSell.toFixed(0),
                  // precision: 0
                }]
            }

          }
        ]
      }));

      mainLoaderShow(false);
      chartRef?.current?.chart.reflow();
      return symbolAnalyze.data;
    } catch (e) {
      console.error(e);
      setSymbol((prevSymbolState) => ({
        ...prevSymbolState,
        symbolData: undefined,
        selectedSignal: 0,
      }));

      setAlert(
        true,
        "This symbol not analyzed yet but it's in our list to analyzed, so stay tuned."
      );
      mainLoaderShow(false);
    }

  };

  useEffect(() => {
    analyzeSymbol(selectedSymbol, byType);
  }, [selectedSymbol, byType, interval, pricesMode]);

  return useMemo(
    () => (
      <ChartContainer>
        <Button onClick={() => analyzeSymbol(selectedSymbol, byType)}>
          Refresh
        </Button>
        {/*<HighchartsReact*/}
        {/*  constructorType={"stockChart"}*/}
        {/*  highcharts={HighchartsStock}*/}
        {/*  options={stockChartOptions}*/}
        {/*  ref={chartRef}*/}
        {/*/>*/}
        <ReactECharts
          option={stockChartOptions}
          notMerge={true}
          lazyUpdate={true}
          // theme={"dark"}
          style={{ height: "90vh", left: "-5vw", top: 0, width: "85vw" }}
          // onChartReady={this.onChartReadyCallback}
          // onEvents={EventsDict}

        />
      </ChartContainer>
    ),
    [stockChartOptions]
  );
};

export default React.memo(Chart);
