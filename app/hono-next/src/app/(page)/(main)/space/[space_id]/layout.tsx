import { MainLayout } from '@/(main)/space/component/MainLayout/MainLayout';

type Props = {
  children: React.ReactNode;
  params: Promise<{ space_id: string }>;
};

export default async function Layout({ children, params }: Props) {
  const { space_id } = await params;

  return <MainLayout space_id={space_id}>{children}</MainLayout>;
}
