import React from 'react';
import { getBookCoverUrl } from '../lib/pocketbase';

export default function ListView({ books = [], onSelectBook, onDeleteBook }) {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 text-stone-400 font-sans">
        <p className="text-sm">No books found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 font-sans">
      <div className="bg-[#1b130f] rounded-2xl border border-amber-950/60 divide-y divide-amber-950/40 shadow-xl overflow-hidden">
        {books.map((book, idx) => {
          const coverUrl = getBookCoverUrl(book) || book.cover;
          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-amber-950/30 cursor-pointer transition"
            >
              <div className="flex items-center gap-4">
                <span className="text-stone-500 font-mono text-xs w-5 text-right">{idx + 1}</span>
                <div className="w-12 h-16 rounded overflow-hidden shadow border border-amber-950/60 flex-shrink-0 bg-stone-900">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">📖</div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-serif font-bold text-amber-100">{book.title}</h4>
                  <p className="text-xs text-amber-200/60 font-sans">{book.author}</p>
                  {book.notes && (
                    <p className="text-[11px] text-amber-300/80 italic mt-1 font-serif">"{book.notes}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-900/60 px-3.5 py-1.5 rounded-full font-medium">
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
