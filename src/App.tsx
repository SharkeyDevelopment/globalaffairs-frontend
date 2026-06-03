import { useState, useCallback } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LandingPage } from '@/components/pages/LandingPage';
import { AppShell } from '@/components/layout/AppShell';
import type { User } from '@/types';

function getStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const handleLogin = useCallback((u: User) => {
    sessionStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  }, []);

  const handleSignOut = useCallback(() => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('activePage');
    setUser(null);
  }, []);

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <TooltipProvider>
      <AppShell user={user} onSignOut={handleSignOut} />
    </TooltipProvider>
  );
}

export default App;
