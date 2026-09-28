import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_main/space/$space_id/')({
  component: function Page() {
    return <div>dashboard</div>;
  },
});
