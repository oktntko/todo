export default function MyLoading() {
  return (
    <div class="flex min-h-full grow flex-col items-center justify-center">
      <span class="icon-[eos-icons--bubble-loading] text-opacity-60 h-16 w-16 text-gray-600"></span>
      <span class="sr-only">Loading...</span>
      <input
        autofocus
        name="loading"
        class="h-0 w-0 border-none bg-transparent caret-transparent outline-hidden"
      />
    </div>
  );
}
