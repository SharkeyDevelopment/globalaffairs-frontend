import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LandingPage } from '@/components/pages/LandingPage';
import { AppShell } from '@/components/layout/AppShell';
import type { User } from '@/types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  if (!user) {
    return <LandingPage onLogin={setUser} />;
  }

  return (
    <TooltipProvider>
      <AppShell user={user} onSignOut={() => setUser(null)} />
    </TooltipProvider>
  );
}

export default App;
