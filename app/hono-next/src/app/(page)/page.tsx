'use client';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

export default function Home() {
  const [message, setMessage] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/hello');
      const { message } = await res.json();
      setMessage(message);
    };
    fetchData();
  }, []);

  if (!message)
    return (
      <main
        className={cn(
          'flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white',
        )}
      >
        <h1 className="text-4xl font-bold text-blue-400">Tailwind CSS v4 導入完了！</h1>
      </main>
    );

  return <p className="font-bold">{message}</p>;
}
