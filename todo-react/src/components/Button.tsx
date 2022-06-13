export const ColorSet = {
  none: "",
  white: "bg-white text-gray-800 hover:bg-slate-200",
  blue: "bg-blue-500 text-slate-100 hover:bg-blue-600",
  green: "bg-green-500 text-slate-100 hover:bg-green-600",
  yellow: "bg-yellow-400 text-gray-800 hover:bg-yellow-600",
  disabled: "bg-gray-300 text-gray-100",
} as const;

export type ButtonProps = {
  colorset?: keyof typeof ColorSet;
};

export function Button(
  props: ButtonProps &
    React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={`${"inline-flex items-center rounded-lg border border-gray-200 p-1 transition-colors duration-300 "}

      ${props.disabled ? "cursor-not-allowed" : ""}
      ${ColorSet[props.disabled ? "disabled" : props.colorset ?? "none"]}
      ${props.className ?? ""}`}
    >
      {props.children}
    </button>
  );
}
