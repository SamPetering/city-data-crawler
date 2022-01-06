import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { City } from './types';
const BASE_URL = 'https://www.city-data.com/';

export const getCity = async (city: string, state: string) => {
  try {
    const config: AxiosRequestConfig = {
      baseURL: BASE_URL,
      url: `city/${city}-${state}.html`,
      method: 'GET',
    };
    const response = await axios.request(config);
    return response;
  } catch (e: any) {
    console.log('caught error');
    console.log(e.message);
    console.log(e.config);
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
    console.log('caught error');
    console.log(e.message);
    console.log(e.config);
  }
};
