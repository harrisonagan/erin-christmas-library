import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cropUniformCover, cropToBoundingBox } from '../lib/imageCompressor';
import { pb, parseBookCoverWithAI, getGeminiApiKey, setGeminiApiKey } from '../lib/pocketbase';

export default function AddBookModal({ isOpen, onClose, onBookAdded }) {
  // Original photo as taken by user
  const [rawImageFile, setRawImageFile] = useState(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState(null);

  // Active image used for the frame (may be auto-cropped by AI)
  const [activeImageFile, setActiveImageFile] = useState(null);
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);
  const [isAutoCropped, setIsAutoCropped] = useState(false);
  const [detectedBox, setDetectedBox] = useState(null);

  // Cropper transform state
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Book metadata
  const [category, setCategory] = useState('story'); // 'story' | 'album' | 'cookbook'
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [notes, setNotes] = useState('');

  // AI & Save state
  const [isScanningAI, setIsScanningAI] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // API Key management
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [customKey, setCustomKey] = useState(() => getGeminiApiKey());
  const [keyError, setKeyError] = useState('');

  const previewFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startDragRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setRawImageFile(null);
      setRawPreviewUrl(null);
      setActiveImageFile(null);
      setActivePreviewUrl(null);
      setIsAutoCropped(false);
      setDetectedBox(null);
      setTitle('');
      setAuthor('');
      setNotes('');
      setAiStatus('');
      setShowKeyInput(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runCoverAnalysis = async (file) => {
    setIsScanningAI(true);
    setAiStatus('✨ Reading cover & detecting book edges with Gemini...');
    setKeyError('');

    try {
      const result = await parseBookCoverWithAI(file);

      if (result.title) setTitle(result.title);
      if (result.author) setAuthor(result.author);

      // Automatic high-precision background removal (crop to book edges)
      if (result.box_2d && Array.isArray(result.box_2d) && result.box_2d.length === 4) {
        setDetectedBox(result.box_2d);
        try {
          const cropped = await cropToBoundingBox(file, result.box_2d);
          if (cropped?.file) {
            setActiveImageFile(cropped.file);
            setActivePreviewUrl(cropped.previewUrl);
            setIsAutoCropped(true);
            setZoom(1.0);
            setPanX(0);
            setPanY(0);
            setAiStatus(`✨ Auto-cropped cover to book & read title!`);
            return;
          }
        } catch (cropErr) {
          console.warn('Auto-crop execution failed:', cropErr);
        }
      }

      if (result.title || result.author) {
        setAiStatus(`✨ Found: "${result.title || 'Book'}" by ${result.author || 'Author'}`);
      } else {
        setAiStatus('Please verify title & author below.');
      }
    } catch (err) {
      console.warn('AI cover reading error:', err);
      if (err.code === 'MISSING_KEY' || err.message?.includes('MISSING_KEY')) {
        setAiStatus('🔑 Gemini API key needed for auto-title & auto-crop.');
        setShowKeyInput(true);
      } else if (err.code === 'INVALID_KEY' || err.message?.includes('INVALID_KEY')) {
        setKeyError('Previous API key was revoked or invalid. Please paste a fresh key.');
        setAiStatus('⚠️ API key invalid or revoked.');
        setShowKeyInput(true);
      } else {
        setAiStatus('Could not auto-read text. Please enter title manually.');
      }
    } finally {
      setIsScanningAI(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setRawImageFile(file);
    setRawPreviewUrl(preview);
    setActiveImageFile(file);
    setActivePreviewUrl(preview);
    setIsAutoCropped(false);
    setDetectedBox(null);
    setZoom(1.0);
    setPanX(0);
    setPanY(0);

    await runCoverAnalysis(file);
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    if (!customKey.trim()) return;
    setGeminiApiKey(customKey.trim());
    setShowKeyInput(false);
    setKeyError('');
    if (rawImageFile) {
      await runCoverAnalysis(rawImageFile);
    }
  };

  const handleUndoAutoCrop = () => {
    if (rawImageFile && rawPreviewUrl) {
      setActiveImageFile(rawImageFile);
      setActivePreviewUrl(rawPreviewUrl);
      setIsAutoCropped(false);
      setZoom(1.15); // gentle zoom for raw photo
      setPanX(0);
      setPanY(0);
    }
  };

  const handleReapplyAutoCrop = async () => {
    if (rawImageFile && detectedBox) {
      const cropped = await cropToBoundingBox(rawImageFile, detectedBox);
      if (cropped?.file) {
        setActiveImageFile(cropped.file);
        setActivePreviewUrl(cropped.previewUrl);
        setIsAutoCropped(true);
        setZoom(1.0);
        setPanX(0);
        setPanY(0);
      }
    }
  };

  // Pan dragging
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    startDragRef.current = { x: clientX, y: clientY, panX, panY };
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

      // Crop image to standard 1:1.4 book cover
      const targetSource = activeImageFile || rawImageFile;
      if (targetSource) {
        const pWidth = previewFrameRef.current?.clientWidth || 144;
        const pHeight = previewFrameRef.current?.clientHeight || 208;

        const cropped = await cropUniformCover(targetSource, {
          zoom,
          panX,
          panY,
          previewWidth: pWidth,
          previewHeight: pHeight,
        });
        finalCoverFile = cropped.file;

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
        formData.append('category', category);
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
          author: author.trim() || (category === 'album' ? 'Family Photo Album' : category === 'cookbook' ? 'Holiday Recipes' : 'Unknown Author'),
          category: category,
          cover: finalCoverUrl || (category === 'album' ? 'https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=400&q=80'),
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
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
            <span>🌲</span> Add Christmas Book
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-xs text-amber-300/80 hover:text-amber-200 border border-amber-900/60 rounded-lg px-2 py-1 bg-amber-950/40"
              title="Configure Gemini API Key"
            >
              🔑 AI Key
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-100 text-lg px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Item Type Selector */}
        <div className="flex bg-stone-950/90 p-1 rounded-xl border border-stone-800 mb-3 text-xs font-sans">
          <button
            type="button"
            onClick={() => setCategory('story')}
            className={`flex-1 py-1.5 rounded-lg text-center font-medium transition flex items-center justify-center gap-1 ${
              category === 'story'
                ? 'bg-amber-700 text-amber-50 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>📖</span> <span>Storybook</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory('album')}
            className={`flex-1 py-1.5 rounded-lg text-center font-medium transition flex items-center justify-center gap-1 ${
              category === 'album'
                ? 'bg-amber-700 text-amber-50 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>📷</span> <span>Photo Album</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory('cookbook')}
            className={`flex-1 py-1.5 rounded-lg text-center font-medium transition flex items-center justify-center gap-1 ${
              category === 'cookbook'
                ? 'bg-amber-700 text-amber-50 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🥧</span> <span>Cookbook</span>
          </button>
        </div>

        <p className="text-xs text-stone-400 mb-3">
          {category === 'album'
            ? 'Add a Photo Album (e.g. Pictures with Santa, Year in Review). Once created, upload Apple Photos into it!'
            : category === 'cookbook'
            ? 'Add a Family Cookbook or Recipe Keepsake to the holiday shelf.'
            : 'Snap a cover photo. AI will auto-crop out the table/background and read title & author.'}
        </p>

        {/* Gemini API Key Box (inline expandable) */}
        <AnimatePresence>
          {showKeyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-amber-200 flex items-center gap-1">
                  <span>✨</span> Google Gemini API Key
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Get free key ↗
                </a>
              </div>
              <p className="text-[11px] text-stone-300 leading-tight">
                Stored privately in your browser (never committed to GitHub). Enables AI title reading and automatic background removal.
              </p>
              {keyError && <p className="text-rose-400 text-[11px]">{keyError}</p>}
              <form onSubmit={handleSaveApiKey} className="flex gap-2">
                <input
                  type="password"
                  placeholder="Paste AIzaSy... key"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-black/60 border border-stone-700 rounded-lg text-xs text-amber-100 font-mono focus:outline-none focus:border-amber-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-amber-50 font-semibold rounded-lg text-xs"
                >
                  Save Key
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Uniform Cover Framing Box */}
          <div className="flex flex-col items-center justify-center bg-[#140e0b] border-2 border-dashed border-amber-900/60 rounded-2xl p-4">
            {activePreviewUrl ? (
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
                    src={activePreviewUrl}
                    alt="Cover Preview"
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

                  {/* Corner Guide Marks */}
                  <div className="absolute top-1 left-1 text-[10px] text-amber-400/60 pointer-events-none">┌</div>
                  <div className="absolute top-1 right-1 text-[10px] text-amber-400/60 pointer-events-none">┐</div>
                  <div className="absolute bottom-1 left-1 text-[10px] text-amber-400/60 pointer-events-none">└</div>
                  <div className="absolute bottom-1 right-1 text-[10px] text-amber-400/60 pointer-events-none">┘</div>

                  {/* Spine Edge Highlight */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none z-10" />
                </div>

                {/* Auto-Crop Badge & Action */}
                <div className="flex items-center gap-2 mt-2">
                  {isAutoCropped ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>✂️</span> Table & background removed
                      </span>
                      <button
                        type="button"
                        onClick={handleUndoAutoCrop}
                        className="text-[11px] text-stone-400 hover:text-stone-200 underline"
                      >
                        Show original
                      </button>
                    </div>
                  ) : detectedBox ? (
                    <button
                      type="button"
                      onClick={handleReapplyAutoCrop}
                      className="text-[11px] bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 px-2.5 py-0.5 rounded-full"
                    >
                      ✂️ Auto-Crop to Book
                    </button>
                  ) : null}
                </div>

                {/* One-Tap Presets */}
                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => { setZoom(1.0); setPanX(0); setPanY(0); }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-sans transition ${
                      Math.abs(zoom - 1.0) < 0.05 ? 'bg-amber-800 text-white font-semibold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    1.0x Fit
                  </button>
                  <button
                    type="button"
                    onClick={() => { setZoom(1.15); setPanX(0); setPanY(0); }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-sans transition ${
                      Math.abs(zoom - 1.15) < 0.05 ? 'bg-amber-800 text-white font-semibold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    1.15x Trim
                  </button>
                  <button
                    type="button"
                    onClick={() => { setZoom(1.35); setPanX(0); setPanY(0); }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-sans transition ${
                      Math.abs(zoom - 1.35) < 0.05 ? 'bg-amber-800 text-white font-semibold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    1.35x Close
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPanX(0); setPanY(0); }}
                    className="px-2 py-1 rounded-lg text-[11px] font-sans bg-stone-900 text-stone-300 hover:bg-stone-800"
                    title="Center cover"
                  >
                    Center
                  </button>
                </div>

                {/* Fine Zoom Slider */}
                <div className="flex items-center gap-2.5 w-full max-w-xs mt-2 px-2">
                  <span className="text-[11px] text-stone-400">Zoom</span>
                  <input
                    type="range"
                    min="0.9"
                    max="2.2"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-600 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                  />
                  <span className="text-xs font-mono text-amber-200/80 w-8 text-right">{zoom.toFixed(1)}x</span>
                </div>

                <div className="mt-2 flex gap-3 text-xs">
                  <label className="text-amber-300 hover:text-amber-200 underline cursor-pointer">
                    Retake / Choose Another Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                  {rawImageFile && !isScanningAI && (
                    <button
                      type="button"
                      onClick={() => runCoverAnalysis(rawImageFile)}
                      className="text-stone-400 hover:text-amber-200 underline"
                    >
                      Re-scan with AI
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center py-6 px-4 text-center w-full">
                <span className="text-4xl mb-2">📸</span>
                <span className="text-sm font-semibold text-amber-200">Take or Upload Book Cover Photo</span>
                <span className="text-xs text-stone-400 mt-1">
                  AI will auto-crop out the background and read title & author
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
                <span>Scanning cover with Gemini AI...</span>
              </div>
            )}
            {!isScanningAI && aiStatus && (
              <div className="mt-2.5 px-3 py-1 bg-amber-950/60 border border-amber-800/40 rounded-full text-[11px] font-mono text-amber-200 flex items-center gap-1.5">
                <span>{aiStatus}</span>
              </div>
            )}
          </div>

          {/* Book Title */}
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

          {/* Author */}
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
