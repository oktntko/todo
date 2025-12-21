import type { FileRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { axios, saveAsFile } from '~/lib/axios';
import type { RouterOutput } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';

export function useFile() {
  const $dialog = useDialog();

  async function uploadSingleFile(file: File, params?: { todo_id?: string }) {
    const multipartFormData = new FormData();
    multipartFormData.append('file', file, encodeURIComponent(`${file.name}`));

    if (params?.todo_id) {
      multipartFormData.append('todo_id', params.todo_id);
    }

    const loading = $dialog.loading();
    return axios
      .post<RouterOutput['file']['delete']>('/api/file/upload/single', multipartFormData)
      .finally(loading.close);
  }

  async function uploadManyFiles(fileList: FileList | File[], params?: { todo_id?: string }) {
    const files = Array.from(fileList);

    const multipartFormData = new FormData();
    files.forEach((file) =>
      multipartFormData.append('files', file, encodeURIComponent(`${file.name}`)),
    );

    if (params?.todo_id) {
      multipartFormData.append('todo_id', params.todo_id);
    }

    const loading = $dialog.loading();
    return axios
      .post<RouterOutput['file']['deleteMany']>('/api/file/upload/many', multipartFormData)
      .finally(loading.close);
  }

  async function downloadSingleFile(params: { file_id: string }) {
    const loading = $dialog.loading();
    return axios
      .get(`/api/file/download/single/${params.file_id}`, {
        responseType: 'blob',
      })
      .then(saveAsFile)
      .finally(loading.close);
  }

  async function downloadManyFiles(params: z.infer<typeof FileRouterSchema.getManyInput>) {
    const loading = $dialog.loading();
    return axios
      .get('/api/file/download/many', {
        responseType: 'blob',
        params,
      })
      .then(saveAsFile)
      .finally(loading.close);
  }

  return {
    uploadSingleFile,
    uploadManyFiles,
    downloadSingleFile,
    downloadManyFiles,
  };
}
