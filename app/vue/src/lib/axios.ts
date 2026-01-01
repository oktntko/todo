import AxiosStatic, { type AxiosResponse } from 'axios';

export const axios = AxiosStatic.create({ timeout: 5000, baseURL: import.meta.env.BASE_URL });

axios.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf-token='))
    ?.split('=')[1];

  config.headers['x-csrf-token'] = token ?? undefined;

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // responseType: "blob" でリクエストするとデータが Blob になるため、JSONにパースする
    if (error.request.responseType == 'blob') {
      error.response.data = await blobToJson(error.response.data);
    }

    return Promise.reject(error);
  },
);

export async function saveAsFile(response: AxiosResponse) {
  const headerFilename = response.headers['content-disposition'].split('filename=')[1];
  const filename = decodeURI(headerFilename).replace(/\+/g, ' ');

  const href = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = href;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(href);
}

async function blobToJson(blob: Blob): Promise<unknown> {
  // typeof blob => object
  const fileReader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    fileReader.onerror = () => {
      fileReader.abort();
      reject();
    };

    fileReader.onload = () => {
      resolve(fileReader.result as string);
    };

    fileReader.readAsText(blob);
  })
    .then((data) => JSON.parse(data))
    .catch(console.error);
}
