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

AnnotationsModule(HighchartsStock);
HighContrastDark(HighchartsStock);
HSIndicators(HighchartsStock);
const API_HOST = import.meta.env.VITE_API_HOST;

const ChartContainer = styled.div``;

const Chart = () => {
  const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const [_, setSymbol] = useRecoilState(symbolAtom);
  const byType = useRecoilValue(getByType);
  const interval = useRecoilValue(getInterval);
  const pricesMode = useRecoilValue(getPricesMode);
  const { mainLoaderShow, setAlert } = useViewActions();

  const [stockChartOptions, setStockChartOptions] = useState({
    chart: {
      height: `58%`,

      zooming: {
        type: "xy",
      },
      panning: {
        enabled: true,
      },
      panKey: "ctrl",
    },
    plotOptions: {
      candlestick: {
        lineWidth: 1,
      },
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        colorByPoint: true,
        point: {
          events: {
            click: function () {
              // @ts-ignore
              // console.log(this)
              const index = this.dataGroup.start;
              setSymbol((prevSymbolState) => ({
                ...prevSymbolState,
                selectedSignal: index,
              }));
            },
          },
        },
      },
      column: {
        colorByPoint: true,
      },
      area: {
        marker: {
          enabled: false,
          symbol: "circle",
          radius: 2,
          states: {
            hover: {
              enabled: true,
            },
          },
        },
      },
    },
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
        `${API_HOST}/analyze/analyzedResult/${symbol}/${interval}/${byType}/${pricesMode}`
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
        ...prevStockChartOptions,
        title: {
          text: `${symbol} Chart`,
        },
        yAxis: [
          {
            labels: {
              align: "right",
              x: -3,
            },
            title: {
              text: "Stock",
            },
            height: "60%",
            lineWidth: 2,
            resize: {
              enabled: true,
            },
          },
          {
            labels: {
              align: "right",
              x: -3,
            },
            title: {
              text: "Win Rate Score",
            },
            top: "65%",
            height: "40%",
            offset: 0,
            lineWidth: 2,
            plotLines: [
              {
                value:
                  symbolAnalyze.data.recommendationBacktest?.bestPermutation
                    .minBuy,
                color: "green",
                dashStyle: "shortdash",
                width: 2,
              },
              {
                value:
                  symbolAnalyze.data.recommendationBacktest?.bestPermutation
                    .minSell,
                color: "red",
                dashStyle: "shortdash",
                width: 2,
              },
            ],
          },
        ],

        series: [
          {
            id: "prices",
            // upColor: `green`,
            // downColor: "red",
            type: "candlestick",
            name: symbol,
            data: symbolAnalyze.data.prices.map((data) => [
              data.point.timestamp,
              Number(data.point.open.toFixed(3)),
              Number(data.point.high.toFixed(3)),
              Number(data.point.low.toFixed(3)),
              Number(data.point.close.toFixed(3)),
            ]),
            yAxis: 0,
            allowPointSelect: true,
            colors: symbolAnalyze.data.prices.map((data, index) =>
              symbolAnalyze.data.prices[index].point.close >
              symbolAnalyze.data.prices[index].point.open
                ? "green"
                : "red"
            ),
          },
          {
            type: "area",
            name: "Score",
            data: symbolAnalyze.data.prices.map((data) => [
              data.point.timestamp,
              Number(data.recommendation.score),
            ]),
            yAxis: 1,
          },
        ],
      }));

      mainLoaderShow(false);
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
        <HighchartsReact
          constructorType={"stockChart"}
          highcharts={HighchartsStock}
          options={stockChartOptions}
          ref={chartRef}
        />
      </ChartContainer>
    ),
    [stockChartOptions]
  );
};

export default React.memo(Chart);
