export type MarketInfo = {
  [key: string]: CityData;
};

export type City = {
  cityName: string;
  stateName: string;
};

type MarketData = {
  population: number | null;
  populationChange: number | null;
  medianIncome: number | null;
  medianIncomeIn2000: number | null;
  medianHouseValue: number | null;
  medianHouseValueIn2000: number | null;
  crime: number | null;
  crimeIn2006: number | null;
};

export type CityData = City & MarketData;
export interface State {
  name: string;
  abbr: string;
}

export type ExtractedCityData = MarketData & {
  extractedCityName: string;
};
export interface CityOverview {
  name: string;
  population: number;
}
