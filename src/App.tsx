import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { getRedirectResult } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MembershipPlans from './components/MembershipPlans';
import AdminPanel from './components/AdminPanel';
import ProfilePanel from './components/ProfilePanel';
import { UserProfile } from './types';
import { Bell, User as UserIcon, ArrowRight, X, User, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Designated Admin Emails
const ADMIN_EMAILS = ['josephakpansunday@gmail.com', 'columnwallet@gmail.com'];

function App() {
  const [user, loading] = useAuthState(auth);
  const [signInError, setSignInError] = useState<'popup-blocked' | 'unknown' | null>(null);

  // Handle the redirect result when the user returns from Google sign-in
  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      // auth/internal-error fires when there's no pending redirect (normal for popup sign-in)
      // auth/cancelled-popup-request and auth/popup-blocked are also harmless here
      const silenced = ['auth/internal-error', 'auth/cancelled-popup-request', 'auth/popup-blocked'];
      if (!silenced.includes(error.code)) {
        console.error('Redirect sign-in error:', error);
      }
    });
  }, []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'plans' | 'admin' | 'profile'>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to Iron & Grit Athletics!', time: 'Just now', unread: true, link: null },
    { id: 2, text: 'Complete your profile to get personalized tips.', time: '2h ago', unread: true, link: 'profile' },
  ]);

  const isAdmin = profile?.role === 'admin' || (user?.email && ADMIN_EMAILS.includes(user.email));
  const unreadCount = notifications.filter(n => n.unread).length;

  // Navigation Guard: Prevent non-admins from staying on the admin page
  useEffect(() => {
    if (currentPage === 'admin' && !isAdmin && !loading) {
      setCurrentPage('dashboard');
    }
  }, [currentPage, isAdmin, loading]);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    const userRef = doc(db, 'users', user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        
        // Auto-fix for existing admins: If email is in master list but role isn't 'admin'
        if (user.email && ADMIN_EMAILS.includes(user.email) && data.role !== 'admin') {
          updateDoc(userRef, { role: 'admin' });
        }

        // Auto-sync PFP: If google has a photo but firestore is empty
        if (user.photoURL && !data.photoURL) {
          updateDoc(userRef, { photoURL: user.photoURL });
        }
      } else {
        const isDefaultAdmin = user.email && ADMIN_EMAILS.includes(user.email);
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          membershipStatus: 'none',
          role: isDefaultAdmin ? 'admin' : 'user',
          membershipType: null,
          membershipExpiry: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDoc(userRef, newProfile, { merge: true });
        setProfile(newProfile);
      }
    }, (error) => {
      console.error("Profile sync error:", error);
    });
    return () => unsub();
  }, [user]);

  const handlePaymentSuccess = () => {
    setCurrentPage('dashboard');
    setShowNotifications(true);
    setNotifications([
      { id: 3, text: 'Payment successful! Your membership is now active.', time: 'Just now', unread: true, link: null },
      ...notifications
    ]);
  };

  const handleNotificationClick = (link: any) => {
    if (link) setCurrentPage(link);
    setShowNotifications(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-zinc-200 border-t-black rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-zinc-100 text-center"
        >
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-white font-bold text-xl">IG</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 mb-2">Iron &amp; Grit</h1>
          <p className="text-zinc-500 mb-10 text-sm">Sign in to access your dashboard and training materials.</p>

          {signInError === 'popup-blocked' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
              <p className="text-sm font-semibold text-amber-800 mb-1">Popup blocked by browser</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Your browser blocked the sign-in popup. Please click the <strong>popup blocked</strong> icon in your address bar and select <strong>"Always allow popups from this site"</strong>, then try again.
              </p>
            </div>
          )}
          {signInError === 'unknown' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-left">
              <p className="text-sm font-semibold text-red-800 mb-1">Sign-in failed</p>
              <p className="text-xs text-red-700">Something went wrong. Please try again.</p>
            </div>
          )}

          <button 
            onClick={async () => {
              setSignInError(null);
              const result = await signInWithGoogle();
              if (result?.error) setSignInError(result.error);
            }}
            className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 text-black py-4 rounded-2xl font-medium hover:bg-zinc-50 transition-all shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Authenticated App ──────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 text-black flex font-sans">
      <Sidebar 
        currentPage={currentPage} 
        setPage={setCurrentPage} 
        isAdmin={isAdmin} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-grow lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-40 bg-zinc-50/80 backdrop-blur-md px-6 py-6 flex items-center justify-between border-b border-zinc-100 lg:border-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-white border border-zinc-100 text-zinc-400 rounded-2xl shadow-sm hover:text-black transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hidden sm:block">{currentPage}</p>
              <h1 className="text-lg font-medium leading-tight">
                {currentPage === 'dashboard' ? 'My Dashboard' : 
                 currentPage === 'admin' ? 'Administration' : 
                 currentPage === 'profile' ? 'My Bio' : 'Membership Plans'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-3 rounded-2xl transition-all ${showNotifications ? 'bg-black text-white shadow-lg' : 'bg-white border border-zinc-100 text-zinc-400 hover:text-black shadow-sm'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-zinc-50 rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowNotifications(false)}
                      className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    />

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10, x: 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="fixed inset-x-4 top-24 md:absolute md:inset-auto md:right-0 md:top-16 w-auto md:w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-zinc-50 flex items-center justify-between">
                        <p className="text-xs font-bold text-zinc-900">Notifications</p>
                        <button onClick={() => setShowNotifications(false)} className="md:hidden text-zinc-400 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n.link)}
                            className={`p-5 border-b border-zinc-50 last:border-none hover:bg-zinc-50 transition-colors cursor-pointer group`}
                          >
                            <p className="text-sm font-medium text-zinc-800 leading-snug group-hover:text-black transition-colors">{n.text}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-[10px] text-zinc-400">{n.time}</p>
                              {n.link && <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div 
              onClick={() => setCurrentPage('profile')}
              className="flex items-center gap-3 bg-white border border-zinc-100 p-1.5 pr-4 rounded-2xl shadow-sm cursor-pointer hover:border-zinc-300 transition-all flex"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-zinc-50">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center hidden sm:flex">
                <p className="text-[10px] font-bold text-black leading-none">{profile?.displayName}</p>
                <p className="text-[8px] text-zinc-400 mt-0.5 leading-none">{profile?.email}</p>
                <p className="text-[8px] text-zinc-500 mt-1 font-bold underline decoration-zinc-200">Bio</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10">
          {currentPage === 'dashboard' && profile && (
            <Dashboard profile={profile} />
          )}
          {currentPage === 'plans' && (
            <MembershipPlans userId={user.uid} userEmail={user.email || ''} onPaymentSuccess={handlePaymentSuccess} />
          )}
          {currentPage === 'admin' && isAdmin && (
            <AdminPanel />
          )}
          {currentPage === 'profile' && profile && (
            <ProfilePanel profile={profile} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
