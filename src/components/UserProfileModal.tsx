import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import { UserProfile, Post, CategoryColors, CategoryNames, StatusColors, StatusNames } from '../types';
import { X, Trophy, Sparkles, Calendar, Layers, MapPin, Eye } from 'lucide-react';

export default function UserProfileModal() {
  const { activeProfileUserId, setActiveProfileUserId, posts, setActivePostId } = useAppStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeProfileUserId) {
      setLoading(true);
      apiService.getUserProfile(activeProfileUserId)
        .then((data) => {
          setProfile(data);
          
          // Filter globally fetched posts to list this users submissions
          const filtered = posts.filter(p => p.user_id === activeProfileUserId);
          setUserPosts(filtered);
          
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setProfile(null);
      setUserPosts([]);
    }
  }, [activeProfileUserId, posts]);

  if (!activeProfileUserId) return null;

  const handleInspectPost = (postId: string) => {
    setActivePostId(postId);
    setActiveProfileUserId(null); // auto switch panel focus!
  };

  // Reputation tier labels
  const getReputationTier = (rep: number) => {
    if (rep >= 100) return { name: 'Городской Хранитель', color: 'text-amber-500 bg-amber-500/10 border-amber-200 dark:border-amber-900/60' };
    if (rep >= 50) return { name: 'Активист Района', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/60' };
    if (rep >= 20) return { name: 'Неравнодушный Житель', color: 'text-emerald-600 bg-emerald-100/40 border-emerald-200 dark:border-emerald-900/60' };
    return { name: 'Наблюдатель', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800' };
  };

  return (
    <div className="fixed inset-0 z-[1900] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setActiveProfileUserId(null)}
      />

      {/* Profile Box */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in text-slate-900 dark:text-slate-100 max-h-[85vh] flex flex-col">
        
        {/* Banner decorator */}
        <div className="bg-gradient-to-tr from-emerald-600 to-teal-800 p-6 text-white shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-28 h-28 bg-white/10 rounded-full blur-xl" />
          <button 
            type="button"
            onClick={() => setActiveProfileUserId(null)}
            className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          {loading && !profile ? (
            <div className="py-6 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : profile ? (
            <div className="flex items-center space-x-4">
              <img 
                src={profile.avatar_url} 
                alt={profile.username} 
                className="w-16 h-16 rounded-full border-4 border-white/20 shadow-md object-cover" 
              />
              <div className="space-y-1">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase font-bold tracking-wider ${getReputationTier(profile.reputation).color}`}>
                  {getReputationTier(profile.reputation).name}
                </span>
                <h2 className="text-xl font-bold font-display tracking-tight leading-none pt-1">
                  {profile.username}
                </h2>
                <div className="flex items-center text-xs text-emerald-100 font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  <span>Житель с {new Date(profile.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Stats segment */}
        {profile && (
          <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="p-4 border-r border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block mb-1">РЕПУТАЦИЯ</span>
              <div className="flex items-center justify-center space-x-1.5">
                <Trophy className="w-4 w-4 text-amber-500 shrink-0" />
                <span className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">{profile.reputation} XP</span>
              </div>
            </div>
            <div className="p-4 text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block mb-1">ПУБЛИКАЦИИ</span>
              <div className="flex items-center justify-center space-x-1.5">
                <Layers className="w-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">{profile.post_count}</span>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable submissions list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">ПУБЛИКАЦИИ ЖИТЕЛЯ</h3>
          
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-2" />
              <span className="text-xs">Загрузка...</span>
            </div>
          ) : userPosts.length > 0 ? (
            <div className="space-y-2.5">
              {userPosts.map((post) => (
                <div 
                  key={post.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex space-x-3 items-center justify-between"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {post.image_url && (
                      <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-950 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold font-sans truncate text-slate-800 dark:text-slate-150 pr-2 leading-snug">
                        {post.title}
                      </h4>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${StatusColors[post.status]}`}>
                          {StatusNames[post.status]}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(post.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInspectPost(post.id)}
                    className="p-1.5 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 rounded-xl transition-all cursor-pointer flex-shrink-0"
                    title="Смотреть"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">У этого жителя пока нет активных городских публикаций.</p>
          )}
        </div>
      </div>
    </div>
  );
}
