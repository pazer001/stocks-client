import { atom, selector, useRecoilState } from 'recoil';
import { Interval } from '../components/StockSystem/enums/Interval';
import axios, { AxiosResponse } from 'axios';
import { useViewActions } from './view';
import { useEffect } from 'react';
import { ISymbol } from '../components/StockSystem/SymbolsList';

interface Recommendation {
  buyCount: number;
  buyReasons: Array<string>;
  sellCount: number;
  sellReasons: Array<string>;
  buySellSum: number;
  score: number;
  stopLoss: number;
  buyThresholdsReasons: Record<TDataSourceType, string[]>
}

export type TRiskLevel = 'Low' | 'Medium' | 'High';
export type TDataSourceType = 'symbol' | 'index' | 'sector';

export interface SymbolData {
  recommendations: Array<{
    point: {
      adjClose: number;
      close: number;
      timestamp: number;
      high: number;
      low: number;
      open: number;
      volume: number;
    };
    reasons: {
      buy: Record<TDataSourceType, string[]>
      sell: Record<TDataSourceType, string[]>
    }
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
  nextEarning: number;
  recommendationsLines: {
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
  buyThresholdData: Record<string, Array<number>>;
  stopLoss: Array<number>;
  isPennyStock: boolean;
  newsSentiment: "positive" | "negative" | "neutral";
  riskLevel: TRiskLevel;
  symbol: string;
  lastRelativeStrength: number;
}

enum ByType {
  byWinRate = "byWinRate",
  byProfit = "byProfit",
  byMixed = "byMixed",
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
      byType: "byProfit",
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

let loadingSymbol = false

export const useSymbol = () => {
  const [symbolState, setSymbolState] = useRecoilState(symbolAtom);
  const { mainLoaderShow, setAlert } = useViewActions();
  const { interval, byType } = symbolState.settings;
  const selectedSignal = symbolState.selectedSignal;


  useEffect(() => {

    if (symbolState.selectedSymbol && !loadingSymbol) {

      changeSymbol(symbolState.selectedSymbol);
    }
  }, [
    symbolState.selectedSymbol,
    symbolState.settings.byType,
    symbolState.settings.interval,
  ]);

  const setSelectSignal = (signal: number) => {
    setSymbolState((prevSymbolState) => ({
      ...prevSymbolState,
      selectedSignal: signal,
    }));
  }

  const getWatchlistSymbols = (): Promise<AxiosResponse<Array<ISymbol>>> => {
    const symbols =
      JSON.parse(localStorage.getItem("watchlist") as string) || [];
    return axios.post(`${API_HOST}/analyze/watchlist`, symbols);
  };

  const addWatchlistSymbols = async (symbols: Array<string>) => {
    let watchlist: Array<string> =
      JSON.parse(localStorage.getItem("watchlist") as string) || [];
    watchlist = watchlist.concat(...symbols);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    return axios.post(`${API_HOST}/analyze/watchlist/items`, symbols);
  };

  const getSuggestedSymbols = async (): Promise<Array<ISymbol>> => {
    mainLoaderShow(true);
    const supportedSymbolsResult: AxiosResponse<Array<ISymbol>> =
      await axios.get(
        `${API_HOST}/analyze/suggestedSymbols/${interval}/${byType}`,
      );
    mainLoaderShow(false);
    return supportedSymbolsResult.data;
  };

  const changeSymbol = async (symbol: string) => {
    loadingSymbol = true
    mainLoaderShow(true);
    setAlert(false);
    try {
      const analyzedSymbol: AxiosResponse<SymbolData> = await analyzeSymbol(
        symbol,
      );

      if (!analyzedSymbol.data.recommendations.length) {
        setSymbolState((prevSymbolState) => ({
          ...prevSymbolState,
          symbolData: undefined,
          selectedSignal: 0,
        }));
        setAlert(
          true,
          "Error occurred while trying to load data for this symbol. This can happen if there is no analysis for this symbol.",
        );
        return;
      }

      setSymbolState((prevSymbolState) => ({
        ...prevSymbolState,
        symbolData: analyzedSymbol.data,
        selectedSignal: analyzedSymbol.data.recommendations.length - 1,
        selectedSymbol: symbol,
        settings: {
          ...prevSymbolState.settings,
        },
      }));
      mainLoaderShow(false);
    } catch (e) {
      mainLoaderShow(false);
      setAlert(
        true,
        "Error occurred while trying to load data for this symbol. This can happen if there is no analysis for this symbol.",
      );
    }
    loadingSymbol = false
  };

  const analyzeSymbol = async (
    symbol: string,
  ): Promise<AxiosResponse<SymbolData>> => {
    return axios.get(
      `${API_HOST}/analyze/combineAnalyzeAndRecommendations/${symbol}/${interval}/${symbolState.settings.byType}/${symbolState.settings.pricesMode}`,
    );
  };

  return {
    changeSymbol,
    getSuggestedSymbols,
    analyzeSymbol,
    getWatchlistSymbols,
    addWatchlistSymbols,
    setSelectSignal,
    selectedSignal
  };
};
