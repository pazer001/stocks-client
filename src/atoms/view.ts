import { atom, selector, useRecoilState } from "recoil";

interface IViewState {
  mainLoaderShow: boolean;
  alertShow: boolean;
  alertMessage?: string;
}

export const viewAtom = atom({
  key: "viewAtom",
  default: {
    mainLoaderShow: false,
    alertShow: false,
    alertMessage: "",
  } as IViewState,
});

export const getMainLoaderShow = selector({
  key: "getMainLoaderShow",
  get: ({ get }) => {
    return get(viewAtom).mainLoaderShow;
  },
});

export const getAlertShow = selector({
  key: "getAlertShow",
  get: ({ get }) => {
    return get(viewAtom).alertShow;
  },
});

export const getAlertMessage = selector({
  key: "getAlertMessage",
  get: ({ get }) => {
    return get(viewAtom).alertMessage;
  },
});

export const useViewActions = () => {
  const [, setView] = useRecoilState(viewAtom);
  const mainLoaderShow = (value: boolean) => {
    setView((prevView) => ({
      ...prevView,
      mainLoaderShow: value,
    }));
  };

  const setAlert = (alertShow: boolean, alertMessage?: string) => {
    setView((prevView) => ({
      ...prevView,
      alertShow,
      alertMessage,
    }));
  };

  return { mainLoaderShow, setAlert };
};
