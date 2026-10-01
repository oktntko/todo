import { MainLayout } from './component/MainLayout/MainLayout';
import { SpacePage } from './component/SpacePage';

export default async function Page() {
  return (
    <MainLayout>
      <SpacePage />
    </MainLayout>
  );
}
