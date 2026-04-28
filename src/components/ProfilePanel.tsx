import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Shield, Calendar, Phone, MapPin, Camera, Save } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function ProfilePanel({ profile }: { profile: UserProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    photoURL: profile.photoURL || '',
    phone: (profile as any).phone || '',
    bio: (profile as any).bio || '',
    location: (profile as any).location || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-10 animate-in">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-zinc-50 shadow-inner bg-zinc-100 flex items-center justify-center">
            {formData.photoURL ? (
              <img src={formData.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-zinc-300" />
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-light text-black">{formData.displayName}</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Mail className="w-3.5 h-3.5" /> {profile.email}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Shield className="w-3.5 h-3.5" /> {profile.role === 'admin' ? 'Administrator' : 'Elite Member'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-black border-b border-zinc-50 pb-4">Personal Information</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400">Profile Image URL</label>
            <div className="relative">
              <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
              <input 
                type="url" 
                placeholder="https://..."
                value={formData.photoURL}
                onChange={e => setFormData({...formData, photoURL: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:border-black transition-colors outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
              <input 
                type="text" 
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:border-black transition-colors outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
              <input 
                type="tel" 
                placeholder="+234 ..."
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:border-black transition-colors outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
              <input 
                type="text" 
                placeholder="Lagos, Nigeria"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:border-black transition-colors outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-black border-b border-zinc-50 pb-4">Bio & Professional</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400">About You</label>
            <textarea 
              rows={4}
              placeholder="Tell us about your fitness journey..."
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:border-black transition-colors outline-none resize-none"
            />
          </div>

          <div className="pt-4">
            <button 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Changes...' : 'Update Bio'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
