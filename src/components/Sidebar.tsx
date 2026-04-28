import React from 'react';
import { LayoutDashboard, CreditCard, ShieldCheck, LogOut, User, X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentPage: 'dashboard' | 'plans' | 'admin' | 'profile';
  setPage: (page: 'dashboard' | 'plans' | 'admin' | 'profile') => void;
  isAdmin?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ currentPage, setPage, isAdmin, isOpen, onClose }: SidebarProps) {
  const navigate = (page: any) => {
    setPage(page);
    onClose();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg tracking-tighter">IG</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-black">Iron & Grit</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Athletics</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-zinc-400 hover:text-black">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-grow space-y-2">
        <button 
          onClick={() => navigate('dashboard')}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
            currentPage === 'dashboard' ? 'bg-black text-white shadow-xl shadow-black/10' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-sm font-medium">Dashboard</span>
        </button>

        <button 
          onClick={() => navigate('profile')}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
            currentPage === 'profile' ? 'bg-black text-white shadow-xl shadow-black/10' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-sm font-medium">My Bio</span>
        </button>

        <button 
          onClick={() => navigate('plans')}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
            currentPage === 'plans' ? 'bg-black text-white shadow-xl shadow-black/10' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-sm font-medium">Plans</span>
        </button>

        {isAdmin && (
          <button 
            onClick={() => navigate('admin')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
              currentPage === 'admin' ? 'bg-black text-white shadow-xl shadow-black/10' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">Admin Panel</span>
          </button>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-zinc-100">
        <button 
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-zinc-100 p-6 z-50 hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-72 bg-white p-6 z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
