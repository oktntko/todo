import type { ReactHTML } from "react";

export type TooltipProps = {
  children: React.ReactNode;
  message: string;
  as?: keyof ReactHTML;
};

export function Tooltip({
  children,
  message,
  className,
  as = "div",
}: TooltipProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const RootElement = as;
  return (
    <RootElement className={`group relative inline-flex items-center uppercase ${className ?? ""}`}>
      <>{children}</>
      <div
        className={`absolute bottom-4 left-1/2 !z-10 hidden translate-x-[-50%] translate-y-[-50%] flex-col items-center group-hover:flex`}
      >
        <div className={`truncate rounded-md bg-black p-2 text-xs text-white shadow-lg`}>
          {message}
        </div>
        <div className="-mt-2 h-3 w-3 rotate-45 bg-black"></div>
      </div>
    </RootElement>
  );
}
