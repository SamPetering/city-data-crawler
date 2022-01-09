import axios, { AxiosRequestConfig } from 'axios';
const BASE_URL = 'https://www.city-data.com/';

export const getCity = async (city: string, state: string, href: string) => {
  const config: AxiosRequestConfig = {
    baseURL: BASE_URL,
    url: `city/${city}-${state}.html`,
    method: 'GET',
  };
  try {
    const response = await axios.request(config);
    return response;
  } catch (e: any) {
    // if 404 try again with href
    if (e.response?.status === 404) {
      const altConfig = { ...config, url: `city/${href}` };
      console.info('caught 404, retrying with alt config');
      console.info(altConfig);
      try {
        const respone = await axios.request(altConfig);
        console.info('success with alt config');
        return respone;
      } catch (e) {
        console.error('failed after trying with new config');
        throw e;
      }
    }
    console.error('caught error');
    console.error(e.message);
    console.error(e.config);
  }
};

export const getCities = async (state: string) => {
  try {
    const config: AxiosRequestConfig = {
      baseURL: BASE_URL,
      url: `city/${state}.html`,
      method: 'GET',
    };
    const response = await axios.request(config);
    return response;
  } catch (e: any) {
    console.error('caught error');
    console.error(e.message);
    console.error(e.config);
  }
};
