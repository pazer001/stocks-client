import { atom, useRecoilState } from 'recoil';
import axios from 'axios';

export interface EconomicEvent {
  gmt: string;
  country: string;
  eventName: string;
  actual: string;
  consensus: string;
  previous: string;
  description: string;
}

// interface IExtraDataState {
  // economicEvents: Array<EconomicEvent>;
// }

export const extraDataAtom = atom({
  key: "extraDataAtom",
  default: {
    // economicEvents: [],
  },
});

// export const getEconomicEvents = selector({
//   key: "getEconomicEvents",
//   get: ({ get }) => {
//     return get(extraDataAtom).economicEvents;
//   },
// });


const API_HOST = import.meta.env.VITE_API_HOST;

export interface HistoricalDataCombined {
  normal: IRestructurePrices;
  dividendsAdjusted: IRestructurePrices;
}

export interface IRestructurePrices {
  date?: Array<Date>;
  volume: Array<number>;
  high: Array<number>;
  low: Array<number>;
  close: Array<number>;
  open: Array<number>;
  timestamp: Array<number>;
}


export const useExtraData = () => {
  const [extraData] = useRecoilState(extraDataAtom);
  // const economicEvents = useRecoilValue(getEconomicEvents)

  // const getEconomicEventsData = async (country: string, date: string): Promise<Array<EconomicEvent> | undefined>  => {
  //   try {
  //   const economicEventsResponse   = await axios.get(`${API_HOST}/stocks-adapter/economicEvents/${country}/${date}`);
  //
  //     return economicEventsResponse.data
  //
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  const historicalDataCombined = async (symbol: string, interval: string, startDate: number, endDate: number): Promise<HistoricalDataCombined | undefined> => {
    try {
      const historicalDataCombinedResponse = await axios.get(`${API_HOST}/stocks-adapter/historicalDataCombined/${symbol}/${interval}/${startDate}/${endDate}`);
      return historicalDataCombinedResponse.data;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  return {
    extraData,
    historicalDataCombined
    // getEconomicEventsData,
    // economicEvents,
  }
}