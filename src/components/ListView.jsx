import React from 'react';
import { getBookCoverUrl } from '../lib/pocketbase';
import { isMouseBookItem, isMagazineItem } from './SpineBookshelf';

export default function ListView({ books = [], onSelectBook, onDeleteBook, activeFilter = 'all', onFilterChange }) {
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
      <div className="text-center py-20 text-stone-400 font-sans">
        <p className="text-sm">No books found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 font-sans">
      {/* Category & Mouse Books Filter Bar */}
      {onFilterChange && (
        <div className="flex items-center justify-center flex-wrap gap-2 mb-6 font-serif text-xs">
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

      <div className="bg-[#1b130f] rounded-2xl border border-amber-950/60 divide-y divide-amber-950/40 shadow-xl overflow-hidden">
        {displayedBooks.map((book, idx) => {
          const coverUrl = getBookCoverUrl(book) || book.cover;
          const isMouse = isMouseBookItem(book);
          const isMag = isMagazineItem(book);
          const isCookbook = book.category === 'cookbook' || book.id === 'cookbook_erin' || book.id === 'twelve_days_of_christmas_cookbook';
          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-amber-950/30 cursor-pointer transition gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-stone-500 font-mono text-xs w-6 text-right flex-shrink-0">{idx + 1}</span>
                <div className="w-12 h-16 rounded overflow-hidden shadow border border-amber-950/60 flex-shrink-0 bg-stone-900 flex items-center justify-center">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      className="w-full h-full object-contain"
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">📖</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <h4 className="text-sm sm:text-base font-serif font-bold text-amber-100">{book.title}</h4>
                    {isCookbook && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/90 border border-amber-400/50 text-amber-100 font-medium">
                        🥧 Cookbook
                      </span>
                    )}
                    {isMag && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/40 text-amber-200 font-medium">
                        📜 Vintage Holiday Magazine
                      </span>
                    )}
                    {isMouse && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900 border border-amber-600/40 text-amber-200 font-medium">
                        🐭 Mouse Book
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-200/60 font-sans">By {book.author || 'Unknown'}</p>
                  {book.notes && (
                    <p className="text-[11px] text-amber-300/80 italic mt-1 font-serif line-clamp-2">"{book.notes}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-900/60 px-3.5 py-1.5 rounded-full font-medium hidden sm:inline">
                  Open Book →
                </span>
                {onDeleteBook && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBook(book.id);
                    }}
                    className="p-1.5 text-stone-500 hover:text-red-400 transition text-xs"
                    title="Remove book"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
