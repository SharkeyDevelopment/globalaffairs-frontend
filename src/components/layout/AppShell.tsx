import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AskQuestion } from '@/components/pages/AskQuestion';
import { Documents } from '@/components/pages/Documents';
import type { User } from '@/types';

type PageKey = 'ask' | 'documents';

interface AppShellProps {
  user: User;
  onSignOut: () => void;
}

export function AppShell({ user, onSignOut }: AppShellProps) {
  const [activePage, setActivePage] = useState<PageKey>('ask');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        user={user}
        activePage={activePage}
        setActivePage={setActivePage}
        onSignOut={onSignOut}
      />
      <main className="flex-1 overflow-hidden">
        {activePage === 'ask' && <AskQuestion />}
        {activePage === 'documents' && <Documents />}
      </main>
    </div>
  );
}
