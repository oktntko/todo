import { useState } from 'react';

import { cn } from '@/lib/cn';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  multiple?: boolean;
};

// defineEmits<{
//   done: [File[]];
// }>();

export function MyModalInputFile({ multiple, className, ...props }: InputProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="rounded-lg bg-white p-8 text-gray-900 shadow-xl">
      <div
        className="flex min-w-lg flex-col items-center justify-center"
        onDragEnter={() => setDragging(true)}
        onDragLeave={(e) => {
          // 子要素へ dragenter すると自身の dragleave が発火するため、子要素かどうか判定する
          // https://qiita.com/keiliving/items/5e8b26e6567efbc15765
          if (e.relatedTarget && e.currentTarget) {
            const currentTarget = e.currentTarget as Node;
            const relatedTarget = e.relatedTarget as Node;
            if (currentTarget.contains(relatedTarget)) {
              return;
            }
          }

          setDragging(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          // $emit('done', Array.from(e.dataTransfer?.files ?? []));
        }}
      >
        <label
          className={cn(
            'flex h-64 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 px-8 transition-colors hover:bg-gray-200',
            dragging ? 'border-gray-500 bg-gray-200' : '',
          )}
        >
          <span className="icon-[material-symbols--upload-file] h-12 w-12"> </span>
          <span className="font-semibold">Drag and drop the file, </span>
          <span className="text-xs">or click to select the file.</span>
          <input
            type="file"
            className={cn('hidden', className)}
            multiple={multiple}
            onChange={(e) => {
              // $emit('done', Array.from((e.target as HTMLInputElement)?.files ?? []));
            }}
            {...props}
          />
        </label>
      </div>
    </div>
  );
}
