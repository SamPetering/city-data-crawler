# city-data-crawler
Tool for aggregating REI data from city-data.com

`git clone https://github.com/SamPetering/city-data-crawler.git` to clone the repository

`cd city-data-crawler` to enter the directory

`yarn` to install dependencies

configuration:
- uncomment the states you want to crawl in `states.ts`
- set the `POPULATION_LIMIT` constant in `index.ts` to whatever your personal threshold is
- save changes

`yarn dev` to run

`ctrl+c` on the script has completed

the results will be written to `./results/`
