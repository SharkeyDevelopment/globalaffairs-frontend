import { useState } from 'react';
import { Menu, MessageSquare, FolderOpen, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { User } from '@/types';

type PageKey = 'ask' | 'documents';

interface SidebarProps {
  user: User;
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
  onSignOut: () => void;
}

const NAV_ITEMS: { label: string; icon: typeof MessageSquare; key: PageKey }[] = [
  { label: 'Ask a Question', icon: MessageSquare, key: 'ask' },
  { label: 'Documents', icon: FolderOpen, key: 'documents' },
];

export function Sidebar({ user, activePage, setActivePage, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <aside
      className="flex h-screen flex-col border-r border-border bg-sidebar transition-[width] duration-200"
      style={{ width: collapsed ? 56 : 240 }}
    >
      {/* Header */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground truncate">
            GA Intel Hub
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4">
        {!collapsed && (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Policy Tools
          </p>
        )}
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key;
            const btn = (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );

            if (collapsed) {
              return (
                <li key={item.key}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.key}>{btn}</li>;
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-3">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 text-muted-foreground"
            onClick={onSignOut}
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </Button>
        )}
      </div>
    </aside>
  );
}
