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
  const [activeItemId, setActiveItemId] = useState(() => {
    if (initialRecipeId && getCookbookItemById(initialRecipeId)) {
      return initialRecipeId;
    }
    // Default to Erin's Cheesy Tortillas or Sally's intro memory
    const erin = COOKBOOK_RECIPES.find(r => r.id.includes('erin') || r.contributor.includes('Erin'));
    return erin ? erin.id : COOKBOOK_MEMORIES[1].id;
  });

  // UI Toggles
  const [showOriginalScan, setShowOriginalScan] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [copiedToast, setCopiedToast] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);

  const mainScrollRef = useRef(null);

  // Sync URL hash with active item
  useEffect(() => {
    if (activeItemId) {
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
        }
      }
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

  // Filtered lists
  const { filteredRecipes, filteredMemories, totalMatches } = useMemo(() => {
    const res = searchCookbook(searchQuery, selectedSection);
    return {
      filteredRecipes: res.recipes,
      filteredMemories: res.memories,
      totalMatches: res.totalCount
    };
  }, [searchQuery, selectedSection]);

  // Active item data
  const activeItem = useMemo(() => {
    return getCookbookItemById(activeItemId) || COOKBOOK_RECIPES[0];
  }, [activeItemId]);

  // Toggle ingredient checked state
  const toggleIngredient = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [`${activeItemId}_${idx}`]: !prev[`${activeItemId}_${idx}`]
    }));
  };

  const resetChecklist = () => {
    setCheckedIngredients({});
  };

  // Share recipe link
  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#/cookbook?recipe=${encodeURIComponent(activeItemId)}`;
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

  const currentIndex = currentList.findIndex(item => item.id === activeItemId);
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

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥧</span>
              <h1 className="text-sm sm:text-base font-serif font-bold text-amber-100 tracking-wide truncate">
                Strom Family Cookbook
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-800/50">
                1999 Reunion Edition
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-sans hidden sm:block">
              Down Home For Dinner • 162 Treasured Recipes & Family Memories
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile TOC Drawer Toggle */}
          <button
            onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/50 hover:bg-amber-800/60 text-amber-200 rounded-xl border border-amber-700/50 text-xs font-semibold shadow"
          >
            <span>📖</span>
            <span>TOC ({totalMatches})</span>
          </button>

          {/* Download Original PDF */}
          <a
            href={resolveAssetUrl(COOKBOOK_METADATA.pdfUrl)}
            download="strom_family_cookbook_cleaned.pdf"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-200 rounded-xl border border-stone-700/60 text-xs font-medium transition shadow"
            title="Download full 86-page printable PDF"
          >
            <span>📥</span>
            <span>Original PDF</span>
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

          {/* Section Category Tabs */}
          <div className="p-2 border-b border-amber-950/80 bg-[#1e1712] overflow-x-auto flex gap-1.5 no-scrollbar">
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
                <div className="px-3 py-1.5 text-[11px] font-mono tracking-wider uppercase text-amber-400/80 flex items-center gap-1.5">
                  <span>📜</span>
                  <span>Memories & Family Stories ({filteredMemories.length})</span>
                </div>
                <div className="space-y-1 mt-1">
                  {filteredMemories.map((mem) => {
                    const isSelected = activeItemId === mem.id;
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
                          <p className="truncate font-serif text-sm leading-snug">{mem.title}</p>
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
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-xs font-serif">No recipes found matching "{searchQuery}"</p>
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

        {/* Right Pane: Large Kitchen Recipe & Memories Showcase */}
        <main
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto bg-[#17130f] p-4 sm:p-6 lg:p-10 flex flex-col items-center"
        >
          <div className="w-full max-w-4xl space-y-6">
            {/* Top Bar for Current Recipe */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#231b14] border border-amber-900/40 p-3 sm:p-4 rounded-2xl shadow">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 font-mono">
                  {activeItem.category || activeItem.sectionName}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  Original Page: {activeItem.bookPage ? `Book p. ${activeItem.bookPage}` : `PDF p. ${activeItem.pageNumber}`}
                </span>
              </div>

              {/* Action Buttons: Kitchen print, Share, Original Scan toggle */}
              <div className="flex items-center gap-2">
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
                            const isChecked = !!checkedIngredients[`${activeItemId}_${idx}`];
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
                <div />
              )}

              {nextItem ? (
                <button
                  onClick={() => selectItem(nextItem.id)}
                  className="px-4 py-2.5 bg-[#231b14] hover:bg-[#2c221a] text-amber-200 rounded-xl border border-amber-900/50 flex items-center gap-2 transition ml-auto"
                >
                  <span className="truncate max-w-[150px] sm:max-w-xs">{nextItem.title}</span>
                  <span>→</span>
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Committee & Dedication Modal */}
      {isCommitteeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsCommitteeModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1f1712] border border-amber-700/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-amber-50 shadow-2xl relative"
          >
            <button
              onClick={() => setIsCommitteeModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center text-sm"
            >
              ✕
            </button>

            <span className="text-2xl mb-2 block">❤️</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 mb-1">
              {COOKBOOK_METADATA.title}
            </h3>
            <p className="text-xs font-mono text-amber-300/80 mb-4">
              {COOKBOOK_METADATA.reunion}
            </p>

            <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-800/40 mb-5 font-serif italic text-amber-200/90 text-sm leading-relaxed">
              “{COOKBOOK_METADATA.dedication}”
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <h4 className="font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                  1999 Reunion Committee:
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-stone-300">
                  {COOKBOOK_METADATA.committee.map((member, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span>•</span> {member}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                  Family Contributors ({COOKBOOK_METADATA.contributors.length}):
                </h4>
                <div className="max-h-40 overflow-y-auto pr-2 grid grid-cols-2 gap-1 text-stone-300 text-[11px]">
                  {COOKBOOK_METADATA.contributors.map((contrib, i) => (
                    <span key={i} className="truncate">
                      • {contrib}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-900/40 flex justify-end">
              <button
                onClick={() => setIsCommitteeModalOpen(false)}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
