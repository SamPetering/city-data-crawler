import { getCities, getCity } from './api';
import {
  CityData,
  City,
  MarketInfo,
  State,
  CityOverview,
  ExtractedCityData,
} from './types';
import cheerio from 'cheerio';
import { stateManifest } from './states';
import * as fs from 'fs';
import { wait } from './utility';

const extractCityData = (html: string): ExtractedCityData => {
  let extractedCityName = '';
  let population: number = null;
  let populationChange: number = null;
  let medianIncome: number = null;
  let medianIncomeIn2000: number = null;
  let medianHouseValue: number = null;
  let medianHouseValueIn2000: number = null;
  let crime: number = null;
  let crimeIn2006: number = null;

  let $ = cheerio.load(html);

  let cityHeader = $('.city');
  extractedCityName = cityHeader.text();

  // get population and populationChange
  const populationSection = $('.city-population').toString();
  const populationRegex = /(?<=Population in \d{4}:<\/b>[\s])([\d,.]*)/;
  const populationChangeRegex =
    /(?<=Population change since \d{4}:<\/b>[\s])([+\-\d.]*)/;
  const populationMatch = populationRegex.exec(populationSection);
  const populationChangeMatch = populationChangeRegex.exec(populationSection);
  if (populationMatch?.length && populationMatch[0]) {
    population = Number(populationMatch[0].replace(',', ''));
  }
  if (populationChangeMatch?.length && populationChangeMatch[0]) {
    populationChange = Number(populationChangeMatch[0].replace(',', ''));
  }

  // get medianIncome and medianIncomeIn2000
  // get medianHouseValue and medianHouseValueIn2000
  const medianIncomeSectionText = $('.median-income').text();
  const medianIncomeRegex =
    /(?<=Estimated median household income in \d{4}:\s)([$\d,.]*)([\s(a-z$\d,)]*)/;
  const medianHouseValueRegex =
    /(?<=Estimated median house or condo value in \d{4}:\s)([$\d,.]*)([\s(a-z$\d,)]*)/;
  const medianIncomeMatch = medianIncomeRegex.exec(medianIncomeSectionText);
  const medianHouseValueMatch = medianHouseValueRegex.exec(
    medianIncomeSectionText
  );
  if (medianIncomeMatch?.length && medianIncomeMatch[1]) {
    medianIncome = Number(medianIncomeMatch[1].split(/[$,]/).join(''));
  }
  if (medianIncomeMatch?.length && medianIncomeMatch[2]) {
    const stripped = /[$][\d,]*/.exec(medianIncomeMatch[2]);
    medianIncomeIn2000 = Number(stripped[0].split(/[$,]/).join(''));
  }
  if (medianHouseValueMatch?.length && medianHouseValueMatch[1]) {
    medianHouseValue = Number(medianHouseValueMatch[1].split(/[$,]/).join(''));
  }
  if (medianHouseValueMatch?.length && medianHouseValueMatch[2]) {
    const stripped = /[$][\d,]*/.exec(medianHouseValueMatch[2]);
    medianHouseValueIn2000 = Number(stripped[0].split(/[$,]/).join(''));
  }

  // get crime and crimIn2006
  const crimeTableFooterDataText = $('#crimeTab > tfoot > tr')
    .children('td')
    .text()
    .replace(/.*index/, '')
    .split(/\.\d/);
  crimeIn2006 = Number(crimeTableFooterDataText[0]);
  crime = Number(crimeTableFooterDataText[crimeTableFooterDataText.length - 2]);

  return {
    extractedCityName,
    population,
    populationChange,
    medianIncome,
    medianIncomeIn2000,
    medianHouseValue,
    medianHouseValueIn2000,
    crime,
    crimeIn2006,
  };
};

const extractCities = (html: string, removeString: string): CityOverview[] => {
  console.log('extracting cities');
  let cityOverviews: CityOverview[] = [];
  let $ = cheerio.load(html);
  let citiesTable = $('#cityTAB');
  let tableBody = citiesTable.children('tbody');
  let rows = tableBody.children();

  rows.each((_, element) => {
    const name = $(element).children('td').eq(1).text();
    const population = Number(
      $(element).children('td').eq(2).text().replace(',', '')
    );
    cityOverviews.push({ name, population });
  });

  cityOverviews.forEach((city, index) => {
    cityOverviews[index] = {
      ...city,
      name: city.name.replace(removeString, '').trim(),
    };
  });
  return cityOverviews;
};

const getMarketInfo = async (
  states: State[],
  popLimit?: number
): Promise<MarketInfo> => {
  const timestamp = Date.now();
  console.log(
    `getting market info for ${states.length} state${
      states.length > 1 ? 's' : ''
    }`
  );
  console.log(states.map((x) => x.abbr));

  const marketInfo: MarketInfo = {};
  let allCities: City[] = [];

  //get cities in state
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

  //get each city's city data
  if (allCities.length) {
    console.log(
      `getting data for ${allCities.length} cit${
        allCities.length > 1 ? 'ies' : 'y'
      }.`
    );

    const allCityData: CityData[] = [];
    while (allCities.length) {
      wait(1000);
      const currentCity = allCities.shift();
      console.log('getting data for: ', currentCity);
      const cityData = await getCityData(currentCity);
      allCityData.push(cityData);
    }
    console.log(allCityData);

    //write to /results
    fs.writeFileSync(
      `${__dirname}/results/city-data-${timestamp}.json`,
      JSON.stringify(allCityData)
    );
  }

  console.log('finished');
  return marketInfo;
};

const trimName = (x: string) => x.split(/[\s']/).join('-');

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

getMarketInfo(stateManifest, 50000);
