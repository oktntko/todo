// main.ts
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { AxiosErrorMessageDialog } from "~/components/Dialog";
import { RouterView } from "~/routers";

export function AppRoot() {
  const { hasError, clearHasError, axiosError, clearAxiosError } = useAxiosErrorHandler();

  return (
    <>
      <RouterView />

      <AxiosErrorMessageDialog
        display={hasError}
        onClose={clearHasError}
        afterLeave={clearAxiosError}
        axiosError={axiosError}
      />
    </>
  );
}

// https://www.asobou.co.jp/blog/web/error-boundary
// https://zenn.dev/berlysia/articles/5dfa58f282aa14
// https://qiita.com/sosukesuzuki/items/5ef84f4776dc4c457bb6

const useAxiosErrorHandler = () => {
  const [hasError, setHasError] = useState(false);
  const [axiosError, setAxiosError] = useState<AxiosError<{ message: string }> | null>();

  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.promise.catch((error) => {
        if (axios.isAxiosError(error) && isApiError(error)) {
          setHasError(true);
          setAxiosError(error);
        } else {
          console.error(error);
        }
      });
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => window.removeEventListener("unhandledrejection", onUnhandledRejection);
  }, []);

  const clearHasError = () => {
    setHasError(false);
  };
  const clearAxiosError = () => {
    setAxiosError(null);
  };

  return {
    hasError,
    clearHasError,
    axiosError,
    clearAxiosError,
  };
};

const isApiError = (error: AxiosError): error is AxiosError<{ message: string }> => {
  return (
    error?.response?.data != null &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  );
};
