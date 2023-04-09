import { atom, selector, useRecoilState } from "recoil";

interface IViewState {
  mainLoaderShow: boolean;
}

export const viewAtom = atom({
  key: "viewAtom",
  default: {
    mainLoaderShow: false,
  } as IViewState,
});

export const getMainLoaderShow = selector({
  key: "getMainLoaderShow",
  get: ({ get }) => {
    return get(viewAtom).mainLoaderShow;
  },
});

export const useActions = () => {
  const [view, setView] = useRecoilState(viewAtom);
  const mainLoaderShow = (value: boolean) => {
    setView((prevView) => ({
      ...prevView,
      mainLoaderShow: value,
    }));
  };

  return { mainLoaderShow };
};
