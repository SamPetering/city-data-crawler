import { getCities, getCity } from './api';
import { extractCities, extractCityData } from './extractors';
import { State, City, CityData } from './types';
import { wait, trimName } from './utility';

export const getAllCities = async (states: State[], popLimit: number) => {
  let allCities: City[] = [];
  while (states.length) {
    let currentState = states.pop();
    if (currentState) {
      let resp = await getCities(currentState.name.split(' ').join('-'));
      if (resp) {
        const html = resp.data;
        const removeString = `, ${currentState.abbr}`;
        let cities = extractCities(html, removeString);

        //filter out low population cities
        if (popLimit) {
          cities = cities.filter((x) => x.population >= popLimit);
        }

        const citiesMap: City[] = cities.map((city) => ({
          cityName: city.name,
          stateName: currentState.name,
        }));

        allCities = [...allCities, ...citiesMap];
      }
    }
  }
  return allCities;
};

export const getAllCityData = async (allCities: City[]) => {
  console.log(
    `getting data for ${allCities.length} cit${
      allCities.length > 1 ? 'ies' : 'y'
    }.`
  );

  const allCityData: CityData[] = [];

  while (allCities.length) {
    wait(2000);
    const currentCity = allCities.shift();
    console.log('getting data for: ', currentCity);
    const cityData = await getCityData(currentCity);
    allCityData.push(cityData);
  }
  return allCityData;
};

const getCityData = async (city: City): Promise<CityData | null> => {
  try {
    const c = trimName(city.cityName);
    const s = trimName(city.stateName);
    const resp = await getCity(c, s);
    if (resp) {
      const html: string = resp.data;

      const {
        population,
        populationChange,
        medianIncome,
        medianIncomeIn2000,
        medianHouseValue,
        medianHouseValueIn2000,
        crime,
        crimeIn2006,
      } = extractCityData(html);

      const cityData: CityData = {
        ...city,
        population,
        populationChange,
        medianIncome,
        medianIncomeIn2000,
        medianHouseValue,
        medianHouseValueIn2000,
        crime,
        crimeIn2006,
      };
      return cityData;
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
  }
};
