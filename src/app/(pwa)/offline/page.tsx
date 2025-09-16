import { OFFLINE_MESSAGE } from '@/lib/constants';

export default function OfflinePage() {
  return (
    <main className="flex h-screen items-center justify-center bg-black text-white">
      <p>{OFFLINE_MESSAGE}</p>
    </main>
  );
}
