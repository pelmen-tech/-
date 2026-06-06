import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import { Comment, CategoryNames, CategoryColors, StatusNames, StatusColors } from '../types';
import { X, ThumbsUp, ThumbsDown, Trash2, Send, Clock, MapPin, Sparkles, AlertTriangle, ShieldCheck, HelpCircle, CheckCircle, HelpCircle as UnverifiedIcon } from 'lucide-react';

export default function PostDetailsPage() {
  const { activePostId, setActivePostId, user, castVote, comments, fetchComments, submitComment, removeComment, posts } = useAppStore();
  const [post, setPost] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync post state from store or refetch Single Post details to ensure freshness
  useEffect(() => {
    if (activePostId) {
      setLoading(true);
      apiService.getPostById(activePostId)
        .then((data) => {
          setPost(data);
          fetchComments(activePostId);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setPost(null);
    }
  }, [activePostId, posts]); // trigger reload when votes change in posts general list or on load

  if (!activePostId) return null;

  const handleVoteSubmit = async (voteType: 'confirm' | 'refute') => {
    if (!user) {
      useAppStore.getState().setAuthModalOpen(true);
      return;
    }
    // Optimistic localized UI update for slick performance
    const isRemove = post.user_vote === voteType;
    let newConfirms = post.votes_confirm;
    let newRefutes = post.votes_refute;

    if (voteType === 'confirm') {
      if (isRemove) {
        newConfirms = Math.max(0, newConfirms - 1);
      } else {
        newConfirms += 1;
        if (post.user_vote === 'refute') newRefutes = Math.max(0, newRefutes - 1);
      }
    } else {
      if (isRemove) {
        newRefutes = Math.max(0, newRefutes - 1);
      } else {
        newRefutes += 1;
        if (post.user_vote === 'confirm') newConfirms = Math.max(0, newConfirms - 1);
      }
    }

    const nextUserVote = isRemove ? undefined : voteType;

    // Set optimistic state immediately
    setPost({
      ...post,
      votes_confirm: newConfirms,
      votes_refute: newRefutes,
      user_vote: nextUserVote,
    });

    // Call store
    await castVote(post.id, voteType);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      useAppStore.getState().setAuthModalOpen(true);
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await submitComment(post.id, commentText);
      setCommentText('');
      fetchComments(post.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      try {
        await removeComment(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const triggerProfileView = (userId: string) => {
    useAppStore.getState().setActiveProfileUserId(userId);
  };

  if (loading && !post) {
    return (
      <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Загрузка публикации...</span>
        </div>
      </div>
    );
  }

  if (!post) return null;

  // Verification calculations
  const totalVotesCount = post.votes_confirm + post.votes_refute;
  const matchConfirmRatio = totalVotesCount > 0 ? (post.votes_confirm / totalVotesCount) * 100 : 0;

  // Let's get status icon
  const getStatusIllustration = () => {
    if (post.status === 'confirmed') {
      return (
        <div className="bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 flex items-center space-x-3 text-emerald-800 dark:text-emerald-300">
          <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Информация подтверждена</h4>
            <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-0.5 leading-relaxed">
              Более 75% жителей подтвердили это событие ({matchConfirmRatio.toFixed(0)}%). Данные заслуживают доверия.
            </p>
          </div>
        </div>
      );
    } else if (post.status === 'partially_confirmed') {
      return (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 rounded-2xl p-4 flex items-center space-x-3 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Событие требует внимания</h4>
            <p className="text-xs text-amber-600/90 dark:text-amber-400/90 mt-0.5 leading-relaxed">
              Частично подтвержденная информация ({matchConfirmRatio.toFixed(0)}%). Рекомендуется повторная проверка на месте.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex items-center space-x-3 text-slate-700 dark:text-slate-300">
          <UnverifiedIcon className="w-8 h-8 text-slate-400 shrink-0 select-none" />
          <div>
            <h4 className="font-bold text-sm">Статус: Не проверено</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Количество голосов пока недостаточно или большинство опровергает этот инцидент. Помогите установить истину!
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setActivePostId(null)}
      />

      {/* Slide-out Panel container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden">
        
        {/* Detail Panel Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase border ${CategoryColors[post.category]}`}>
              {CategoryNames[post.category]}
            </span>
            <span className="text-xs text-slate-400 font-mono">#{post.id.substring(5, 10)}</span>
          </div>
          
          <button 
            type="button"
            onClick={() => setActivePostId(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable details wrapper */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Visual Image Banner */}
          {post.image_url && (
            <div className="w-full h-64 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-205 dark:border-slate-800">
              <img 
                src={post.image_url} 
                alt={post.title} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Heading title */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight leading-snug">
              {post.title}
            </h1>
            
            {/* Meta tags author block */}
            <div className="flex items-center justify-between mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => triggerProfileView(post.user_id)}
                className="flex items-center space-x-2 w-fit text-left group hover:opacity-85"
              >
                <img 
                  src={post.author_avatar} 
                  alt={post.author_name} 
                  className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-800 object-cover" 
                />
                <div>
                  <h4 className="text-sm font-semibold group-hover:text-emerald-500 duration-150">{post.author_name}</h4>
                  <span className="text-slate-400 font-mono text-[10px]">Автор публикации</span>
                </div>
              </button>

              <div className="text-right text-[11px] text-slate-400 font-mono space-y-0.5">
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  <span>{new Date(post.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex items-center justify-end">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  <span>{post.latitude.toFixed(4)}, {post.longitude.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Paragraph description */}
          <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <p className="whitespace-pre-line">{post.description}</p>
          </div>

          {/* Verification Status Card */}
          {getStatusIllustration()}

          {/* Active Voter Panel Area */}
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/85">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">ВЕРИФИКАЦИЯ ЖИТЕЛЯМИ</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleVoteSubmit('confirm')}
                className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${post.user_vote === 'confirm' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/40 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400'}`}
              >
                <ThumbsUp className="w-4 h-4 fill-current" />
                <span>Подтверждаю ({post.votes_confirm})</span>
              </button>

              <button
                onClick={() => handleVoteSubmit('refute')}
                className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${post.user_vote === 'refute' ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/40 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400'}`}
              >
                <ThumbsDown className="w-4 h-4 fill-current" />
                <span>Опровергаю ({post.votes_refute})</span>
              </button>
            </div>

            {/* Voting Distribution representation */}
            {totalVotesCount > 0 ? (
              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${(post.votes_confirm / totalVotesCount) * 100}%` }} 
                    className="h-full bg-emerald-500 transition-all duration-300"
                  />
                  <div 
                    style={{ width: `${(post.votes_refute / totalVotesCount) * 100}%` }} 
                    className="h-full bg-rose-500 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>За: {(post.votes_confirm / totalVotesCount * 100).toFixed(0)}%</span>
                  <span>Всего голосов: {totalVotesCount}</span>
                  <span>Против: {(post.votes_refute / totalVotesCount * 100).toFixed(0)}%</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 text-center py-1">
                Пока никто не проголосовал под этой публикацией. Будьте первыми!
              </div>
            )}
          </div>

          {/* Comments section divider heading */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm tracking-tight mb-4 flex items-center">
              <span>Комментарии жителей</span>
              <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2.5 py-0.5 rounded-full font-mono">{comments.length}</span>
            </h3>

            {/* Comments stack UI */}
            {comments.length > 0 ? (
              <div className="space-y-4 mb-6">
                {comments.map((comment) => {
                  const isOwn = user && comment.user_id === user.id;
                  return (
                    <div 
                      key={comment.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800 animate-fade-in text-xs leading-relaxed"
                    >
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => triggerProfileView(comment.user_id)}
                          className="flex items-center space-x-2 text-left hover:opacity-85"
                        >
                          <img 
                            src={comment.author_avatar} 
                            alt={comment.author_name} 
                            className="w-6 h-6 rounded-full object-cover" 
                          />
                          <span className="font-semibold">{comment.author_name}</span>
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(comment.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                              title="Удалить комментарий"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 translate-x-1 pl-1 font-sans">{comment.text}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Нет ни одного комментария. Оставьте первый комментарий!</p>
            )}

            {/* Commments Form */}
            <form onSubmit={handleAddComment} className="flex space-x-2 mt-4 select-none">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? "Напишите конструктивный комментарий..." : "Войдите чтобы оставить комментарий"}
                disabled={!user || submittingComment}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl focus:outline-none text-xs"
              />
              <button
                type="submit"
                disabled={!user || !commentText.trim() || submittingComment}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-250 dark:disabled:bg-slate-800 text-white p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/10"
              >
                {submittingComment ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
