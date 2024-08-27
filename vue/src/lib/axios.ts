import AxiosStatic from 'axios';

export const axios = AxiosStatic.create({ timeout: 5000 });

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

export async function uploadSingleFile(file: File) {
  const multipartFormData = new FormData();
  multipartFormData.append('file', file, encodeURIComponent(`${file.name}`));
  return axios.post<{ file_id: string }>('/api/file/upload/single', multipartFormData);
}

export async function uploadArrayFiles(fileList: FileList | File[]) {
  const files = Array.from(fileList);

  const multipartFormData = new FormData();
  files.forEach((file) =>
    multipartFormData.append('files', file, encodeURIComponent(`${file.name}`)),
  );
  return axios.post<{ file_id: string }[]>('/api/file/upload/array', multipartFormData);
}
