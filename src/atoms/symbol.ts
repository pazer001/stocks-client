import { atom, selector } from "recoil";

interface Recommendation {
  buyCount: number;
  buyReasons: Array<string>;
  sellCount: number;
  sellReasons: Array<string>;
  buySellSum: number;
  score: number;
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
    results: Record<
      string,
      {
        plAmount: number;
        bestPermutation: Record<string, number>;
        scannedPermutations: number;
        winRate: number;
      }
    >;
  };
  recommendationBacktest: {
    bestPermutation: {
      minBuy: number;
      minSell: number;
    };
    winRate: number;
    profit: number;
  };
}

interface ISymbolState {
  selectedSymbol: string;
  symbolData: SymbolData | undefined;
  selectedSignal: number | undefined;
  settings: {
    byType: "byWinRate" | "byProfit";
    interval: "1d";
  };
}

export const symbolAtom = atom({
  key: "symbolAtom",
  default: {
    selectedSymbol: "",
    symbolData: undefined,
    selectedSignal: undefined,
    settings: {
      byType: "byWinRate",
      interval: "1d",
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
