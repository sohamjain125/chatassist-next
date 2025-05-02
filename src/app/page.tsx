// src/app/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
}
