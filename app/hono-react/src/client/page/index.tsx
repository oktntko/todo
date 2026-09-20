import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: function Page() {
    return (
      <div>
        <div>index</div>
      </div>
    );
  },
});
