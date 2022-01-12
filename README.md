# city-data-crawler
Tool for aggregating REI data from city-data.com

`git clone https://github.com/SamPetering/city-data-crawler.git` 

`cd city-data-crawler`

`yarn`

configuration:
- uncomment the states you want to crawl in `states.ts`
- set the `POPULATION_LIMIT` constant in `index.ts` to whatever your personal threshold is

`yarn dev`

once the script has finished the results will be written to `./results/`
