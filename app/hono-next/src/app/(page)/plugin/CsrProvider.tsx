import DialogProvider from './DialogProvider';
import { ErrorHandlerProvider } from './ErrorHandlerProvider';
import ToastProvider from './ToastProvider';

type Props = {
  children: React.ReactNode;
};

export function CsrProvider({ children }: Props) {
  return (
    <DialogProvider>
      <ToastProvider>
        <ErrorHandlerProvider>{children}</ErrorHandlerProvider>
      </ToastProvider>
    </DialogProvider>
  );
}
