'use client';
import CodingBodyNew from './CodingBodyNew';
import { useRouter } from 'next/navigation';

export default function CodeEditorPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/student');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CodingBodyNew backToMainComponent={handleBack} />
    </div>
  );
}
