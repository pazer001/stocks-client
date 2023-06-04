import { atom, selector, useRecoilState } from "recoil";
import { Interval } from "../components/StockSystem/enums/Interval";

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
  recommendationBacktest: {
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

export const useSymbol = () => {
  const [symbol, setSymbolState] = useRecoilState(symbolAtom);
  const { interval } = symbol.settings;

  const changeSymbol = (symbol: string, intervals: Array<Interval>) => {
    const newInterval = intervals.includes(interval) ? interval : intervals[0];
    const newIntervals: Array<Interval> = [];
    const systemIntervals = Object.values(Interval);

    systemIntervals.forEach((systemInterval, index) => {
      if (intervals.includes(systemInterval)) {
        newIntervals.push(systemInterval);
      }
    });

    setSymbolState((prevSymbolState) => ({
      ...prevSymbolState,
      selectedSymbol: symbol,
      settings: {
        ...prevSymbolState.settings,
        intervals: newIntervals,
        interval: newInterval,
      },
    }));
  };

  return { changeSymbol };
};
