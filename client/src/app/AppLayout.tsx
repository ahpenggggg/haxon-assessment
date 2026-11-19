import { NavLink, Outlet } from 'react-router';
import { useLogout, useSession } from '../features/auth/authQueries';
import { ErrorAlert } from '../shared/ui/Alert';
import { ROUTES } from './routes';

const NAV_ITEMS = [
  { to: ROUTES.map, label: 'Map' },
  { to: ROUTES.upload, label: 'Upload' },
] as const;

const NAV_ITEM_CLASS = 'flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors';
const NAV_ITEM_INACTIVE_CLASS = 'text-sidebar-text hover:bg-white/10 hover:text-white';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return `${NAV_ITEM_CLASS} ${isActive ? 'bg-primary text-white' : NAV_ITEM_INACTIVE_CLASS}`;
}

function Sidebar() {
  const session = useSession();
  const logout = useLogout();

  return (
    <aside className="flex shrink-0 flex-col gap-4 bg-sidebar p-4 md:w-60">
      <p className="px-3 text-lg font-bold text-white">Location Manager</p>
      <nav aria-label="Main" className="flex gap-1 md:flex-col">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex flex-col gap-2 md:mt-auto">
        {session.data && <p className="truncate px-3 text-xs text-sidebar-text">{session.data.email}</p>}
        {logout.error && <ErrorAlert>{logout.error.message}</ErrorAlert>}
        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className={`${NAV_ITEM_CLASS} ${NAV_ITEM_INACTIVE_CLASS} disabled:opacity-60`}
        >
          {logout.isPending ? 'Logging out…' : 'Log out'}
        </button>
      </div>
    </aside>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col md:h-screen md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:overflow-auto md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
