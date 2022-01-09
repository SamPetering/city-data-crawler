import { getCities, getCity } from './api';
import { extractCities, extractCityData } from './extractors';
import { State, CityData, CityOverview } from './types';
import { wait, trimName } from './utility';

export const getAllCities = async (states: State[], popLimit: number) => {
  let cityOverviews: CityOverview[] = [];
  while (states.length) {
    let currentState = states.shift();
    if (currentState) {
      console.info(`getting cities in ${currentState.stateName}`);
      let resp = await getCities(currentState.stateName.split(' ').join('-'));
      if (resp) {
        const html = resp.data;
        const extractedCities = extractCities(html, currentState);
        cityOverviews.push(...extractedCities);

        //filter out low population cities
        if (popLimit) {
          cityOverviews = cityOverviews.filter((x) => x.population >= popLimit);
        }
      }
    }
  }
  console.info(
    `found ${cityOverviews.length} cities with populations over ${popLimit}`
  );
  return cityOverviews;
};

export const getAllCityData = async (allCities: CityOverview[]) => {
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

const getCityData = async ({
  cityName,
  stateName,
  href,
}: CityOverview): Promise<CityData | null> => {
  try {
    const c = trimName(cityName);
    const s = trimName(stateName);
    const resp = await getCity(c, s, href);
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
        cityName,
        stateName,
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
