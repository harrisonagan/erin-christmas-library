import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cropUniformCover, cropToBoundingBox, autoTrimTableBorders } from '../lib/imageCompressor';
import { parseBookCoverWithAI } from '../lib/pocketbase';
import { isFirebaseConfigured, uploadCoverToCloud, saveBookToCloud } from '../lib/firebase';

export default function AddBookModal({ isOpen, onClose, onBookAdded, initialCategory = 'story' }) {
  const [activeImageFile, setActiveImageFile] = useState(null);
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);
  const [rotation, setRotation] = useState(0);

  // Live Auto-Capture Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [steadyProgress, setSteadyProgress] = useState(0);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const prevFrameRef = useRef(null);
  const steadyTicksRef = useRef(0);

  // Book metadata
  const [category, setCategory] = useState(initialCategory || 'story');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [notes, setNotes] = useState('');

  // AI & Save state
  const [isScanningAI, setIsScanningAI] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialCategory) {
      setCategory(initialCategory);
    }
  }, [isOpen, initialCategory]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setSteadyProgress(0);
    steadyTicksRef.current = 0;
    prevFrameRef.current = null;
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setActiveImageFile(null);
      setActivePreviewUrl(null);
      setRotation(0);
      setTitle('');
      setAuthor('');
      setNotes('');
      setAiStatus('');
      setCameraError('');
    }
    return () => stopCamera();
  }, [isOpen]);

  // Start live camera with automatic steady-frame capture
  const startAutoCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1440 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      steadyTicksRef.current = 0;
      prevFrameRef.current = null;
      setSteadyProgress(0);
    } catch (err) {
      setCameraError('Could not access camera directly. Please use the photo button below.');
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  // Monitor camera frames and auto-snap when the book is held steady
  useEffect(() => {
    if (!isCameraActive) return;

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 48;
    sampleCanvas.height = 48;
    const sampleCtx = sampleCanvas.getContext('2d');

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) return;

      sampleCtx.drawImage(video, 0, 0, 48, 48);
      const data = sampleCtx.getImageData(0, 0, 48, 48).data;

      // Compute grayscale & check that frame isn't blank/dark
      const gray = new Uint8Array(48 * 48);
      let sum = 0;
      let sumSq = 0;
      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        const g = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
        gray[p] = g;
        sum += g;
        sumSq += g * g;
      }
      const mean = sum / gray.length;
      const variance = sumSq / gray.length - mean * mean;

      if (prevFrameRef.current && variance > 250) {
        let diffSum = 0;
        for (let p = 0; p < gray.length; p++) {
          diffSum += Math.abs(gray[p] - prevFrameRef.current[p]);
        }
        const avgDiff = diffSum / gray.length;

        // Held steady (< 4.5 average pixel change per 220ms tick)
        if (avgDiff < 4.5) {
          steadyTicksRef.current += 1;
        } else {
          steadyTicksRef.current = Math.max(0, steadyTicksRef.current - 1);
        }

        const progress = Math.min(100, Math.round((steadyTicksRef.current / 5) * 100));
        setSteadyProgress(progress);

        if (steadyTicksRef.current >= 5) {
          clearInterval(interval);
          captureFrameFromVideo();
        }
      }

      prevFrameRef.current = gray;
    }, 220);

    return () => clearInterval(interval);
  }, [isCameraActive]);

  const captureFrameFromVideo = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    stopCamera();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `book_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        processSelectedFile(file);
      },
      'image/jpeg',
      0.92
    );
  };

  const processSelectedFile = async (file) => {
    if (!file) return;
    stopCamera();

    const initialPreview = URL.createObjectURL(file);
    setActiveImageFile(file);
    setActivePreviewUrl(initialPreview);
    setRotation(0);

    // 1. Instant client-side background & wood-table slicer
    let workingFile = file;
    try {
      const trimmed = await autoTrimTableBorders(file);
      if (trimmed?.file) {
        workingFile = trimmed.file;
        setActiveImageFile(trimmed.file);
        setActivePreviewUrl(trimmed.previewUrl);
      }
    } catch (e) {}

    // 2. AI Title, Author & precision cover boundary detection
    setIsScanningAI(true);
    setAiStatus('✨ Reading title & author...');

    try {
      const result = await parseBookCoverWithAI(file);

      if (result.title) setTitle(result.title);
      if (result.author) setAuthor(result.author);

      if (result.box_2d && Array.isArray(result.box_2d) && result.box_2d.length === 4) {
        try {
          const cropped = await cropToBoundingBox(file, result.box_2d);
          if (cropped?.file) {
            setActiveImageFile(cropped.file);
            setActivePreviewUrl(cropped.previewUrl);
          }
        } catch (e) {}
      }

      if (result.title) {
        setAiStatus(`✨ Recognized "${result.title}"`);
      } else {
        setAiStatus('Cover cropped — enter title below');
      }
    } catch (err) {
      setAiStatus('Cover cropped — enter title below');
    } finally {
      setIsScanningAI(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  if (!isOpen) return null;

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

      if (activeImageFile) {
        const prepared = await cropUniformCover(activeImageFile, { rotation });
        finalCoverFile = prepared.file;

        finalCoverUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(prepared.file);
        });
      }

      const bookId = 'book_' + Date.now();
      let coverUrl =
        finalCoverUrl ||
        (category === 'album'
          ? 'https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=400&q=80');
      let coverStoragePath = null;

      if (isFirebaseConfigured() && finalCoverFile) {
        try {
          setAiStatus('☁️ Saving cover to Cloud...');
          const cloudResult = await uploadCoverToCloud(finalCoverFile, bookId);
          coverUrl = cloudResult.downloadUrl;
          coverStoragePath = cloudResult.storagePath;
        } catch (cloudErr) {
          console.warn('Cloud cover upload fallback to local:', cloudErr);
        }
      }

      const bookRecord = {
        id: bookId,
        title: title.trim(),
        author:
          author.trim() ||
          (category === 'album' ? 'Family Photo Album' : category === 'cookbook' ? 'Holiday Recipes' : 'Unknown'),
        category,
        badge: category === 'cookbook' ? 'Cookbook' : null,
        cover: coverUrl,
        coverStoragePath,
        notes: notes.trim(),
        pages: [],
        createdAt: Date.now(),
      };

      if (isFirebaseConfigured()) {
        try {
          await saveBookToCloud(bookRecord);
        } catch (e) {}
      }

      onBookAdded(bookRecord);
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
            <span>🌲</span> Add Christmas Book
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-100 text-lg px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>

        {/* Item Type Selector */}
        <div className="flex bg-stone-950/90 p-1 rounded-xl border border-stone-800 mb-4 text-xs font-sans">
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

        <form onSubmit={handleSave} className="space-y-4">
          {/* Cover Capture / Preview Stage */}
          <div className="flex flex-col items-center justify-center bg-[#140e0b] border-2 border-dashed border-amber-900/60 rounded-2xl p-4">
            {isCameraActive ? (
              <div className="flex flex-col items-center w-full">
                <div
                  onClick={captureFrameFromVideo}
                  className="relative w-full max-w-xs aspect-[3/4] rounded-xl overflow-hidden border-2 border-amber-500/80 shadow-2xl bg-black cursor-pointer"
                >
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                  {/* Framing Guide Box */}
                  <div className="absolute inset-4 border-2 border-amber-300/60 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                    <span className="text-[10px] bg-black/70 text-amber-200 px-2 py-0.5 rounded-full self-center">
                      {steadyProgress > 0
                        ? `Hold steady... Auto-capturing (${steadyProgress}%)`
                        : 'Center book cover in frame (auto-snaps when steady)'}
                    </span>
                    {steadyProgress > 0 && (
                      <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 transition-all duration-200"
                          style={{ width: `${steadyProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={captureFrameFromVideo}
                    className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded-full text-xs font-semibold shadow"
                  >
                    📸 Snap Now
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-full text-xs"
                  >
                    Cancel Camera
                  </button>
                </div>
              </div>
            ) : activePreviewUrl ? (
              <div className="flex flex-col items-center w-full">
                <div className="relative inline-flex items-center justify-center rounded-lg overflow-hidden shadow-2xl border border-amber-700/70 bg-[#140c08]">
                  <img
                    src={activePreviewUrl}
                    alt="Cover Preview"
                    className="max-h-56 max-w-[200px] w-auto h-auto object-contain block transition-transform"
                    style={{
                      transform: rotation ? `rotate(${rotation}deg)` : undefined,
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-200 flex items-center gap-1"
                  >
                    <span>🔄</span> <span>Rotate</span>
                  </button>

                  <button
                    type="button"
                    onClick={startAutoCamera}
                    className="text-amber-300 hover:text-amber-200 underline"
                  >
                    Retake with Auto-Camera
                  </button>

                  <label className="text-stone-400 hover:text-stone-200 underline cursor-pointer">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 px-2 text-center w-full gap-3">
                <button
                  type="button"
                  onClick={startAutoCamera}
                  className="w-full py-4 px-4 bg-gradient-to-r from-amber-800/80 via-amber-700/80 to-amber-800/80 hover:from-amber-700 hover:to-amber-600 border border-amber-500/40 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg transition"
                >
                  <span className="text-3xl">📸</span>
                  <span className="text-sm font-semibold text-amber-100">
                    Auto-Take Book Picture
                  </span>
                  <span className="text-[11px] text-amber-200/80">
                    Point at the book — automatically snaps, crops & reads Title & Author
                  </span>
                </button>

                {cameraError && (
                  <p className="text-[11px] text-amber-300/90">{cameraError}</p>
                )}

                <label className="cursor-pointer text-xs text-stone-400 hover:text-amber-200 underline">
                  Or select a photo from your device / camera roll
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            )}

            {/* AI Status Indicator */}
            {isScanningAI && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-300 font-mono animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>{aiStatus || 'Reading cover...'}</span>
              </div>
            )}
            {!isScanningAI && aiStatus && (
              <div className="mt-2.5 px-3 py-1 bg-amber-950/60 border border-amber-800/40 rounded-full text-[11px] font-mono text-amber-200">
                {aiStatus}
              </div>
            )}
          </div>

          {/* Book Title */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Book Title *</label>
            <input
              type="text"
              required
              placeholder="Automatically filled from photo (or type here)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-900/90 border border-stone-800 rounded-xl text-sm text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-600 font-serif"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Author</label>
            <input
              type="text"
              placeholder="Automatically filled (or Unknown)"
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
              placeholder="Optional note or edition details"
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
              disabled={isSaving || isScanningAI}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 text-amber-50 font-medium rounded-xl text-sm shadow-lg border border-amber-600/30 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Add to Shelf'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
