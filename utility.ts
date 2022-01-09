const sleep = (o_o: number): Promise<void> =>
  new Promise((O_O) => setTimeout(O_O, Math.ceil(o_o)));

const shake = (base: number, rangePercentage: number): number => {
  const n = base * rangePercentage;
  return base + Math.floor(Math.random() * n * 2 + 1) - n;
};

export const wait = async (ms: number): Promise<void> => {
  const o_o = shake(ms, 0.1);
  console.info(`Waiting ${o_o} ms`);
  await sleep(o_o);
};

export const convertToCSV = (obj: any) => {
  const array = typeof obj != 'object' ? JSON.parse(obj) : obj;
  let str = '';

  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line != '') line += ',';

      line += array[i][index];
    }
    str += line + '\r\n';
  }

  return str;
};

export const trimName = (x: string) => x.split(/[\s']/).join('-');
