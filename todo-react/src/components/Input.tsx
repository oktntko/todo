import { useEffect, useState } from "react";
import { AiFillFileImage } from "react-icons/ai";

export type UploadInputProps = {
  htmlId: string;
  dataId: string | number;
  name: string;
  value: File | null;
  onChange: (e: { target: { name: string; value: File | null } }) => void;
  previewClassName?: string;
};

export function ImageInput(props: UploadInputProps) {
  const [preview, setPreview] = useState("");
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    setHasLoadError(false);
    if (props.value) {
      setPreview(window.URL.createObjectURL(props.value));
    } else {
      setPreview("");
    }
  }, [props.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      const file = e.currentTarget.files[0];
      props.onChange({ target: { name: props.name, value: file } });
    } else {
      props.onChange({ target: { name: props.name, value: null } });
    }
  };

  return (
    <label htmlFor={props.htmlId} className="flex cursor-pointer items-center space-x-2">
      {preview ? (
        <img src={preview} className={`h-12 w-12 ${props.previewClassName}`} />
      ) : hasLoadError || typeof props.dataId === "string" ? (
        <div
          className={`flex h-12 w-12 items-center justify-center
          bg-slate-200 transition-colors duration-300 hover:bg-slate-400
            ${props.previewClassName}`}
        >
          <AiFillFileImage className="h-2/3 w-2/3" />
        </div>
      ) : (
        <img
          src={`/files/projects/icon/${props.dataId}`}
          className={`h-12 w-12 ${props.previewClassName}`}
          onError={() => setHasLoadError(true)}
        />
      )}
      {/* インプット(非表示) */}
      <input
        id={props.htmlId}
        type="file"
        onChange={handleChange}
        className={"hidden"}
        accept="image/*"
      />
    </label>
  );
}
