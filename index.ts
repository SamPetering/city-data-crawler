import { State } from './types';
import { stateManifest } from './states';
import { convertToCSV } from './utility';
import * as fs from 'fs';
import { getAllCities, getAllCityData } from './getters';

const POPULATION_LIMIT = 100000;

const getMarketInfo = async (states: State[], popLimit: number) => {
  const timestamp = Date.now();
  const statesJoined = states.map((x) => x.abbr).join('-');

  console.log(
    `getting market info for ${states.length} state${
      states.length > 1 ? 's' : ''
    }. Population limit: ${popLimit}`
  );
  console.log(states.map((x) => x.abbr));

  //get cities in state
  const allCities = await getAllCities(states, popLimit);

  //get each city's city data
  const allCityData = await getAllCityData(allCities);

  //write to /results
  if (allCityData.length) {
    const csv = convertToCSV(allCityData, Object.keys(allCityData[0]));
    const json = JSON.stringify(allCityData);
    const outputFileName = `${__dirname}/results/city-data-LIMIT${popLimit}-${statesJoined}-${timestamp}`;
    fs.writeFileSync(`${outputFileName}.json`, json);
    fs.writeFileSync(`${outputFileName}.csv`, csv);
  }
  console.log('finished');
};

getMarketInfo(stateManifest, POPULATION_LIMIT);
