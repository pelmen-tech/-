import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import { X, Mail, Lock, User, Sparkles, LogIn, ArrowRight } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setUser, fetchNotifications } = useAppStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let loggedUser;
      if (isRegister) {
        loggedUser = await apiService.register(email, username, password, avatarUrl || undefined);
      } else {
        loggedUser = await apiService.login(email, password); // takes email/username in custom login input
      }
      setUser(loggedUser);
      setAuthModalOpen(false);
      fetchNotifications();
      
      // Reset fields
      setEmail('');
      setUsername('');
      setPassword('');
      setAvatarUrl('');
    } catch (err: any) {
      setError(err.message || 'Ошибка выполнения запроса');
    } finally {
      setLoading(false);
    }
  };

  // Pre-loaded premium avatars to pick
  const avatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setAuthModalOpen(false)}
      />

      {/* Main modal container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in text-slate-900 dark:text-slate-100">
        
        {/* Banner decorator */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <button 
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2 text-emerald-100 mb-1">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse fill-yellow-300" />
            <span className="text-xs font-semibold tracking-wider uppercase font-display">Правда Рядом</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight font-display">
            {isRegister ? 'Присоединиться к жителям' : 'Вход в личный кабинет'}
          </h2>
          <p className="text-emerald-100 text-xs mt-1">
            {isRegister 
              ? 'Создайте профиль жителя и влияйте на качество нашего города' 
              : 'Авторизуйтесь, чтобы сообщать о проблемах и голосовать'}
          </p>
        </div>

        {/* Content body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Имя жителя</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              {isRegister ? 'Электронная почта' : 'Email или Имя жителя'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRegister ? 'ivan@example.ru' : 'ivan@example.ru или Дмитрий Иванов'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Текущий пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm"
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Выберите аватарку</label>
              <div className="flex items-center space-x-3">
                {avatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${avatarUrl === url ? 'border-emerald-500 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isRegister ? 'Зарегистрироваться' : 'Войти в систему'}</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors inline-flex items-center"
            >
              <span>{isRegister ? 'Уже есть профиль? Войдите' : 'Ещё нет аккаунта? Зарегистрируйтесь'}</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
