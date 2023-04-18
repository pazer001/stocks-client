import React, { useEffect, useMemo, useState } from "react";
import HighchartsReact from "highcharts-react-official";
import HighchartsStock from "highcharts/highstock";
import {
  getSelectedSymbol,
  SymbolData,
  symbolAtom,
  getByType,
  getInterval,
} from "../../atoms/symbol";
import { useRecoilState, useRecoilValue } from "recoil";
import AnnotationsModule from "highcharts/modules/annotations";
import HighContrastDark from "highcharts/themes/high-contrast-dark";
import axios, { AxiosResponse } from "axios";
import { useActions } from "../../atoms/view";

AnnotationsModule(HighchartsStock);
HighContrastDark(HighchartsStock);
const API_HOST = `http://85.64.194.77:3000`;

const Chart = () => {
  const selectedSymbol = useRecoilValue(getSelectedSymbol);
  const [symbol, setSymbol] = useRecoilState(symbolAtom);
  const byType = useRecoilValue(getByType);
  const interval = useRecoilValue(getInterval);
  const { mainLoaderShow } = useActions();

  const [stockChartOptions, setStockChartOptions] = useState({
    chart: {
      height: `54%`,
    },
    plotOptions: {
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
      `${API_HOST}/analyze/analyzedResult/${symbol}/${interval}/${byType}`
    );

    setSymbol((prevSymbolState) => ({
      ...prevSymbolState,
      symbolData: symbolAnalyze.data,
    }));

    // @ts-ignore
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
          // allowPointSelect: true,
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

    setSymbol((prevSymbolState) => ({
      ...prevSymbolState,
      symbolData: symbolAnalyze.data,
    }));
    mainLoaderShow(false);
    return symbolAnalyze.data;
  };

  useEffect(() => {
    analyzeSymbol(selectedSymbol, byType);
  }, [selectedSymbol, byType, interval]);

  return useMemo(
    () => (
      <HighchartsReact
        constructorType={"stockChart"}
        highcharts={HighchartsStock}
        options={stockChartOptions}
      />
    ),
    [stockChartOptions]
  );
};

export default React.memo(Chart);
