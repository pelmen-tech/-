import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category, CategoryNames } from '../types';
import { X, MapPin, Sparkles, Upload, AlertTriangle, Lightbulb, Trash2, Shield, Leaf, Layers } from 'lucide-react';

export default function CreatePostModal() {
  const { isCreatePostOpen, setCreatePostOpen, selectedMapCoords, userLocation, createPost, fetchPosts } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('roads');
  const [latitude, setLatitude] = useState<number>(55.7558);
  const [longitude, setLongitude] = useState<number>(37.6173);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Dynamic values assignment on modal trigger
  useEffect(() => {
    if (isCreatePostOpen) {
      if (selectedMapCoords) {
        setLatitude(selectedMapCoords.lat);
        setLongitude(selectedMapCoords.lng);
      } else if (userLocation) {
        setLatitude(userLocation.lat);
        setLongitude(userLocation.lng);
      }
    }
  }, [isCreatePostOpen, selectedMapCoords, userLocation]);

  if (!isCreatePostOpen) return null;

  // Preset visuals option so users don't have to upload anything to see elegant pictures!
  const presets: Record<Category, string[]> = {
    roads: [
      'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600'
    ],
    garbage: [
      'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600'
    ],
    lighting: [
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=600'
    ],
    safety: [
      'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=600'
    ],
    ecology: [
      'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600'
    ],
    other: [
      'https://images.unsplash.com/photo-1473800447596-01729482b8eb?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600'
    ],
  };

  // Set default initial preset pic on category switch or when no image exists
  const applyPreset = (cat: Category) => {
    setImageUrl(presets[cat][0]);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title.trim()) {
      setError('Заголовок публикации не может быть пустым');
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setError('Пожалуйста, добавьте подробное описание происшествия');
      setLoading(false);
      return;
    }

    try {
      await createPost({
        title,
        description,
        image_url: imageUrl || presets[category][0],
        category,
        latitude,
        longitude,
      });

      // Reset
      setTitle('');
      setDescription('');
      setCategory('roads');
      setImageUrl('');
      setCreatePostOpen(false);
      fetchPosts();
    } catch (err: any) {
      setError(err.message || 'Не удалось создать публикацию');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setCreatePostOpen(false)}
      />

      {/* Main modal container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header bar */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold font-display tracking-tight">Создать публикацию</h2>
          </div>
          <button 
            type="button"
            onClick={() => setCreatePostOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Incident category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Категория события</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CategoryNames) as Category[]).filter((cat) => cat !== 'safety').map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      if (!imageUrl) applyPreset(cat);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center flex flex-col items-center space-y-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/55 ${isSelected ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    {cat === 'roads' && <AlertTriangle className="w-4 h-4 shrink-0" />}
                    {cat === 'garbage' && <Trash2 className="w-4 h-4 shrink-0" />}
                    {cat === 'lighting' && <Lightbulb className="w-4 h-4 shrink-0" />}
                    {cat === 'ecology' && <Leaf className="w-4 h-4 shrink-0" />}
                    {cat === 'other' && <Layers className="w-4 h-4 shrink-0" />}
                    <span>{CategoryNames[cat]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Заголовок публикации</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Краткое описание события (например: Яма на перекрестке)"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm font-medium"
              required
            />
          </div>

          {/* Long Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Подробности происшествия</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Расскажите все подробности, чтобы другие жители могли легко проверить вашу информацию..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm leading-relaxed"
              required
            />
          </div>

          {/* Map click coordinates fields indicators */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block flex items-center">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 mr-1" />
              <span>Координаты на карте (Широта и Долгота)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input 
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <input 
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-xs font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photo attachment zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Прикрепить фото происшествия</label>
            <div className="flex flex-col space-y-3">
              {imageUrl ? (
                <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                  <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* File Upload Box */}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer h-24 transition-colors">
                    <div className="flex flex-col items-center justify-center space-y-1 p-3">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {isUploading ? 'Загрузка...' : 'Загрузить фото'}
                      </span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden" 
                    />
                  </label>

                  {/* Preset option quick triggers */}
                  <div className="flex-1 flex flex-col justify-between h-24">
                    <button
                      type="button"
                      onClick={() => applyPreset(category)}
                      className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-center flex items-center justify-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Предустановка</span>
                    </button>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 py-1 px-1">
                      Или примените готовое стоковое фото для этой категории.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => setCreatePostOpen(false)}
            className="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Отмена
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Опубликовать происшествие'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
