import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isFirebaseConfigured, saveFirebaseConfig, initFirebase } from '../lib/firebase';
import { getBooksFromIndexedDB } from '../lib/idbStorage';

export default function CloudBackupModal({ isOpen, onClose, books, onBooksRestored }) {
  const [configText, setConfigText] = useState('');
  const [isCloudActive, setIsCloudActive] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('cloud'); // 'cloud' | 'backup'

  useEffect(() => {
    setIsCloudActive(isFirebaseConfigured());
    const stored = localStorage.getItem('erin_firebase_config');
    if (stored) {
      try {
        setConfigText(JSON.stringify(JSON.parse(stored), null, 2));
      } catch (e) {
        setConfigText(stored);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveFirebase = (e) => {
    e.preventDefault();
    setSaveStatus('');

    try {
      let parsed = null;
      const trimmed = configText.trim();
      if (!trimmed) {
        saveFirebaseConfig(null);
        setIsCloudActive(false);
        setSaveStatus('Firebase disconnected. Operating on resilient local storage.');
        return;
      }

      // Handle JSON format
      if (trimmed.startsWith('{')) {
        parsed = JSON.parse(trimmed);
      } else {
        // Handle JS snippet copy-paste: const firebaseConfig = { ... };
        const match = trimmed.match(/\{[\s\S]*\}/);
        if (match) {
          // Convert JS object keys to valid JSON format if unquoted
          const jsonLike = match[0]
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
            .replace(/'/g, '"');
          parsed = JSON.parse(jsonLike);
        }
      }

      if (!parsed || !parsed.projectId) {
        throw new Error('Missing projectId in configuration');
      }

      saveFirebaseConfig(parsed);
      const { db } = initFirebase();
      if (db) {
        setIsCloudActive(true);
        setSaveStatus('✅ Connected to Google Firebase Cloud successfully!');
      } else {
        setSaveStatus('⚠️ Config saved, but could not initialize Firebase.');
      }
    } catch (err) {
      setSaveStatus('❌ Error parsing config: ' + err.message);
    }
  };

  const handleExportBackup = () => {
    try {
      const dataStr = JSON.stringify({
        exportedAt: new Date().toISOString(),
        version: '1.0',
        books: books,
      }, null, 2);

      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `erin-christmas-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error creating backup: ' + err.message);
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const importedBooks = parsed.books || parsed;
        if (Array.isArray(importedBooks) && importedBooks.length > 0) {
          if (confirm(`Restore ${importedBooks.length} books from backup? This will merge with your existing library.`)) {
            onBooksRestored(importedBooks);
            alert(`Successfully restored ${importedBooks.length} books!`);
            onClose();
          }
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Error reading backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1b1410] border border-amber-900/60 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl text-amber-50 font-sans relative my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-amber-950 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">☁️</span>
            <div>
              <h3 className="text-lg font-serif font-bold text-amber-100">
                Cloud Backup & Security
              </h3>
              <p className="text-[11px] text-amber-400/80">
                Google Firebase & Offline Resiliency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-amber-200 text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mb-4 bg-stone-950/80 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'cloud'
                ? 'bg-amber-800 text-amber-100 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            🔥 Google Firebase
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'backup'
                ? 'bg-amber-800 text-amber-100 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            💾 Export / Drive Backup
          </button>
        </div>

        {/* Tab 1: Google Firebase */}
        {activeTab === 'cloud' && (
          <div className="space-y-4 text-xs">
            <div className={`p-3 rounded-xl border ${
              isCloudActive 
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' 
                : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                <span>{isCloudActive ? '✅' : 'ℹ️'}</span>
                <span>{isCloudActive ? 'Cloud Sync Connected' : 'Local Resilient Mode Active'}</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-300 leading-relaxed">
                {isCloudActive 
                  ? 'All books and covers are backed up to Google Cloud Storage & Firestore. Changes sync live across all family devices.'
                  : 'Your books are stored in browser IndexedDB (high capacity, no 5MB limit). To sync across devices and back up permanently to Google Cloud, paste your Firebase config below.'}
              </p>
            </div>

            <form onSubmit={handleSaveFirebase} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-amber-200/90 mb-1">
                  Firebase Web Configuration
                </label>
                <textarea
                  rows={6}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "...",\n  "projectId": "...",\n  "storageBucket": "...",\n  "appId": "..."\n}`}
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-amber-100 font-mono focus:outline-none focus:border-amber-600 leading-relaxed"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  💡 Get this from your Firebase Console under Project Settings → "Your apps" → Web app.
                </p>
              </div>

              {saveStatus && (
                <div className="text-xs p-2 rounded-lg bg-stone-900 border border-stone-800">
                  {saveStatus}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 text-white rounded-xl font-semibold shadow transition active:scale-95"
                >
                  Save & Connect Firebase
                </button>
                {isCloudActive && (
                  <button
                    type="button"
                    onClick={() => {
                      saveFirebaseConfig(null);
                      setConfigText('');
                      setIsCloudActive(false);
                      setSaveStatus('Disconnected Firebase.');
                    }}
                    className="px-3 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-red-300 rounded-xl transition"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Export / Drive Backup */}
        {activeTab === 'backup' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-xl text-stone-300 space-y-1.5">
              <h4 className="font-semibold text-amber-200">Independent Personal Backup</h4>
              <p className="text-[11px] leading-relaxed">
                You can download a full snapshot of Erin's library anytime and save it into your Google Drive, iCloud, or computer files.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 border border-amber-900/60 hover:border-amber-700 text-amber-100 rounded-xl font-semibold flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>💾</span>
                <span>Download Library Backup File (.json)</span>
              </button>

              <div className="pt-2 border-t border-stone-800">
                <label className="block text-[11px] text-stone-400 mb-2">
                  Restore from an existing backup file:
                </label>
                <label className="w-full py-2.5 bg-stone-950 hover:bg-stone-900 border border-stone-800 rounded-xl text-stone-300 hover:text-amber-100 cursor-pointer flex items-center justify-center gap-2 transition">
                  <span>📂</span>
                  <span>Select Backup File to Restore</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
