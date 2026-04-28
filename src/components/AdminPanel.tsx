import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { UserProfile, TrainingVideo } from '../types';
import { Users, CreditCard, ShieldCheck, Search, ShieldAlert, Video, Plus, Trash2, ExternalLink, LayoutDashboard, X } from 'lucide-react';
import { formatDate, getYouTubeId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'members' | 'training'>('members');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Video Form State
  const [newVideo, setNewVideo] = useState({ title: '', category: 'Strength', url: '' });
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (snap) => {
      setUsers(snap.docs.map(doc => doc.data() as UserProfile));
      setLoading(false);
    }, (err) => console.error("Admin Users Sync Error:", err));

    const unsubVideos = onSnapshot(query(collection(db, 'training_videos'), orderBy('createdAt', 'desc')), (snap) => {
      setVideos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingVideo)));
    }, (err) => console.error("Admin Videos Sync Error:", err));

    return () => { unsubUsers(); unsubVideos(); };
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = getYouTubeId(newVideo.url);
    if (!videoId) return alert('Invalid YouTube URL');

    try {
      await addDoc(collection(db, 'training_videos'), {
        title: newVideo.title,
        category: newVideo.category,
        youtubeUrl: newVideo.url,
        videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        createdAt: new Date().toISOString(),
      });
      setNewVideo({ title: '', category: 'Strength', url: '' });
      setIsAddingVideo(false);
    } catch (err) {
      alert('Failed to add video');
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    try {
      await deleteDoc(doc(db, 'training_videos', id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const toggleAdmin = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Are you sure you want to change ${user.displayName} to ${newRole}?`)) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
    } catch (err) {
      alert('Update failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = users.filter(u => u.membershipStatus === 'active').length;

  return (
    <div className="space-y-8 max-w-6xl animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-black">Administration</h2>
          <p className="text-sm text-zinc-500 mt-1 font-normal">Manage members and training content.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-zinc-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'members' ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black'
            }`}
          >
            <Users className="w-4 h-4" />
            Members
          </button>
          <button 
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'training' ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black'
            }`}
          >
            <Video className="w-4 h-4" />
            Training
          </button>
        </div>
      </div>

      {activeTab === 'members' ? (
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="text-center px-6 py-2 bg-white border border-zinc-100 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold text-zinc-400 mb-1">Total Members</p>
              <p className="text-2xl font-light">{users.length}</p>
            </div>
            <div className="text-center px-6 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <p className="text-[10px] font-bold text-emerald-600/60 mb-1">Active Plans</p>
              <p className="text-2xl font-light text-emerald-600">{activeCount}</p>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm"
            />
          </div>

          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400">Member</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400">Plan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredUsers.map((user) => (
                  <tr key={user.uid}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-200">
                          {user.photoURL ? <img src={user.photoURL} alt="" /> : <Users className="w-4 h-4 text-zinc-400 mx-auto mt-2" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.displayName}</p>
                          <p className="text-[10px] text-zinc-400">Joined {user.createdAt ? formatDate(user.createdAt) : '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${user.membershipStatus === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                        {user.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{user.membershipType || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toggleAdmin(user)} className={`p-2 rounded-xl ${user.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-400'}`}>
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-light">Library Content</h3>
            <button 
              onClick={() => setIsAddingVideo(true)}
              className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-zinc-800 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Training Video
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map(video => (
              <div key={video.id} className="group bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-500">
                <div className="relative aspect-video">
                  <img src={video.thumbnail} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="text-white w-8 h-8" />
                  </div>
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold">
                    {video.category}
                  </span>
                </div>
                <div className="p-6 flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-zinc-900 line-clamp-1">{video.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 font-normal">Added {formatDate(video.createdAt)}</p>
                  </div>
                  <button onClick={() => deleteVideo(video.id)} className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      <AnimatePresence>
        {isAddingVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-md"
              onClick={() => setIsAddingVideo(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-md z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
                <h3 className="text-xl font-light">Publish Video</h3>
                <button onClick={() => setIsAddingVideo(false)} className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddVideo} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400">Video Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Master the Deadlift"
                      value={newVideo.title}
                      onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400">Category</label>
                    <select 
                      value={newVideo.category}
                      onChange={e => setNewVideo({...newVideo, category: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm outline-none focus:border-black transition-colors"
                    >
                      <option>Strength</option>
                      <option>Endurance</option>
                      <option>Recovery</option>
                      <option>Nutrition</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400">YouTube URL</label>
                  <input 
                    required
                    type="url" 
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newVideo.url}
                    onChange={e => setNewVideo({...newVideo, url: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
                <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all">
                  Publish to Library
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
