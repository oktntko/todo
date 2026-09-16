import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import { MyLoading } from '~/component/MyLoading';
import { useParams } from '~/router';
import { useAichatStore } from '~/store/AichatStore';
import { useGroupStore } from '~/store/GroupStore';

export default function Layout() {
  const $params = useParams('/space/:space_id');

  const { fetchGroup } = useGroupStore();
  const { fetchAichat } = useAichatStore();

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      try {
        await Promise.all([
          fetchGroup({ space_id: $params.space_id }),
          fetchAichat({ space_id: $params.space_id }),
        ]);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="h-full">{loading ? <MyLoading /> : <Outlet />}</div>;
}
