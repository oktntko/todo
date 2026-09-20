import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_main/space/$space_id/list')({
  component: function Page() {
    return <div>list</div>;
  },
});
