import React, { useEffect, useMemo, useState } from "react";
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

AnnotationsModule(HighchartsStock);
HighContrastDark(HighchartsStock);
HSIndicators(HighchartsStock);
const API_HOST = import.meta.env.VITE_API_HOST;

const Chart = () => {
  const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const [symbol, setSymbol] = useRecoilState(symbolAtom);
  const byType = useRecoilValue(getByType);
  const interval = useRecoilValue(getInterval);
  const pricesMode = useRecoilValue(getPricesMode);
  const { mainLoaderShow, setAlert } = useViewActions();

  const [stockChartOptions, setStockChartOptions] = useState({
    chart: {
      height: `54%`,
      zooming: {
        type: "xy",
      },
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
              const index = this.index;
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

  const analyzeSymbol = async (
    symbol: string,
    byType: string
  ): Promise<Promise<SymbolData> | undefined> => {
    if (!symbol) return;

    mainLoaderShow(true);
    const symbolAnalyze: AxiosResponse<SymbolData> = await axios.get(
      `${API_HOST}/analyze/analyzedResult/${symbol}/${interval}/${byType}/${pricesMode}`
    );
    if (!symbolAnalyze.data.prices.length) {
      setSymbol((prevSymbolState) => ({
        ...prevSymbolState,
        symbolData: undefined,
        selectedSignal: 0,
      }));

      setAlert(true, "Error occured while trying to load data for this stock");
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
              label: {
                text: "Buy",
                color: "white",
              },
            },
            {
              value:
                symbolAnalyze.data.recommendationBacktest?.bestPermutation
                  .minSell,
              color: "red",
              dashStyle: "shortdash",
              width: 2,
              label: {
                text: "Sell",
                color: "white",
              },
            },
          ],
        },
      ],

      series: [
        {
          id: "prices",
          upColor: `green`,
          // downColor: "red",
          type: "candlestick",
          name: symbol,
          data: symbolAnalyze.data.prices.map((data) => [
            data.point.timestamp,
            data.point.open,
            data.point.high,
            data.point.low,
            data.point.close,
          ]),
          yAxis: 0,
          allowPointSelect: true,
          colors: symbolAnalyze.data.prices.map((data, index) => {
            if (
              symbolAnalyze.data.prices[index - 1] &&
              symbolAnalyze.data.prices[index].point.close >
                symbolAnalyze.data.prices[index - 1].point.close
            ) {
              return `green`;
            } else {
              return `red`;
            }
          }),
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
  };

  useEffect(() => {
    analyzeSymbol(selectedSymbol, byType);
  }, [selectedSymbol, byType, interval, pricesMode]);

  return useMemo(
    () => (
      <>
        <Button onClick={() => analyzeSymbol(selectedSymbol, byType)}>
          Refresh
        </Button>
        <HighchartsReact
          constructorType={"stockChart"}
          highcharts={HighchartsStock}
          options={stockChartOptions}
        />
      </>
    ),
    [stockChartOptions]
  );
};

export default React.memo(Chart);
