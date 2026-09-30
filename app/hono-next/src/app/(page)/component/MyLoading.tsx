export function MyLoading() {
  return (
    <div className="flex min-h-full grow flex-col items-center justify-center">
      <span className="icon-[eos-icons--bubble-loading] text-opacity-60 h-16 w-16 text-gray-600"></span>
      <span className="sr-only">Loading...</span>
      <input
        autoFocus
        name="loading"
        className="h-0 w-0 border-none bg-transparent caret-transparent outline-hidden"
      />
    </div>
  );
}
