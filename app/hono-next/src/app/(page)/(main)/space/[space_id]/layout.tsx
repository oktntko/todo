import { MainLayout } from '@/(main)/space/component/MainLayout/MainLayout';

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Props) {
  return <MainLayout>{children}</MainLayout>;
}
