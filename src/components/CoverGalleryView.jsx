import React from 'react';
import { getBookCoverUrl } from '../lib/pocketbase';
import { isMouseBookItem, isMagazineItem } from './SpineBookshelf';

export default function CoverGalleryView({ books = [], onSelectBook, onAddBook, activeFilter = 'all', onFilterChange }) {
  const storyCount = books.filter((b) => (b.category === 'story' || !b.category) && !isMagazineItem(b)).length;
  const mouseCount = books.filter((b) => isMouseBookItem(b)).length;
  const magCount = books.filter((b) => isMagazineItem(b)).length;
  const albumCount = books.filter((b) => b.category === 'album').length;
  const cookbookCount = books.filter((b) => b.category === 'cookbook').length;

  const displayedBooks = books.filter((b) => {
    if (activeFilter === 'mouse') return isMouseBookItem(b);
    if (activeFilter === 'magazine') return isMagazineItem(b);
    if (activeFilter === 'story') return (b.category === 'story' || !b.category) && !isMagazineItem(b);
    if (activeFilter === 'album') return b.category === 'album';
    if (activeFilter === 'cookbook') return b.category === 'cookbook';
    return true;
  });

  if (books.length === 0) {
    return (
      <div className="text-center py-24 text-amber-200/70 font-sans">
        <span className="text-5xl block mb-3">📚</span>
        <h3 className="text-xl font-serif text-amber-100 mb-2">The Shelves are Waiting</h3>
        <p className="text-xs text-stone-400 mb-6">Start by adding your first cherished Christmas storybook.</p>
        <button
          onClick={onAddBook}
          className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-sm shadow transition"
        >
          + Add First Book
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Category & Mouse Books Filter Bar */}
      {onFilterChange && (
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10 font-serif text-xs">
          {[
            { id: 'all', label: `All (${books.length})` },
            { id: 'story', label: `Storybooks (${storyCount})` },
            { id: 'mouse', label: `🐭 Mouse Books (${mouseCount})` },
            { id: 'magazine', label: `📜 Vintage Magazines (${magCount})` },
            { id: 'album', label: `Photo Albums (${albumCount})` },
            { id: 'cookbook', label: `Cookbooks (${cookbookCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-full border transition ${
                activeFilter === tab.id
                  ? 'bg-amber-800/90 border-amber-400/60 text-amber-50 font-bold shadow'
                  : 'bg-[#1b120ce0] border-amber-950/70 text-amber-200/70 hover:text-amber-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-16 items-end">
        {displayedBooks.map((book) => {
          const coverUrl = getBookCoverUrl(book) || book.cover;
          const isMouse = isMouseBookItem(book);
          const isMag = isMagazineItem(book);
          const isCookbook = book.category === 'cookbook' || book.id === 'cookbook_erin' || book.id === 'twelve_days_of_christmas_cookbook';
          const isAlbum = book.category === 'album' || book.id === 'album_santa';
          const isSantaMouse = book.id === 'santa_mouse';

          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="group relative cursor-pointer flex flex-col items-center"
            >
              {/* Realistic 3D Book with Spine Edge and Shadow (Hugs each book's natural shape) */}
              <div className="relative inline-flex items-center justify-center rounded-r-md rounded-l-sm shadow-[0_14px_28px_rgba(0,0,0,0.85),-4px_0_12px_rgba(0,0,0,0.5)] overflow-hidden border border-amber-950/40 group-hover:-translate-y-2.5 group-hover:shadow-[0_22px_36px_rgba(0,0,0,0.95)] transition-all duration-300 bg-[#140c08]">
                {/* Book Spine Highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/50 via-white/10 to-transparent z-10 pointer-events-none" />

                {/* Top Corner Badges */}
                <div className="absolute top-1.5 right-1.5 z-20 flex flex-col items-end gap-1 pointer-events-none">
                  {isAlbum && (
                    <span className="px-1.5 py-0.5 rounded bg-red-900/95 border border-amber-300/70 text-[8.5px] font-sans font-semibold text-amber-100 shadow">
                      🎅 Santa Scrapbook
                    </span>
                  )}
                  {isCookbook && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-900/95 border border-amber-400/60 text-[8.5px] font-sans font-semibold text-amber-100 shadow">
                      🥧 Cookbook
                    </span>
                  )}
                  {isMag && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950/95 border border-amber-400/50 text-[8.5px] font-sans font-semibold text-amber-200 shadow">
                      📜 Vintage Magazine
                    </span>
                  )}
                  {isMouse && (
                    <span className="px-1.5 py-0.5 rounded bg-stone-950/90 border border-amber-500/40 text-[8.5px] font-sans font-semibold text-amber-200 shadow">
                      🐭 Mouse
                    </span>
                  )}
                  {isSantaMouse && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/95 border border-emerald-400/50 text-[8.5px] font-sans font-semibold text-emerald-200 shadow">
                      2 Copies
                    </span>
                  )}
                  {book.bonusPhoto && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-800/95 border border-amber-300/70 text-[8.5px] font-sans font-semibold text-amber-50 shadow">
                      📸 Bonus Pic
                    </span>
                  )}
                </div>

                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={book.title}
                    className="max-h-48 sm:max-h-56 max-w-[148px] sm:max-w-[172px] w-auto h-auto object-contain block"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-stone-800 to-stone-900 flex items-center justify-center p-3 text-center">
                    <span className="text-xs font-serif text-amber-200">{book.title}</span>
                  </div>
                )}
              </div>

              {/* Title & Author */}
              <h3 className="mt-3 text-xs font-serif font-bold text-amber-100 text-center line-clamp-1 max-w-[155px] group-hover:text-amber-300 transition">
                {book.title}
              </h3>
              <p className="text-[11px] text-amber-200/50 text-center line-clamp-1">
                {book.author || 'Unknown'}
              </p>

              {/* Wooden Shelf Plank Below Row */}
              <div className="absolute -bottom-5 w-full left-0 right-0 h-4 bg-gradient-to-b from-[#4a2e1b] to-[#2a170b] border-t border-[#7a4e2e] shadow-[0_8px_14px_rgba(0,0,0,0.9)] rounded-sm pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
