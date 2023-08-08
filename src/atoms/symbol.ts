import { atom, selector, useRecoilState } from "recoil";
import { Interval } from "../components/StockSystem/enums/Interval";
import axios, { AxiosResponse } from 'axios';
import { useViewActions } from './view';
import { useEffect } from 'react';

interface Recommendation {
  buyCount: number;
  buyReasons: Array<string>;
  sellCount: number;
  sellReasons: Array<string>;
  buySellSum: number;
  score: number;
  stopLoss: number
}

export interface SymbolData {
  prices: Array<{
    point: {
      adjClose: number;
      close: number;
      timestamp: number;
      high: number;
      low: number;
      open: number;
      volume: number;
    };
    recommendation: Recommendation;
  }>;
  analyzedResult: {
    interval: string;
    symbol: string;
    results: {
      [PriceMode.normal]: {
        [ByType.byWinRate]: Record<
          string,
          {
            profit: number;
            bestPermutation: Record<string, number>;
            scannedPermutations: number;
            winRate: number;
          }
        >;
        [ByType.byProfit]: Record<
          string,
          {
            profit: number;
            bestPermutation: Record<string, number>;
            scannedPermutations: number;
            winRate: number;
          }
        >;
      };
      [PriceMode.dividendsAdjusted]: {
        [ByType.byWinRate]: Record<
          string,
          {
            profit: number;
            bestPermutation: Record<string, number>;
            scannedPermutations: number;
            winRate: number;
          }
        >;
        [ByType.byProfit]: Record<
          string,
          {
            profit: number;
            bestPermutation: Record<string, number>;
            scannedPermutations: number;
            winRate: number;
          }
        >;
      };
    };
  };
  nextEarning: number,
  recommendationsLinesModified: {
    bestPermutation: {
      minBuy: number;
      minSell: number;
    };
    winRate: number;
    profit: number;
    totalTrades: number;
    goodTrades: number;
    badTrades: number;
  };
}

enum ByType {
  byWinRate = "byWinRate",
  byProfit = "byProfit",
}

enum PriceMode {
  normal = "normal",
  dividendsAdjusted = "dividendsAdjusted",
}

interface ISymbolState {
  selectedSymbol: string;
  symbolData: SymbolData | undefined;
  selectedSignal: number;
  settings: {
    byType: "byWinRate" | "byProfit";
    interval: Interval;
    intervals: Array<Interval>;
    pricesMode: "normal" | "dividendsAdjusted";
  };
}

export const symbolAtom = atom({
  key: "symbolAtom",
  default: {
    selectedSymbol: "",
    symbolData: undefined,
    selectedSignal: 0,
    settings: {
      byType: "byWinRate",
      interval: "1d",
      intervals: [],
      pricesMode: "normal",
    },
  } as ISymbolState,
});

export const getSelectedSymbol = selector({
  key: "getSelectedSymbol",
  get: ({ get }) => {
    return get(symbolAtom).selectedSymbol;
  },
});

export const getSymbolData = selector({
  key: "getSymbolData",
  get: ({ get }) => {
    return get(symbolAtom).symbolData;
  },
});

export const getSelectedSignal = selector({
  key: "getSelectedSignal",
  get: ({ get }) => {
    return get(symbolAtom).selectedSignal;
  },
});

export const getSettings = selector({
  key: "getSettings",
  get: ({ get }) => {
    return get(symbolAtom).settings;
  },
});

export const getByType = selector({
  key: "getByType",
  get: ({ get }) => {
    return get(symbolAtom).settings.byType;
  },
});

export const getInterval = selector({
  key: "getInterval",
  get: ({ get }) => {
    return get(symbolAtom).settings.interval;
  },
});

export const getIntervals = selector({
  key: "getIntervals",
  get: ({ get }) => {
    return get(symbolAtom).settings.intervals;
  },
});

export const getPricesMode = selector({
  key: "getPricesMode",
  get: ({ get }) => {
    return get(symbolAtom).settings.pricesMode;
  },
});

export const getNextEarning = selector({
  key: "getNextEarning",
  get: ({ get }) => {
    return get(symbolAtom).symbolData?.nextEarning;
  },
});

const API_HOST = import.meta.env.VITE_API_HOST;

export const useSymbol = () => {
  const [symbolState, setSymbolState] = useRecoilState(symbolAtom);
  const { mainLoaderShow, setAlert } = useViewActions();
  const { interval } = symbolState.settings;

  useEffect(() => {
    if(symbolState.selectedSymbol) {
      changeSymbol(symbolState.selectedSymbol)
    }
  }, [symbolState.selectedSymbol, symbolState.settings.byType, symbolState.settings.interval])

  const changeSymbol = async (symbol: string) => {


    mainLoaderShow(true);
    setAlert(false);
    const symbolAnalyze: AxiosResponse<SymbolData> = await axios.get(
      `${API_HOST}/analyze/combineAnalyzeAndRecommendations/${symbol}/${interval}/${symbolState.settings.byType}/${symbolState.settings.pricesMode}`
    );


    if(!symbolAnalyze.data.prices.length) {
      setSymbolState((prevSymbolState) => ({
        ...prevSymbolState,
        symbolData: undefined,
        selectedSignal: 0,
      }));
      setAlert(
        true,
        "Error occured while trying to load data for this stock"
      );
      return;
    }

    setSymbolState((prevSymbolState) => ({
      ...prevSymbolState,
      symbolData: symbolAnalyze.data,
      selectedSymbol: symbol,
      settings: {
        ...prevSymbolState.settings,
      },
    }));
    mainLoaderShow(false);
  };

  return { changeSymbol };
};
