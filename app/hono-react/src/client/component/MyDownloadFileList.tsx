import { cn } from '~/lib/cn';
import { saveAsFile } from '~/lib/file';
import { hasMessage, hono, HonoError } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';

// defineEmits<{
//   deleted: [number];
// }>();

export function MyDownloadFileList({ fileList }: { fileList: DownloadFile[] }) {
  const $dialog = useDialog();
  const $toast = useToast();

  async function downloadSingleFile(params: { file_id: string }) {
    const loading = $dialog.loading();
    try {
      const res = await hono.file.download.single[':file_id'].$get({ param: params });
      if (res.ok) {
        return saveAsFile(await res.blob(), res.headers.get('content-disposition'));
      }

      const status = res.status;
      const error = await res.json();
      if (hasMessage(error)) {
        throw new HonoError(error.message, status);
      } else {
        throw new HonoError('An internal server error occurred.', status);
      }
    } finally {
      loading.close();
    }
  }

  return (
    <ul
      className={cn('flex flex-wrap', 'flex-col gap-1 lg:flex-row lg:gap-2')}
      onClick={(e) => e.stopPropagation()}
    >
      {fileList.map((file) => (
        <li key={file.file_id} className="inline-flex flex-row items-center gap-0.5 text-sm">
          <button
            type="button"
            className="inline-flex flex-row items-center gap-0.5 text-blue-600 transition-colors hover:text-blue-800 hover:underline"
            onClick={() => downloadSingleFile({ file_id: file.file_id })}
          >
            <span className="icon-[simple-line-icons--cloud-download]"></span>
            <span>{file.filename}</span>
          </button>

          <button
            type="button"
            aria-label="close"
            className="peer inline-flex flex-row items-center rounded-full p-0.5 text-gray-900 transition-colors hover:bg-gray-300"
            onClick={async () => {
              await $dialog.confirm.warn(`Do you really want to delete this file?
'${file.filename}'`);

              const loading = $dialog.loading();
              try {
                await hono.file.delete.$post({ json: file });

                // modelValueFileList = modelValueFileList.filter((x) => x.file_id !== file.file_id);

                // $emit('deleted', i);
                $toast.success('Data has been deleted.');
              } finally {
                loading.close();
              }
            }}
          >
            <span className="icon-[bi--x] h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
