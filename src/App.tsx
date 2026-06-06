import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import { Category, CategoryNames, CategoryColors, PostStatus, StatusNames, StatusColors } from './types';
import CityMap from './components/CityMap';
import AuthModal from './components/AuthModal';
import CreatePostModal from './components/CreatePostModal';
import PostDetailsPage from './components/PostDetailsPage';
import UserProfileModal from './components/UserProfileModal';
import { 
  MapPin, AlertTriangle, Lightbulb, Trash2, Shield, Layers, Search, Plus, 
  Moon, Sun, User, Bell, LogOut, Map, List, RotateCcw, Eye, ThumbsUp, 
  ThumbsDown, Sparkles, CheckCircle2, CheckCircle, Info, Leaf, HelpCircle,
  TrendingUp
} from 'lucide-react';

export default function App() {
  const { 
    user, authChecked, checkAuth, posts, fetchPosts, isPostsLoading,
    filters, setFilters, resetFilters, setAuthModalOpen, setCreatePostOpen,
    setActivePostId, setActiveProfileUserId,
    theme, toggleTheme, notifications, markNotificationRead, resetDatabase,
    userLocation
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'feed' | 'map'>('feed'); // mobile layout switcher
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Initialize Auth & fetch initial listings
  useEffect(() => {
    checkAuth();
    fetchPosts();
  }, [checkAuth, fetchPosts]);

  // Click outside notification panel listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleCategorySelect = (category: string) => {
    setFilters({ category });
  };

  const handleStatusSelect = (status: string) => {
    setFilters({ status });
  };

  const handlePostClick = (postId: string) => {
    setActivePostId(postId);
  };

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти из профиля жителя?')) {
      localStorage.removeItem('pravda_ryadom_token');
      window.location.reload();
    }
  };

  const handleOpenCreator = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      setCreatePostOpen(true);
    }
  };

  const handleResetDevDB = async () => {
    if (confirm('Внимание! Все измененные публикации будут удалены, база будет сброшена к исходным демо-публикациям. Продолжить?')) {
      await resetDatabase();
      alert('База успешно восстановлена!');
    }
  };

  // Helper mapping category keywords to icons
  const getCategoryIcon = (cat: string) => {
    const props = { className: "w-4 h-4 mr-1.5 inline-block" };
    switch (cat) {
      case 'roads': return <AlertTriangle {...props} className="text-orange-500" />;
      case 'lighting': return <Lightbulb {...props} className="text-yellow-500" />;
      case 'garbage': return <Trash2 {...props} className="text-amber-500" />;
      case 'safety': return <Shield {...props} className="text-red-500" />;
      case 'ecology': return <Leaf {...props} className="text-emerald-500" />;
      default: return <Layers {...props} className="text-slate-500" />;
    }
  };

  // Calculate unread notification metrics
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* 🚀 Sleek Header Navigation Bar */}
      <header className="sticky top-0 z-[1000] w-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 select-none flex items-center justify-between shadow-sm">
        
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-extrabold text-lg tracking-tight font-display shadow-md shadow-emerald-500/25">
            П
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-1 px-1">
              <h1 className="text-sm font-extrabold tracking-tight font-display text-slate-900 dark:text-slate-100">ПРАВДА РЯДОМ</h1>
              <span className="flex h-2 w-2 relative -top-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Контроль городской среды жителями</p>
          </div>
        </div>

        {/* Global Desktop Search Input */}
        <div className="hidden md:flex items-center max-w-sm w-full mx-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск по заголовкам и улицам..." 
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-xs transition-colors"
          />
          {filters.search && (
            <button 
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ×
            </button>
          )}
        </div>

        {/* Dynamic Navigation Tools Menu */}
        <div className="flex items-center space-x-2">
          
          {/* Preset DB Reset trigger */}
          <button
            onClick={handleResetDevDB}
            className="p-2 ml-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Восстановить исходные данные"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>

          {/* Core Theme toggling */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title={theme === 'dark' ? 'Дневной режим' : 'Темная тема'}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
          </button>

          {/* Authenticaticated User features block */}
          {user ? (
            <div className="flex items-center space-x-2 relative">
              
              {/* Notification Center Trigger */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer relative"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] font-bold text-white flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications list overlay dropdown panel */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-[1100] animate-fade-in text-xs font-sans">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-bold">Уведомления верификации</span>
                      {unreadCount > 0 && <span className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] py-0.5 px-2 rounded-full font-bold">новых: {unreadCount}</span>}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={async () => {
                              if (!notif.read) await markNotificationRead(notif.id);
                            }}
                            className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${!notif.read ? 'bg-emerald-50/20 dark:bg-emerald-950/10 font-medium' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{notif.title}</span>
                              {!notif.read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1 ml-1" />}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-snug text-[11px]">{notif.body}</p>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block mt-1">{new Date(notif.created_at).toLocaleDateString('ru-RU')}</span>
                          </div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-slate-400">Уведомлений пока нет</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Active User profile details switch */}
              <button
                onClick={() => setActiveProfileUserId(user.id)}
                className="flex items-center space-x-2 pl-2 pr-1.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer text-xs transition-colors"
              >
                <img 
                  src={user.avatar_url} 
                  alt={user.username} 
                  className="w-6 h-6 rounded-full object-cover" 
                />
                <div className="hidden sm:block text-left">
                  <p className="font-bold font-sans text-slate-800 dark:text-slate-100 leading-none">{user.username}</p>
                  <span className="text-[9px] font-semibold text-emerald-500 font-mono block mt-0.5">{user.reputation} XP</span>
                </div>
              </button>

              {/* Secure Log out */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer transition-all shadow-md shadow-emerald-500/15"
            >
              <User className="w-4 h-4" />
              <span>Создать профиль</span>
            </button>
          )}
        </div>
      </header>

      {/* 📱 Mobile switch layout tabs switcher */}
      <div className="flex md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 w-full shrink-0 select-none">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-3 text-xs font-bold font-display border-b-2 text-center flex items-center justify-center space-x-1.5 transition-colors ${activeTab === 'feed' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'}`}
        >
          <List className="w-4 h-4" />
          <span>Ленты публикаций</span>
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-3 text-xs font-bold font-display border-b-2 text-center flex items-center justify-center space-x-1.5 transition-colors ${activeTab === 'map' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'}`}
        >
          <Map className="w-4 h-4" />
          <span>События на карте</span>
        </button>
      </div>

      {/* 🏢 Main Workspace Container */}
      <main className="flex-1 flex overflow-hidden w-full relative">
        
        {/* ================= LEFT SIDEBAR FEED CHANNEL ================= */}
        <section className={`w-full md:w-[420px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden ${activeTab === 'feed' ? 'block' : 'hidden md:flex'}`}>
          
          {/* Active stats counter & quick report buttons */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 shrink-0 border-b border-slate-100 dark:border-slate-800 select-none">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5 font-display text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4.5 h-4.5" />
                <span className="text-xs font-extrabold tracking-widest uppercase">СОБЫТИЯ ВБЛИЗИ ({posts.length})</span>
              </div>
              <button
                onClick={handleOpenCreator}
                className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg cursor-pointer transition-all shadow-md shadow-emerald-500/10 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Сообщить</span>
              </button>
            </div>

            {/* Mobile Category Search Indicator */}
            <div className="md:hidden mb-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Поиск событий по названию..." 
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Category horizontal scroll indicators list */}
            <div className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`py-1.5 px-3 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${filters.category === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Все
              </button>
              {(Object.keys(CategoryNames) as Category[]).filter((cat) => cat !== 'safety').map((cat) => {
                const isSelected = filters.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`py-1.5 px-3 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center space-x-1 ${isSelected ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span>{getCategoryIcon(cat)}</span>
                    <span>{CategoryNames[cat]}</span>
                  </button>
                );
              })}
            </div>

            {/* Status indicators quick selection */}
            <div className="flex items-center space-x-4 pt-2 text-[11px] text-slate-400 select-none">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Статус:</span>
              <button
                onClick={() => handleStatusSelect('all')}
                className={`transition-colors text-[11px] ${filters.status === 'all' ? 'text-emerald-500 font-bold underline underline-offset-4' : 'hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                Все
              </button>
              <button
                onClick={() => handleStatusSelect('confirmed')}
                className={`transition-colors text-[11px] ${filters.status === 'confirmed' ? 'text-emerald-500 font-bold underline underline-offset-4' : 'hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                Подтвержденные
              </button>
              <button
                onClick={() => handleStatusSelect('partially_confirmed')}
                className={`transition-colors text-[11px] ${filters.status === 'partially_confirmed' ? 'text-amber-500 font-bold underline underline-offset-4' : 'hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                Спорные
              </button>
              <button
                onClick={() => handleStatusSelect('unverified')}
                className={`transition-colors text-[11px] ${filters.status === 'unverified' ? 'text-slate-500 font-bold underline underline-offset-4' : 'hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                Новые
              </button>
            </div>
          </div>

          {/* Incidents feed lists */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {isPostsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 select-none">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-xs font-semibold">Синхронизация городского реестра...</span>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => {
                const votesSum = post.votes_confirm + post.votes_refute;
                return (
                  <div 
                    key={post.id}
                    onClick={() => handlePostClick(post.id)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-md transition-all active:scale-[0.99] duration-150 cursor-pointer space-y-3 relative group animate-fade-in"
                  >
                    {/* Header line category & status */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${CategoryColors[post.category]}`}>
                        {CategoryNames[post.category]}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${StatusColors[post.status]}`}>
                        {StatusNames[post.status]}
                      </span>
                    </div>

                    <div className="flex space-x-3.5">
                      {/* Left side text briefing */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <h3 className="font-bold font-display text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {post.description}
                        </p>
                      </div>

                      {/* Right thumbnail attachment preview */}
                      {post.image_url && (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-800">
                          <img 
                            src={post.image_url} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Stats footer: verification confirmations & clock time */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 font-mono">
                      
                      {/* Voting approvals summary count */}
                      <div className="flex items-center space-x-2.5 text-[11px]">
                        <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold" title="Жители подтверждают">
                          <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                          <span>{post.votes_confirm}</span>
                        </span>
                        
                        {post.votes_refute > 0 && (
                          <span className="flex items-center text-rose-500 dark:text-rose-400" title="Жители опровергают">
                            <ThumbsDown className="w-3.5 h-3.5 mr-1" />
                            <span>{post.votes_refute}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 text-slate-400">
                        <span>{new Date(post.created_at).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-24 text-slate-400 select-none space-y-3">
                <Info className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs">В данной категории нет сообщений жителей.</p>
                <button
                  onClick={resetFilters}
                  className="text-xs text-emerald-500 underline font-semibold cursor-pointer"
                >
                  Сбросить фильтры поиска
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ================= RIGHT MAIN TACTICAL MAP ================= */}
        <section className={`flex-1 h-full overflow-hidden ${activeTab === 'map' ? 'block' : 'hidden md:block'}`}>
          <CityMap 
            posts={posts} 
            onMarkerClick={handlePostClick}
          />
        </section>

        {/* Sliders Overlap Drawers Panels */}
        <AuthModal />
        <CreatePostModal />
        <PostDetailsPage />
        <UserProfileModal />

      </main>
    </div>
  );
}
