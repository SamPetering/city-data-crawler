import { ExtractedCityData, CityOverview, State } from './types';
import cheerio from 'cheerio';

export const extractCityData = (html: string): ExtractedCityData => {
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

export const extractCities = (
  html: string,
  { stateName, stateAbbr }: State
): CityOverview[] => {
  const removeString = `, ${stateAbbr}`;
  let cityOverviews: CityOverview[] = [];
  let $ = cheerio.load(html);
  let citiesTable = $('#cityTAB');
  let tableBody = citiesTable.children('tbody');
  let rows = tableBody.children();

  rows.each((_, element) => {
    const nameEl = $(element).children('td').eq(1);
    const href = nameEl.find('a').attr('href');
    const cityName = nameEl.text();
    const population = Number(
      $(element).children('td').eq(2).text().replace(',', '')
    );
    cityOverviews.push({ href, cityName, population, stateName });
  });

  cityOverviews.forEach((city, index) => {
    cityOverviews[index] = {
      ...city,
      cityName: city.cityName.replace(removeString, '').trim(),
    };
  });
  return cityOverviews;
};
