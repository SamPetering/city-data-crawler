import { getCities, getCity } from './api';
import { CityData, City, MarketInfo, State, StateData } from './types';
import cheerio from 'cheerio';
import { stateManifest } from './states';

const getCityListData = async (cityList: City[]) => {
  try {
    let statesObj: StateData = {};
    while (cityList.length) {
      const currentCity = cityList.pop();
      if (currentCity) {
        const city = currentCity.cityName.split(' ').join('-');
        const state = currentCity.state.split(' ').join('-');
        const resp = await getCity(city, state);
        if (resp) {
          const html: string = resp.data;
          const cityData = extractCityData(html);
          statesObj[currentCity.cityName] = cityData;
        }
      }
    }
    console.log(statesObj);
  } catch (e) {
    console.log(e);
  }
};

const extractCityData = (html: string): CityData => {
  let population: number | undefined = undefined;
  let name = '';
  let $ = cheerio.load(html);

  let cityHeader = $('.city');
  name = cityHeader.text();

  let populationSection = $('.city-population');
  const populationRegex = /(?<=Population in 20\d\d:<\/b>[\s])(\b\d[\d,.]*\b)*/;
  const matches = populationRegex.exec(populationSection.toString());
  if (matches) {
    population = Number(matches[0].replace(',', ''));
  }

  return {
    name,
    population,
  };
};

const extractCities = (html: string, removeString: string) => {
  console.log('extracting cities');
  let cities: string[] = [];
  let $ = cheerio.load(html);
  let citiesTable = $('#cityTAB');
  let tableBody = citiesTable.children('tbody');
  let rows = tableBody.children();
  rows.each((_, element) => {
    const cityName = $(element).children('td').eq(1).text();
    cities.push(cityName);
  });
  cities.forEach((city, index) => {
    cities[index] = city.replace(removeString, '').trim();
  });
  return cities;
};

const getMarketInfo = async (states: State[]): Promise<MarketInfo> => {
  console.log('getting market info');
  console.log(states);

  const marketInfo: MarketInfo = {};
  let allCities: City[] = [];

  //get cities in state
  while (states.length) {
    let currentState = states.pop();
    if (currentState) {
      let resp = await getCities(currentState.name);
      if (resp) {
        const html = resp.data;
        const removeString = `, ${currentState.abbr}`;
        const cities = extractCities(html, removeString);
        const citiesMap: City[] = cities.map((city) => ({
          cityName: city,
          state: currentState.name,
        }));
        allCities = [...allCities, ...citiesMap];
      }
    }
  }

  //get each city's city data
  if (allCities.length) {
    console.log(`getting data for ${allCities.length} cities.`);
    const allCityData = await Promise.all(allCities.map(getCityData));
    console.log(allCityData);
  }

  //map cities to state

  //return object of all states

  console.log('finished');
  return marketInfo;
};

const trimName = (x: string) => x.split(/[\s']/).join('-');

const getCityData = async (city: City): Promise<CityData | null> => {
  try {
    const c = trimName(city.cityName);
    const s = trimName(city.state);
    const resp = await getCity(c, s);
    if (resp) {
      const html: string = resp.data;
      const cityData = extractCityData(html);
      return cityData;
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
  }
};

getMarketInfo(stateManifest);
