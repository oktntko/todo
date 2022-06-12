import { useEffect, useState } from "react";
import { AiFillFileImage } from "react-icons/ai";

export type ProjectIconType = {
  project_id?: number;
  className?: string;
};

export function ProjectIcon(props: ProjectIconType) {
  const [hasLoadError, setHasLoadError] = useState(false);
  useEffect(() => {
    setHasLoadError(false);
  }, [props.project_id]);

  return !props.project_id || hasLoadError ? (
    <div
      className={`flex h-12 w-12 items-center justify-center
    bg-slate-200 transition-colors duration-300 hover:bg-slate-400
      ${props.className}`}
    >
      <AiFillFileImage className="h-2/3 w-2/3" />
    </div>
  ) : (
    <img
      src={`/files/projects/icon/${props.project_id}`}
      className={`h-12 w-12 ${props.className}`}
      onError={() => setHasLoadError(true)}
    />
  );
}
