import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { UserProfile, TrainingVideo } from '../types';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  Cpu, 
  Play, 
  ArrowRight, 
  X,
  Dumbbell,
  Zap,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { formatDate, getTimeRemaining } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard({ profile }: { profile: UserProfile }) {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);
  const [timeLeft, setTimeLeft] = useState(
    profile.membershipExpiry ? getTimeRemaining(profile.membershipExpiry) : null
  );

  useEffect(() => {
    const q = query(collection(db, 'training_videos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setVideos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingVideo)));
    }, (err) => console.error("Dashboard Videos Sync Error:", err));

    const timer = setInterval(() => {
      if (profile.membershipExpiry) {
        setTimeLeft(getTimeRemaining(profile.membershipExpiry));
      }
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [profile.membershipExpiry]);

  const isActive = profile.membershipStatus === 'active' && (timeLeft?.total || 0) > 0;

  return (
    <div className="space-y-12 animate-in max-w-6xl">
      {/* ── Membership Status Section ────────────────── */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ATM Card - Main Balance */}
        <div 
          className={`relative xl:col-span-2 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden transition-all duration-700 ${
            isActive ? 'bg-zinc-950 text-white shadow-black/20' : 'bg-white text-zinc-400 border border-zinc-100'
          }`}
          style={{ aspectRatio: '1.7 / 1' }}
        >
          {/* Decorative background elements */}
          {isActive && (
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          )}
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold opacity-40 mb-2">
                  {profile.membershipType || 'Elite Access'}
                </p>
                <h3 className="text-3xl md:text-4xl font-light tracking-tight leading-none">Iron & Grit</h3>
              </div>
              {isActive && <Cpu className="w-9 h-9 text-zinc-700" />}
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold opacity-40 mb-2">Membership</p>
                <p className={`text-4xl md:text-5xl font-light tracking-tighter ${isActive ? 'text-white' : 'text-zinc-200'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              
              <div className="flex justify-between items-end border-t border-black/5 pt-6">
                <div>
                  <p className="text-[10px] font-bold opacity-40 mb-1">Member Name</p>
                  <p className="text-sm md:text-base font-medium tracking-wide">{profile.displayName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold opacity-40 mb-1">Valid Thru</p>
                  <p className="text-sm md:text-base font-medium font-mono">
                    {profile.membershipExpiry ? new Date(profile.membershipExpiry).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : '-- / --'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <ShieldCheck className={`absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] pointer-events-none ${isActive ? 'text-white' : 'text-black'}`} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-4 text-zinc-400 mb-4">
              <Clock className="w-6 h-6" />
              <span className="text-[10px] font-bold">Time Remaining</span>
            </div>
            <div>
              <p className="text-3xl font-light tracking-tight text-black">
                {isActive && timeLeft ? `${timeLeft.days}d ${timeLeft.hours}h` : 'No active plan'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Remaining access time</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-4 text-zinc-400 mb-4">
              <Calendar className="w-6 h-6" />
              <span className="text-[10px] font-bold">Expires On</span>
            </div>
            <div>
              <p className="text-3xl font-light tracking-tight text-black">
                {profile.membershipExpiry ? formatDate(profile.membershipExpiry) : '— — — —'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Renewal date</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Training Library Section ─────────────────── */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-zinc-100 pb-6">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-black">Training Library</h2>
            <p className="text-sm text-zinc-500 mt-1 font-normal">Expert-led sessions and performance tips.</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-black transition-colors group">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-zinc-100 border-dashed">
            <Zap className="w-10 h-10 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-400 text-sm">No training content published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div 
                key={video.id} 
                onClick={() => setSelectedVideo(video)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-zinc-200 border border-zinc-100 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
                  <img 
                    src={video.thumbnail} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    alt={video.title} 
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
                      <Play className="w-6 h-6 text-black fill-black ml-1" />
                    </div>
                  </div>
                  <span className="absolute top-5 left-5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm">
                    {video.category}
                  </span>
                </div>
                <h4 className="font-medium text-zinc-900 mb-1 group-hover:text-black transition-colors">{video.title}</h4>
                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="text-[10px] font-bold flex items-center gap-1.5">
                    <Activity className="w-3 h-3" /> Technical
                  </span>
                  <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                  <span className="text-[10px] font-bold">Free Access</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Video Modal Player ─────────────────────── */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 backdrop-blur-md bg-black/20"
              onClick={() => setSelectedVideo(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl z-10"
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              <iframe 
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
