import { redirect } from 'next/navigation';

import { findOperatorFromTokenSSR } from '~/middleware/auth';

import { AuthProvider } from '../plugin/AuthProvider';
import { CsrProvider } from '../plugin/CsrProvider';

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Props) {
  const operator = await findOperatorFromTokenSSR();
  if (operator == null) {
    return redirect('/signin');
  }

  return (
    <CsrProvider>
      <AuthProvider operator={operator}>{children}</AuthProvider>
    </CsrProvider>
  );
}
