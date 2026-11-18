import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  COOKBOOK_METADATA,
  COOKBOOK_SECTIONS,
  COOKBOOK_MEMORIES,
  COOKBOOK_RECIPES,
  searchCookbook,
  getCookbookItemById
} from '../data/stromCookbookData';

// Helper to resolve asset URLs with Vite base path for GitHub Pages
const resolveAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${clean}`;
};

export default function CookbookView({ initialRecipeId, onClose }) {
  // Navigation & Search State
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // As the cookbook opens, show the Welcome & Color Picture view unless a specific recipe was requested
  const [activeItemId, setActiveItemId] = useState(() => {
    if (initialRecipeId && getCookbookItemById(initialRecipeId)) {
      return initialRecipeId;
    }
    return 'welcome';
  });

  // Favorites System (Persisted in localStorage)
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem('strom_cookbook_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return new Set(parsed);
        }
      }
    } catch {}
    // Beloved family starter favorites
    return new Set(['erin-cheesy-tortillas', 'down-home-for-dinner-sally', 'family-portrait-1950']);
  });

  const toggleFavorite = (id, e) => {
    e?.stopPropagation();
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('strom_cookbook_favorites', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const isFavorite = (id) => favoriteIds.has(id);

  // UI Toggles
  const [showOriginalScan, setShowOriginalScan] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [copiedToast, setCopiedToast] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);

  const mainScrollRef = useRef(null);

  // Sync URL hash with active item
  useEffect(() => {
    if (activeItemId === 'welcome') {
      const newHash = '#/cookbook';
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    } else if (activeItemId) {
      const newHash = `#/cookbook?recipe=${encodeURIComponent(activeItemId)}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    }
  }, [activeItemId]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash.includes('cookbook')) {
        onClose();
        return;
      }
      const match = hash.match(/recipe=([^&]+)/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        if (getCookbookItemById(decoded)) {
          setActiveItemId(decoded);
          return;
        }
      }
      setActiveItemId('welcome');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showOriginalScan) {
          setShowOriginalScan(false);
        } else if (isSidebarOpenMobile) {
          setIsSidebarOpenMobile(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showOriginalScan, isSidebarOpenMobile, onClose]);

  // Filtered lists (supporting favorites filter tab)
  const { filteredRecipes, filteredMemories, totalMatches } = useMemo(() => {
    if (selectedSection === 'favorites') {
      const allMem = COOKBOOK_MEMORIES.filter(m => favoriteIds.has(m.id));
      const allRec = COOKBOOK_RECIPES.filter(r => favoriteIds.has(r.id));
      
      if (!searchQuery.trim()) {
        return {
          filteredRecipes: allRec,
          filteredMemories: allMem,
          totalMatches: allRec.length + allMem.length
        };
      }
      
      const q = searchQuery.toLowerCase().trim();
      const matchRec = allRec.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.contributor.toLowerCase().includes(q) ||
        (r.ingredients && r.ingredients.some(ing => ing.toLowerCase().includes(q)))
      );
      const matchMem = allMem.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.contributor.toLowerCase().includes(q) ||
        (m.story && m.story.toLowerCase().includes(q))
      );
      return {
        filteredRecipes: matchRec,
        filteredMemories: matchMem,
        totalMatches: matchRec.length + matchMem.length
      };
    }

    const res = searchCookbook(searchQuery, selectedSection);
    return {
      filteredRecipes: res.recipes,
      filteredMemories: res.memories,
      totalMatches: res.totalCount
    };
  }, [searchQuery, selectedSection, favoriteIds]);

  // Active item data (null when on 'welcome' view)
  const activeItem = useMemo(() => {
    if (activeItemId === 'welcome') return null;
    return getCookbookItemById(activeItemId) || null;
  }, [activeItemId]);

  // Favorite items for the welcome view grid
  const favoriteItems = useMemo(() => {
    const list = [];
    for (const id of favoriteIds) {
      const item = getCookbookItemById(id);
      if (item) list.push(item);
    }
    return list;
  }, [favoriteIds]);

  // Curated starter suggestions if favorites are cleared
  const starterSuggestions = useMemo(() => {
    return [
      getCookbookItemById('erin-cheesy-tortillas'),
      getCookbookItemById('down-home-for-dinner-sally'),
      getCookbookItemById('recollections-pete-strom'),
      COOKBOOK_RECIPES.find(r => r.title.toLowerCase().includes('cookie') || r.title.toLowerCase().includes('pie')),
    ].filter(Boolean);
  }, []);

  // Toggle ingredient checked state
  const toggleIngredient = (idx) => {
    if (!activeItem) return;
    setCheckedIngredients((prev) => ({
      ...prev,
      [`${activeItem.id}_${idx}`]: !prev[`${activeItem.id}_${idx}`]
    }));
  };

  const resetChecklist = () => {
    setCheckedIngredients({});
  };

  // Share recipe link
  const handleShare = () => {
    if (!activeItem) return;
    const url = `${window.location.origin}${window.location.pathname}#/cookbook?recipe=${encodeURIComponent(activeItem.id)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2400);
    });
  };

  // Print current recipe
  const handlePrint = () => {
    window.print();
  };

  // Next / Previous navigation within current filtered list
  const currentList = useMemo(() => {
    return [...filteredMemories, ...filteredRecipes];
  }, [filteredMemories, filteredRecipes]);

  const currentIndex = activeItem ? currentList.findIndex(item => item.id === activeItem.id) : -1;
  const prevItem = currentIndex > 0 ? currentList[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < currentList.length - 1 ? currentList[currentIndex + 1] : null;

  const selectItem = (id) => {
    setActiveItemId(id);
    setIsSidebarOpenMobile(false);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#16120e] text-stone-100 flex flex-col font-sans overflow-hidden select-text">
      {/* Top Universal Cookbook Navigation Bar */}
      <header className="h-16 flex-shrink-0 bg-[#211a14] border-b border-amber-900/40 px-4 sm:px-6 flex items-center justify-between shadow-lg z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700/60 text-xs font-semibold text-amber-200 transition active:scale-95 shadow"
            title="Return to Bookshelf"
          >
            <span>←</span>
            <span>Bookshelf</span>
          </button>

          <div className="h-5 w-px bg-stone-700/60 hidden sm:block" />

          <button
            onClick={() => selectItem('welcome')}
            className="flex flex-col text-left group"
            title="Go to Cookbook Home & Family Photo"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🥧</span>
              <h1 className="text-sm sm:text-base font-serif font-bold text-amber-100 group-hover:text-amber-300 tracking-wide truncate transition-colors">
                Strom Family Cookbook
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-800/50">
                1999 Reunion Edition
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-sans hidden sm:block">
              Down Home For Dinner • 162 Treasured Recipes & Family Memories
            </p>
          </button>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          {/* Welcome Button */}
          <button
            onClick={() => selectItem('welcome')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition shadow border ${
              activeItemId === 'welcome'
                ? 'bg-amber-800 text-amber-100 border-amber-600/80'
                : 'bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border-stone-700/60'
            }`}
            title="Cookbook Home & Family Portrait"
          >
            <span>🏠</span>
            <span>Welcome</span>
          </button>

          {/* Mobile TOC Drawer Toggle */}
          <button
            onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/50 hover:bg-amber-800/60 text-amber-200 rounded-xl border border-amber-700/50 text-xs font-semibold shadow"
          >
            <span>📖</span>
            <span>TOC ({totalMatches})</span>
          </button>

          {/* Download Print-Ready PDF */}
          <a
            href={resolveAssetUrl(COOKBOOK_METADATA.pdfUrl)}
            target="_blank"
            rel="noopener noreferrer"
            download="strom_family_cookbook_print_ready.pdf"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-200 rounded-xl border border-stone-700/60 text-xs font-medium transition shadow"
            title="Download full 86-page print-ready PDF for reprinting"
          >
            <span>📥</span>
            <span>Print-Ready PDF</span>
          </a>

          {/* Download Google Doc (.docx) */}
          <a
            href={resolveAssetUrl('strom_family_cookbook.docx')}
            download="strom_family_cookbook.docx"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-200 rounded-xl border border-stone-700/60 text-xs font-medium transition shadow"
            title="Download Google Doc (.docx) with 100% clean digital recipes"
          >
            <span>📄</span>
            <span>Google Doc</span>
          </a>

          {/* Committee & Dedication info */}
          <button
            onClick={() => setIsCommitteeModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-200 rounded-xl border border-stone-700/60 text-xs font-medium transition shadow"
            title="View Reunion Committee & Family Contributors"
          >
            <span>❤️</span>
            <span>Dedication</span>
          </button>

          {/* Close Cookbook */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-400 hover:text-amber-100 border border-stone-700/60 flex items-center justify-center text-sm transition"
            title="Close Cookbook (Esc)"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Two-Pane Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Table of Contents & Search Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-full sm:w-[380px] lg:w-[390px] flex-shrink-0 bg-[#1c1611] border-r border-amber-950/80 flex flex-col transition-transform duration-300 shadow-2xl lg:shadow-none
            ${isSidebarOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ top: '64px' }}
        >
          {/* Mobile TOC Drawer Header */}
          <div className="lg:hidden p-3 bg-[#241c15] border-b border-amber-900/40 flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-amber-200 flex items-center gap-1.5">
              <span>📖</span> Table of Contents
            </span>
            <button
              onClick={() => setIsSidebarOpenMobile(false)}
              className="text-xs text-stone-400 hover:text-amber-200 px-2 py-1 bg-stone-900 rounded-lg"
            >
              Close TOC ✕
            </button>
          </div>

          {/* Welcome & Family Portrait Shortcut Row */}
          <div className="p-2 border-b border-amber-950/80 bg-[#17120d]">
            <button
              onClick={() => selectItem('welcome')}
              className={`
                w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition font-serif font-semibold border
                ${activeItemId === 'welcome'
                  ? 'bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 text-amber-50 border-amber-500/80 shadow-md'
                  : 'bg-[#241c15] text-amber-200/90 hover:bg-[#2e231b] hover:text-white border-amber-900/40'
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">👨‍👩‍👧‍👦</span>
                <span>Welcome & Family Photo</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-amber-300/90 border border-amber-800/40">
                Home
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3.5 border-b border-amber-950/80 bg-[#18130e]">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipe, ingredient, or family member..."
                className="w-full pl-8 pr-8 py-2 bg-[#261f18] border border-amber-900/50 rounded-xl text-xs text-amber-50 placeholder:text-stone-500 focus:outline-none focus:border-amber-600 font-sans shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-200 text-xs p-0.5"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 flex items-center justify-between text-[11px] text-amber-300/80 px-1">
                <span>{totalMatches} matching results</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="underline hover:text-amber-100"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Section Category Tabs with Favorites Filter */}
          <div className="p-2 border-b border-amber-950/80 bg-[#1e1712] overflow-x-auto flex gap-1.5 no-scrollbar">
            {/* Favorites Tab */}
            <button
              onClick={() => setSelectedSection('favorites')}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition font-medium
                ${selectedSection === 'favorites'
                  ? 'bg-rose-950 text-rose-100 shadow-sm border border-rose-600/80'
                  : 'text-stone-400 hover:text-rose-200 hover:bg-[#281f18]'
                }
              `}
              title="Filter to your family favorites"
            >
              <span>❤️</span>
              <span>Favorites</span>
              <span className="text-[10px] font-mono opacity-80">({favoriteIds.size})</span>
            </button>

            {COOKBOOK_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`
                  flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition font-medium
                  ${selectedSection === sec.id
                    ? 'bg-amber-800 text-amber-50 shadow-sm border border-amber-600/50'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-[#281f18]'
                  }
                `}
              >
                <span>{sec.icon}</span>
                <span>{sec.title.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75">({sec.count})</span>
              </button>
            ))}
          </div>

          {/* Scrollable Recipe / Story List */}
          <div className="flex-1 overflow-y-auto divide-y divide-amber-950/40 p-2 space-y-1">
            {/* Memories Group */}
            {filteredMemories.length > 0 && (
              <div className="mb-3">
                <div className="px-3 py-1.5 text-[11px] font-mono tracking-wider uppercase text-amber-400/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>📜</span>
                    <span>Memories & Stories ({filteredMemories.length})</span>
                  </span>
                </div>
                <div className="space-y-1 mt-1">
                  {filteredMemories.map((mem) => {
                    const isSelected = activeItemId === mem.id;
                    const favorited = isFavorite(mem.id);
                    return (
                      <button
                        key={mem.id}
                        onClick={() => selectItem(mem.id)}
                        className={`
                          w-full text-left p-2.5 rounded-xl transition flex items-start justify-between gap-2 text-xs
                          ${isSelected
                            ? 'bg-gradient-to-r from-amber-900/80 to-amber-950 border border-amber-600/70 text-amber-100 font-semibold shadow-md'
                            : 'text-stone-300 hover:bg-[#261e17] hover:text-amber-100'
                          }
                        `}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {favorited && (
                              <span className="text-[10px] text-rose-400" title="Favorite">❤️</span>
                            )}
                            <p className="truncate font-serif text-sm leading-snug">{mem.title}</p>
                          </div>
                          <p className="text-[11px] text-amber-300/70 truncate mt-0.5">
                            By {mem.contributor}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900/60 text-stone-400 flex-shrink-0">
                          p.{mem.pageNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recipes Group */}
            {filteredRecipes.length > 0 ? (
              <div>
                <div className="px-3 py-1.5 text-[11px] font-mono tracking-wider uppercase text-amber-400/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>🥧</span>
                    <span>Recipes ({filteredRecipes.length})</span>
                  </span>
                  <span className="text-[10px] text-stone-500 lowercase">click to open</span>
                </div>
                <div className="space-y-1 mt-1">
                  {filteredRecipes.map((rec) => {
                    const isSelected = activeItemId === rec.id;
                    const isErin = rec.contributor.includes('Erin') || rec.id.includes('erin');
                    const favorited = isFavorite(rec.id);
                    return (
                      <button
                        key={rec.id}
                        onClick={() => selectItem(rec.id)}
                        className={`
                          w-full text-left p-2.5 rounded-xl transition flex items-start justify-between gap-2 text-xs
                          ${isSelected
                            ? 'bg-gradient-to-r from-amber-900/80 to-amber-950 border border-amber-600/70 text-amber-100 font-semibold shadow-md'
                            : 'text-stone-300 hover:bg-[#261e17] hover:text-amber-100'
                          }
                        `}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {favorited && (
                              <span className="text-[10px] text-rose-400" title="Favorite">❤️</span>
                            )}
                            {isErin && (
                              <span className="text-[10px] px-1 py-0.2 bg-rose-900/80 text-rose-200 rounded font-mono font-bold" title="Erin's Childhood Recipe!">
                                ⭐ Erin
                              </span>
                            )}
                            <p className="truncate font-serif text-sm leading-snug">{rec.title}</p>
                          </div>
                          <p className="text-[11px] text-amber-300/70 truncate mt-0.5">
                            {rec.contributor}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900/60 text-stone-400 flex-shrink-0">
                          p.{rec.bookPage || rec.pageNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              filteredMemories.length === 0 && (
                <div className="p-6 text-center text-stone-400">
                  <p className="text-2xl mb-2">{selectedSection === 'favorites' ? '❤️' : '🔍'}</p>
                  <p className="text-xs font-serif">
                    {selectedSection === 'favorites'
                      ? 'No recipes saved to favorites yet. Tap the ❤️ Favorite button on any recipe to add it!'
                      : `No recipes found matching "${searchQuery}"`}
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedSection('all'); }}
                    className="mt-3 px-3 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs rounded-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              )
            )}
          </div>

          {/* Table of Contents Footer with stats */}
          <div className="p-3 bg-[#18130e] border-t border-amber-950/80 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Strom Family Reunion • 1999</span>
            <span className="font-mono text-amber-300/80">162 Recipes</span>
          </div>
        </aside>

        {/* Right Pane: Kitchen Recipe Showcase OR Welcome & Favorites Dashboard */}
        <main
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto bg-[#17130f] p-4 sm:p-6 lg:p-10 flex flex-col items-center"
        >
          {activeItemId === 'welcome' || !activeItem ? (
            /* ========================================================= */
            /* WELCOME TO THE STROM FAMILY COOKBOOK & FAVORITES VIEW    */
            /* ========================================================= */
            <div className="w-full max-w-4xl space-y-8">
              {/* Welcome Header Hero */}
              <div className="bg-[#231b14] border border-amber-900/50 rounded-3xl p-6 sm:p-9 shadow-2xl relative overflow-hidden">
                {/* Festive Ambient Background Accents */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Eyebrow */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/40 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥧</span>
                    <span className="text-xs font-mono tracking-widest uppercase text-amber-300 font-semibold">
                      Down Home For Dinner • 1999 Reunion Edition
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                    <span>📖 162 Recipes</span>
                    <span>•</span>
                    <span>📜 7 Family Memoirs</span>
                  </div>
                </div>

                {/* Main Welcome Heading */}
                <div className="text-center sm:text-left mb-6">
                  <h2 className="text-3xl sm:text-5xl font-serif font-black text-amber-100 tracking-tight leading-tight mb-3">
                    Welcome to the Strom Family Cookbook
                  </h2>
                  <p className="text-sm sm:text-base text-stone-300 font-serif leading-relaxed max-w-2xl">
                    Lovingly compiled for the June 1999 Strom Family Reunion, this digital edition preserves 
                    our family’s cherished recipes, childhood recollections, and heartwarming Sunday dinner memories.
                  </p>
                </div>

                {/* ========================================================= */}
                {/* THE COLOR PICTURE OF THE STROMS                           */}
                {/* ========================================================= */}
                <div className="relative rounded-2xl overflow-hidden shadow-[0_22px_50px_rgba(0,0,0,0.85)] border-2 border-amber-600/40 bg-stone-950 my-6 group">
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[520px] overflow-hidden flex items-center justify-center bg-stone-900">
                    <img
                      src={resolveAssetUrl('/cookbook/strom_family_portrait_color.webp')}
                      alt="The Strom Family in color"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    {/* Subtle candlelight ambient gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />
                  </div>

                  {/* Caption Plaque */}
                  <div className="p-4 sm:p-5 bg-gradient-to-b from-[#2a2018] to-[#1c1510] border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div>
                      <h4 className="text-base sm:text-lg font-serif font-bold text-amber-100">
                        The Strom Family Gathering
                      </h4>
                      <p className="text-xs text-amber-200/80 font-sans mt-0.5">
                        Lovingly dedicated to Albion Sr. and Laura Strom &bull; Down Home For Dinner
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 font-mono">
                        ❤️ Family Heritage
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Search Shortcut Banner */}
                <div className="bg-[#1b140f] border border-amber-900/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-stone-300">
                    <span className="text-lg">🔍</span>
                    <span>
                      Use the search features on the left to explore recipes by ingredient, dish, or family member!
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const erin = COOKBOOK_RECIPES.find(r => r.id.includes('erin') || r.contributor.includes('Erin'));
                      if (erin) selectItem(erin.id);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-800/90 hover:bg-amber-700 text-amber-100 font-medium transition shadow-sm whitespace-nowrap active:scale-95 flex items-center gap-1.5"
                  >
                    <span>⭐</span>
                    <span>View Erin's Cheesy Tortillas</span>
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* FAMILY FAVORITES (LISTED BELOW THE PICTURE)               */}
              {/* ========================================================= */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">❤️</span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 leading-tight">
                        Family Favorites
                      </h3>
                      <p className="text-xs text-stone-400">
                        Click any recipe below to open its full ingredients and directions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-800/50 text-rose-300">
                      {favoriteItems.length} {favoriteItems.length === 1 ? 'Favorite' : 'Favorites'}
                    </span>
                    <button
                      onClick={() => setSelectedSection('favorites')}
                      className="hidden sm:flex text-xs font-medium text-amber-300 hover:text-amber-100 underline items-center gap-1"
                    >
                      <span>Filter sidebar</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {favoriteItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => selectItem(item.id)}
                        className="group cursor-pointer bg-[#221a13] hover:bg-[#2c2118] border border-amber-900/50 hover:border-amber-600/70 rounded-2xl p-4 sm:p-5 transition-all shadow-md hover:shadow-xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300/90 border border-amber-800/40">
                              {item.category || item.sectionName || 'Recipe'}
                            </span>
                            <button
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className="p-1 text-rose-400 hover:text-rose-300 transition text-sm hover:scale-110"
                              title="Remove from favorites"
                            >
                              ❤️
                            </button>
                          </div>
                          <h4 className="text-base sm:text-lg font-serif font-bold text-amber-100 group-hover:text-amber-200 line-clamp-1 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-stone-400 line-clamp-1 mt-1">
                            By <strong className="text-amber-200/90">{item.contributor}</strong>
                          </p>
                          {item.story && (
                            <p className="text-[11px] text-stone-400/90 italic line-clamp-2 mt-2 font-serif border-l-2 border-amber-700/50 pl-2">
                              "{item.story}"
                            </p>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-amber-900/30 flex items-center justify-between text-xs text-stone-400">
                          <span className="font-mono text-[11px]">
                            {item.bookPage ? `Book p. ${item.bookPage}` : `Page ${item.pageNumber}`}
                          </span>
                          <span className="text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                            Open Recipe →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty Favorites State with Suggestions */
                  <div className="bg-[#201812] border border-amber-900/40 rounded-2xl p-6 text-center space-y-4">
                    <p className="text-3xl">⭐</p>
                    <div>
                      <h4 className="text-base font-serif font-bold text-amber-100">
                        No favorites saved yet
                      </h4>
                      <p className="text-xs text-stone-400 max-w-md mx-auto mt-1">
                        Click the <strong className="text-rose-300">❤️ Favorite</strong> button on any recipe throughout the cookbook to curate your personal collection right here.
                      </p>
                    </div>
                    {/* Starter Suggestions */}
                    <div className="pt-2">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-amber-300/80 mb-3">
                        Popular Family Dishes to Explore:
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {starterSuggestions.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => selectItem(item.id)}
                            className="px-3.5 py-2 bg-[#2a1f17] hover:bg-amber-900/60 border border-amber-900/50 rounded-xl text-xs text-amber-200 hover:text-white transition flex items-center gap-1.5"
                          >
                            <span>🍴</span>
                            <span>{item.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* RECIPE / FAMILY STORY READING STAGE                       */
            /* ========================================================= */
            <div className="w-full max-w-4xl space-y-6">
              {/* Top Bar for Current Recipe */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#231b14] border border-amber-900/40 p-3 sm:p-4 rounded-2xl shadow">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => selectItem('welcome')}
                    className="text-xs px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 border border-stone-700/60 font-sans flex items-center gap-1.5 transition shadow-sm active:scale-95"
                    title="Return to Welcome & Family Photo"
                  >
                    <span>🏠</span>
                    <span>Welcome</span>
                  </button>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 font-mono">
                    {activeItem.category || activeItem.sectionName}
                  </span>
                  <span className="text-xs text-stone-400 font-mono hidden sm:inline">
                    Original Page: {activeItem.bookPage ? `Book p. ${activeItem.bookPage}` : `PDF p. ${activeItem.pageNumber}`}
                  </span>
                </div>

                {/* Action Buttons: Favorite, Kitchen Print, Share, 1999 Scan */}
                <div className="flex items-center gap-2">
                  {/* FAVORITE BUTTON */}
                  <button
                    onClick={(e) => toggleFavorite(activeItem.id, e)}
                    className={`
                      px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border shadow-sm active:scale-95
                      ${isFavorite(activeItem.id)
                        ? 'bg-rose-950/90 text-rose-200 border-rose-600/80 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        : 'bg-stone-900/80 text-stone-300 hover:text-rose-300 border-stone-700/60 hover:border-rose-700/60'
                      }
                    `}
                    title={isFavorite(activeItem.id) ? 'Remove from favorites' : 'Add to family favorites'}
                  >
                    <span className={isFavorite(activeItem.id) ? 'scale-110' : ''}>
                      {isFavorite(activeItem.id) ? '❤️' : '🤍'}
                    </span>
                    <span>{isFavorite(activeItem.id) ? 'Favorited' : 'Favorite'}</span>
                  </button>

                  <button
                    onClick={() => setShowOriginalScan(!showOriginalScan)}
                    className={`
                      px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border
                      ${showOriginalScan
                        ? 'bg-amber-700 text-amber-50 border-amber-500 shadow'
                        : 'bg-stone-900/80 text-stone-300 hover:text-amber-200 border-stone-700/60'
                      }
                    `}
                    title="Toggle side-by-side view with 1999 vintage scan"
                  >
                    <span>📜</span>
                    <span>{showOriginalScan ? 'Hide 1999 Scan' : 'View 1999 Scan'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-700/60 transition flex items-center gap-1.5"
                    title="Copy shareable link"
                  >
                    <span>🔗</span>
                    <span>{copiedToast ? 'Copied!' : 'Share'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-700/60 transition flex items-center gap-1.5"
                    title="Print recipe for the kitchen"
                  >
                    <span>🖨️</span>
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </div>
              </div>

              {/* Split Screen Container: Digital Clean Layout vs Original 1999 Scan */}
              <div className={`grid gap-6 ${showOriginalScan ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Clean Digital Cookbook Page (Kitchen Optimized Paper Look) */}
                <div className="bg-[#fbf9f5] text-stone-900 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-amber-900/20 relative font-serif">
                  {/* Vintage Header Ribbon */}
                  <div className="flex items-center justify-between border-b-2 border-amber-900/20 pb-4 mb-6">
                    <div>
                      <span className="text-[11px] font-mono tracking-wider uppercase text-amber-800 font-semibold">
                        Strom Family Reunion • Down Home For Dinner
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-serif font-black text-stone-950 tracking-tight leading-tight mt-1">
                        {activeItem.title}
                      </h2>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="inline-block px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-sans font-bold">
                        ❤️ {activeItem.contributor}
                      </span>
                    </div>
                  </div>

                  {/* Personal Anecdote / Story / Family Memory */}
                  {activeItem.story && (
                    <div className="my-5 p-4 bg-amber-50/80 border-l-4 border-amber-600 rounded-r-xl italic text-stone-800 text-sm sm:text-base leading-relaxed">
                      <span className="font-bold text-amber-800 not-italic mr-1.5">Family Story:</span>
                      “{activeItem.story}”
                    </div>
                  )}

                  {/* Memory Narrative Layout (For Memories Chapters) */}
                  {activeItem.isMemory || activeItem.sectionId === 'memories' ? (
                    <div className="space-y-4 my-6 text-stone-800 text-base sm:text-lg leading-relaxed font-serif">
                      {activeItem.text && activeItem.text.map((para, pIdx) => (
                        <p key={pIdx} className="leading-relaxed">
                          {para}
                        </p>
                      ))}
                      {activeItem.notes && (
                        <div className="mt-6 p-4 bg-stone-100 rounded-2xl border border-stone-300 text-xs font-sans text-stone-700">
                          <span className="font-bold uppercase tracking-wider text-stone-900 block mb-1">
                            Archival Note:
                          </span>
                          {activeItem.notes}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Standard Recipe Kitchen Layout */
                    <div className="space-y-8 mt-6">
                      {/* Ingredients Checklist */}
                      {activeItem.ingredients && activeItem.ingredients.length > 0 && (
                        <div className="bg-[#f5f1ea] p-5 sm:p-6 rounded-2xl border border-amber-200/80">
                          <div className="flex items-center justify-between mb-4 border-b border-amber-300/60 pb-2">
                            <h3 className="text-base sm:text-lg font-bold font-sans tracking-wide text-amber-950 uppercase flex items-center gap-2">
                              <span>🥄</span>
                              <span>Ingredients</span>
                              <span className="text-xs font-normal text-stone-600">
                                ({activeItem.ingredients.length} items)
                              </span>
                            </h3>
                            <button
                              onClick={resetChecklist}
                              className="text-xs font-sans text-amber-800 hover:text-amber-950 underline"
                              title="Uncheck all items"
                            >
                              Reset Checklist
                            </button>
                          </div>

                          <ul className="space-y-2.5 font-sans text-sm sm:text-base text-stone-900">
                            {activeItem.ingredients.map((ing, idx) => {
                              const isChecked = !!checkedIngredients[`${activeItem.id}_${idx}`];
                              return (
                                <li
                                  key={idx}
                                  onClick={() => toggleIngredient(idx)}
                                  className={`
                                    flex items-start gap-3 cursor-pointer p-1.5 rounded-lg transition select-none
                                    ${isChecked ? 'bg-amber-100/60 text-stone-400' : 'hover:bg-amber-100/40'}
                                  `}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="mt-1 w-4 h-4 rounded text-amber-700 focus:ring-amber-500 cursor-pointer accent-amber-700"
                                  />
                                  <span className={`flex-1 ${isChecked ? 'line-through opacity-70' : 'font-medium'}`}>
                                    {ing}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {/* Step-by-Step Cooking Instructions */}
                      {activeItem.instructions && activeItem.instructions.length > 0 && (
                        <div>
                          <h3 className="text-base sm:text-lg font-bold font-sans tracking-wide text-amber-950 uppercase flex items-center gap-2 mb-4 border-b border-amber-900/20 pb-2">
                            <span>🔥</span>
                            <span>Directions & Preparation</span>
                          </h3>

                          <ol className="space-y-4 font-sans text-stone-800 text-sm sm:text-base leading-relaxed">
                            {activeItem.instructions.map((step, sIdx) => (
                              <li key={sIdx} className="flex gap-4 items-start bg-white/70 p-4 rounded-xl border border-stone-200 shadow-sm">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-800 text-amber-50 font-bold text-xs flex items-center justify-center font-mono">
                                  {sIdx + 1}
                                </span>
                                <div className="flex-1 font-serif text-base sm:text-lg text-stone-900 leading-relaxed">
                                  {step}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Family Notes / Kitchen Tips */}
                      {activeItem.notes && (
                        <div className="p-4 bg-amber-100/80 rounded-2xl border border-amber-300 text-stone-900 text-sm font-sans flex items-start gap-2.5 shadow-sm">
                          <span className="text-lg">📝</span>
                          <div className="flex-1 font-medium leading-relaxed">
                            {activeItem.notes}
                          </div>
                        </div>
                      )}

                      {/* Family Contributor Seal */}
                      <div className="pt-6 border-t-2 border-amber-900/20 flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-stone-600 gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">❤️</span>
                          <span>
                            Shared with love by <strong className="text-stone-950">{activeItem.contributor}</strong>
                          </span>
                        </div>
                        <span className="font-mono text-stone-500">
                          Down Home For Dinner • Strom Family Reunion
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Side-by-side Authentic 1999 Scan (when toggled on) */}
                {showOriginalScan && (
                  <div className="bg-[#1c1611] rounded-3xl p-4 sm:p-6 border border-amber-900/50 shadow-2xl flex flex-col items-center">
                    <div className="w-full flex items-center justify-between pb-3 border-b border-amber-900/40 mb-4 text-xs font-mono text-amber-200">
                      <span className="flex items-center gap-1.5">
                        <span>📜</span> 1999 Original Typewriter Scan
                      </span>
                      <a
                        href={resolveAssetUrl(activeItem.originalPageImage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-amber-400"
                      >
                        Open Full Image ↗
                      </a>
                    </div>

                    <div className="relative w-full max-h-[750px] overflow-auto rounded-xl bg-stone-950 shadow-inner flex items-center justify-center p-2">
                      <img
                        src={resolveAssetUrl(activeItem.originalPageImage)}
                        alt={`Original page scan for ${activeItem.title}`}
                        className="max-w-full h-auto object-contain rounded shadow"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400 font-sans mt-3 text-center">
                      Original archival page from the June 1999 Strom Family Reunion Cookbook.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Next / Previous Recipe Navigation */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-amber-900/30 font-sans text-xs">
                {prevItem ? (
                  <button
                    onClick={() => selectItem(prevItem.id)}
                    className="px-4 py-2.5 bg-[#231b14] hover:bg-[#2c221a] text-amber-200 rounded-xl border border-amber-900/50 flex items-center gap-2 transition"
                  >
                    <span>←</span>
                    <span className="truncate max-w-[150px] sm:max-w-xs">{prevItem.title}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => selectItem('welcome')}
                    className="px-4 py-2.5 bg-[#231b14] hover:bg-[#2c221a] text-stone-400 hover:text-amber-200 rounded-xl border border-amber-900/50 flex items-center gap-2 transition"
                  >
                    <span>🏠</span>
                    <span>Welcome Home</span>
                  </button>
                )}

                {nextItem ? (
                  <button
                    onClick={() => selectItem(nextItem.id)}
                    className="px-4 py-2.5 bg-[#231b14] hover:bg-[#2c221a] text-amber-200 rounded-xl border border-amber-900/50 flex items-center gap-2 transition"
                  >
                    <span className="truncate max-w-[150px] sm:max-w-xs">{nextItem.title}</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => selectItem('welcome')}
                    className="px-4 py-2.5 bg-[#231b14] hover:bg-[#2c221a] text-stone-400 hover:text-amber-200 rounded-xl border border-amber-900/50 flex items-center gap-2 transition"
                  >
                    <span>🏠</span>
                    <span>Back to Home</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dedication & Reunion Committee Modal */}
      <AnimatePresence>
        {isCommitteeModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsCommitteeModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#211a14] border border-amber-900/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-amber-50 shadow-2xl relative"
            >
              <button
                onClick={() => setIsCommitteeModalOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 text-lg w-8 h-8 rounded-full bg-stone-900/80 flex items-center justify-center"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <span className="text-3xl">🥧</span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 mt-2">
                  Strom Family Cookbook
                </h3>
                <p className="text-xs font-mono text-amber-300/80 uppercase tracking-widest mt-1">
                  1999 Reunion Committee & Contributors
                </p>
              </div>

              <div className="space-y-4 text-xs font-sans text-stone-300">
                <div className="bg-[#291f17] p-4 rounded-2xl border border-amber-900/40">
                  <h4 className="font-serif font-bold text-amber-200 mb-1">Dedication:</h4>
                  <p className="italic leading-relaxed text-stone-200">
                    "{COOKBOOK_METADATA.dedication}"
                  </p>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-amber-200 mb-2">1999 Cookbook Committee:</h4>
                  <ul className="grid grid-cols-2 gap-1.5 text-stone-300 font-mono text-[11px]">
                    {COOKBOOK_METADATA.committee.map((person, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-amber-500">•</span>
                        <span>{person}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-amber-200 mb-2">
                    Family Contributors ({COOKBOOK_METADATA.contributors.length}):
                  </h4>
                  <div className="max-h-48 overflow-y-auto pr-2 grid grid-cols-2 gap-1 text-[11px] text-stone-400 font-sans">
                    {COOKBOOK_METADATA.contributors.map((c, idx) => (
                      <span key={idx} className="truncate">• {c}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-900/40 flex justify-end">
                <button
                  onClick={() => setIsCommitteeModalOpen(false)}
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
