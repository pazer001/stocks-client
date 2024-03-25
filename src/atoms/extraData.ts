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

export const useExtraData = () => {
  const [extraData] = useRecoilState(extraDataAtom);
  // const economicEvents = useRecoilValue(getEconomicEvents)

  const getEconomicEventsData = async (country: string, date: string): Promise<Array<EconomicEvent> | undefined>  => {
    try {
    const economicEventsResponse   = await axios.get(`${API_HOST}/stocks-adapter/economicEvents/${country}/${date}`);

      return economicEventsResponse.data

    } catch (error) {
      console.error(error);
    }
  }

  return {
    extraData,
    getEconomicEventsData,
    // economicEvents,
  }
}