export type MarketInfo = {
  [key: string]: StateData;
};

export type StateData = {
  [key: string]: CityData;
};

export type CityData = {
  name: string;
  population?: number;
};

export interface City {
  cityName: string;
  state: string;
}

export interface State {
  name: string;
  abbr: string;
}
