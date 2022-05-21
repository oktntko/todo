/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse } from "axios";

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // responseType: "blob" でリクエストするとデータが Blob になるため、JSONにパースする
    if (error.request.responseType == "blob") {
      error.response.data = await blobToJson(error.response.data);
    }

    return Promise.reject(error.response);
  }
);

export default axios;

export const saveAsFile = (response: AxiosResponse<any>) => {
  const headerFilename = response.headers["content-disposition"].split("filename=")[1];
  const filename = decodeURI(headerFilename).replace(/\+/g, " ");

  const blob = new Blob([response.data], {
    type: response.data.type,
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename); //or any other extension
  document.body.appendChild(link);
  link.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

const blobToJson = async (blob: Blob): Promise<any> => {
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
    .catch(console.log);
};
