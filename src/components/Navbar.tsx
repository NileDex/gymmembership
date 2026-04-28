import { auth, signInWithGoogle, logout } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogOut, User as UserIcon, LayoutDashboard, Ticket } from 'lucide-react';

interface NavbarProps {
  currentPage: 'dashboard' | 'plans';
  setPage: (page: 'dashboard' | 'plans') => void;
}

export default function Navbar({ currentPage, setPage }: NavbarProps) {
  const [user] = useAuthState(auth);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-black/5 px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('dashboard')}>
          <div className="w-7 h-7 bg-black flex items-center justify-center font-bold text-white text-[10px]">
            IG
          </div>
          <span className="font-bold text-[13px] tracking-tight text-black uppercase hidden sm:block">
            Iron & Grit
          </span>
        </div>

        {user && (
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setPage('dashboard')}
              className={`text-[10px] uppercase font-bold tracking-[0.15em] transition-all flex items-center gap-2 ${
                currentPage === 'dashboard' ? 'text-black opacity-100' : 'text-black/40 hover:opacity-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setPage('plans')}
              className={`text-[10px] uppercase font-bold tracking-[0.15em] transition-all flex items-center gap-2 ${
                currentPage === 'plans' ? 'text-black opacity-100' : 'text-black/40 hover:opacity-100'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              Memberships
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-1.5 border border-black/5 bg-zinc-50 rounded-none">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-4 h-4 rounded-full grayscale" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-black/40" />
              )}
              <span className="text-[10px] font-bold text-black/60 hidden sm:block uppercase tracking-wider">
                {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-black/5 rounded-none transition-colors text-black/40 hover:text-black"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="bg-black text-white px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-zinc-800"
          >
            Access Portal
          </button>
        )}
      </div>
    </nav>
  );
}
