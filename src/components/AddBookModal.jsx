import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cropUniformCover } from '../lib/imageCompressor';
import { pb, parseBookCoverWithAI } from '../lib/pocketbase';

export default function AddBookModal({ isOpen, onClose, onBookAdded }) {
  const [rawImageFile, setRawImageFile] = useState(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(1.18); // Default smart auto-trim to eliminate outer table margins
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isScanningAI, setIsScanningAI] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const previewFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startDragRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  if (!isOpen) return null;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setRawImageFile(file);
    setRawPreviewUrl(preview);
    setZoom(1.18); // Smart auto-trim
    setPanX(0);
    setPanY(0);

    // Call Gemini AI Vision
    setIsScanningAI(true);
    setAiStatus('✨ Reading book cover with Gemini AI...');

    try {
      const result = await parseBookCoverWithAI(file);
      
      if (result.title) {
        setTitle(result.title);
      }
      if (result.author) {
        setAuthor(result.author);
      }

      // Auto-crop adjustment if Gemini detected the book's rectangular boundaries
      if (result.box_2d && Array.isArray(result.box_2d) && result.box_2d.length === 4) {
        const [ymin, xmin, ymax, xmax] = result.box_2d;
        const boxWidth = (xmax - xmin) / 1000;
        const boxHeight = (ymax - ymin) / 1000;
        
        // Calculate smart zoom based on detected book area
        if (boxWidth > 0.3 && boxHeight > 0.3) {
          const autoZoom = Math.min(2.0, Math.max(1.1, 1 / Math.max(boxWidth, boxHeight)));
          setZoom(parseFloat(autoZoom.toFixed(2)));
        }
      }

      if (result.title || result.author) {
        setAiStatus(`✨ Auto-populated: "${result.title || 'Book'}" by ${result.author || 'Author'}`);
      } else {
        setAiStatus('Please type title & author below.');
      }
    } catch (err) {
      console.warn('AI cover reading error:', err);
      setAiStatus('Could not auto-read text. Please enter title manually.');
    } finally {
      setIsScanningAI(false);
    }
  };

  // Touch and mouse pan handlers for the book crop box
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    startDragRef.current = {
      x: clientX,
      y: clientY,
      panX,
      panY,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const deltaX = clientX - startDragRef.current.x;
    const deltaY = clientY - startDragRef.current.y;
    setPanX(startDragRef.current.panX + deltaX);
    setPanY(startDragRef.current.panY + deltaY);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a book title');
      return;
    }

    setIsSaving(true);
    try {
      let finalCoverFile = null;
      let finalCoverUrl = null;

      // Crop photo into uniform 1:1.4 book cover using exact preview scale
      if (rawImageFile) {
        const pWidth = previewFrameRef.current?.clientWidth || 144;
        const pHeight = previewFrameRef.current?.clientHeight || 208;

        const cropped = await cropUniformCover(rawImageFile, { 
          zoom, 
          panX, 
          panY,
          previewWidth: pWidth,
          previewHeight: pHeight,
        });
        finalCoverFile = cropped.file;
        
        // Convert to data URL for persistent offline storage across reloads
        finalCoverUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(cropped.file);
        });
      }

      let createdRecord = null;
      try {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('author', author.trim());
        formData.append('notes', notes.trim());
        formData.append('sort_order', Date.now());
        if (finalCoverFile) {
          formData.append('cover', finalCoverFile);
        }

        createdRecord = await pb.collection('books').create(formData);
      } catch (pbErr) {
        console.warn('PocketBase offline, saving local book:', pbErr);
        createdRecord = {
          id: 'local_' + Date.now(),
          title: title.trim(),
          author: author.trim() || 'Unknown Author',
          cover: finalCoverUrl || 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=400&q=80',
          notes: notes.trim(),
          pages: [],
        };
      }

      onBookAdded(createdRecord);
      onClose();
    } catch (err) {
      alert('Error saving book: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1b1410] border border-amber-900/60 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-amber-50 font-sans relative my-auto max-h-[94vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 text-lg z-20"
        >
          ✕
        </button>

        <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-100 mb-1 flex items-center gap-2">
          <span>🌲</span> Add Christmas Book
        </h3>
        <p className="text-xs text-stone-400 mb-3">
          Snap a cover to auto-fill title & author, and frame it uniformly.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Uniform Cover Framing Box */}
          <div className="flex flex-col items-center justify-center bg-[#140e0b] border-2 border-dashed border-amber-900/60 rounded-2xl p-4">
            {rawPreviewUrl ? (
              <div className="flex flex-col items-center w-full">
                {/* 1:1.4 Standard Book Cover Frame */}
                <div
                  ref={previewFrameRef}
                  className="relative w-36 sm:w-40 h-52 sm:h-56 rounded-md overflow-hidden shadow-2xl border-2 border-amber-600/80 cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                >
                  <img
                    src={rawPreviewUrl}
                    alt="Cover Raw"
                    draggable={false}
                    className="absolute max-w-none transition-transform pointer-events-none"
                    style={{
                      transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                      transformOrigin: 'center center',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />

                  {/* Corner Guide Marks for Safe Book Area */}
                  <div className="absolute top-1 left-1 text-[10px] text-amber-400/60 pointer-events-none">┌</div>
                  <div className="absolute top-1 right-1 text-[10px] text-amber-400/60 pointer-events-none">┐</div>
                  <div className="absolute bottom-1 left-1 text-[10px] text-amber-400/60 pointer-events-none">└</div>
                  <div className="absolute bottom-1 right-1 text-[10px] text-amber-400/60 pointer-events-none">┘</div>

                  {/* 3D Realistic Spine Edge Highlight Overlay */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none z-10" />
                </div>

                {/* One-Tap Auto-Crop Presets */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  <button
                    type="button"
                    onClick={() => { setZoom(1.2); setPanX(0); setPanY(0); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-sans transition ${
                      Math.abs(zoom - 1.2) < 0.05 ? 'bg-amber-800 text-white font-semibold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    📐 Auto-Trim (1.2x)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setZoom(1.4); setPanX(0); setPanY(0); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-sans transition ${
                      Math.abs(zoom - 1.4) < 0.05 ? 'bg-amber-800 text-white font-semibold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    🔍 Tight (1.4x)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setZoom(1.0); setPanX(0); setPanY(0); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-sans transition ${
                      Math.abs(zoom - 1.0) < 0.05 ? 'bg-amber-800 text-white font-semibold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    ↔️ Full (1.0x)
                  </button>
                </div>

                {/* Fine Zoom Slider */}
                <div className="flex items-center gap-2.5 w-full max-w-xs mt-2 px-2">
                  <span className="text-[11px] text-stone-400">Zoom</span>
                  <input
                    type="range"
                    min="1"
                    max="2.2"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-600 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                  />
                  <span className="text-xs font-mono text-amber-200/80 w-8 text-right">{zoom.toFixed(1)}x</span>
                </div>

                <div className="mt-2 flex gap-2">
                  <label className="text-xs text-amber-300 hover:text-amber-200 underline cursor-pointer">
                    Retake / Choose Another Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center py-6 px-4 text-center w-full">
                <span className="text-4xl mb-2">📸</span>
                <span className="text-sm font-semibold text-amber-200">Take or Upload Book Cover Photo</span>
                <span className="text-xs text-stone-400 mt-1">
                  AI will auto-fill the title and author from the cover
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            )}

            {/* AI Reading Status */}
            {isScanningAI && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-300 font-mono animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Reading title & author with Gemini AI...</span>
              </div>
            )}
            {!isScanningAI && aiStatus && (
              <div className="mt-2.5 px-3 py-1 bg-amber-950/60 border border-amber-800/40 rounded-full text-[11px] font-mono text-amber-200 flex items-center gap-1.5">
                <span>{aiStatus}</span>
              </div>
            )}
          </div>

          {/* Book Title (Auto-populated + Editable) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-stone-300">Book Title *</label>
              {title && <span className="text-[10px] text-amber-400/80 font-mono">Editable</span>}
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Mice Skating"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-900/90 border border-stone-800 rounded-xl text-sm text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-600 font-serif"
            />
          </div>

          {/* Author (Auto-populated + Editable) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-stone-300">Author</label>
              {author && <span className="text-[10px] text-amber-400/80 font-mono">Editable</span>}
            </div>
            <input
              type="text"
              placeholder="e.g. Annie Silvestro"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-900/90 border border-stone-800 rounded-xl text-sm text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-600 font-serif"
            />
          </div>

          {/* Holiday Note / Memory */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Holiday Memory / Note</label>
            <input
              type="text"
              placeholder="e.g. A favorite winter read with hot cocoa"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-900/90 border border-stone-800 rounded-xl text-sm text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-xl text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 text-amber-50 font-medium rounded-xl text-sm shadow-lg border border-amber-600/30 transition disabled:opacity-50"
            >
              {isSaving ? 'Placing on Shelf...' : 'Save to Shelf 🌲'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
