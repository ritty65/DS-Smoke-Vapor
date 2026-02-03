import React, { useMemo, useState } from 'react';
import store from '../data/store.json';

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY ?? 'admin';

export const AdminPage = () => {
  const [accessKey, setAccessKey] = useState('');
  const [authed, setAuthed] = useState(() => localStorage.getItem('ds-admin') === 'true');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [collection, setCollection] = useState<'inventory' | 'flowerStrains'>('inventory');
  const [category, setCategory] = useState(Object.keys(store.inventory)[0]);
  const [itemName, setItemName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const inventoryItems = useMemo(
    () => (category ? store.inventory[category] ?? [] : []),
    [category]
  );
  const flowerItems = store.flowerStrains ?? [];

  const handleLogin = () => {
    if (accessKey.trim() === ADMIN_KEY) {
      localStorage.setItem('ds-admin', 'true');
      setAuthed(true);
      setAccessKey('');
    } else {
      setUploadStatus('Incorrect admin key.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadStatus('Uploading...');
    setUploadUrl('');
    setSaveStatus('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: selectedFile.name,
            dataUrl: reader.result
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? 'Upload failed.');
        }
        setUploadUrl(data.url);
        setUploadStatus('Upload complete.');
      } catch (error: any) {
        setUploadStatus(error?.message ?? 'Upload failed.');
      }
    };
    reader.onerror = () => setUploadStatus('Could not read file.');
    reader.readAsDataURL(selectedFile);
  };

  const handleSave = async () => {
    if (!uploadUrl || !itemName) return;
    setSaveStatus('Saving...');
    try {
      const response = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection,
          category: collection === 'inventory' ? category : undefined,
          itemName,
          imageUrl: uploadUrl
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Save failed.');
      }
      setSaveStatus('Saved! Refresh the site to see the update.');
    } catch (error: any) {
      setSaveStatus(error?.message ?? 'Save failed.');
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
          <p className="text-sm text-gray-400 mb-6">
            Enter the admin key to manage images. Configure <span className="text-purple-400">VITE_ADMIN_KEY</span> for
            production access.
          </p>
          <input
            type="password"
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors mb-4"
            placeholder="Admin key"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Unlock
          </button>
          {uploadStatus && <p className="text-sm text-red-400 mt-4">{uploadStatus}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-4xl font-black brand-font mb-2">Admin Uploads</h1>
          <p className="text-gray-400">Upload new product or flower images and store the URLs.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold">1. Upload Image</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="bg-white text-black font-bold px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload to Cloudinary
          </button>
          {uploadStatus && <p className="text-sm text-gray-300">{uploadStatus}</p>}
          {uploadUrl && (
            <div className="text-sm text-green-400 break-all">
              URL: <span className="text-white">{uploadUrl}</span>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold">2. Attach to Catalog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-gray-300 space-y-2">
              <span className="block font-semibold">Collection</span>
              <select
                value={collection}
                onChange={(event) => setCollection(event.target.value as 'inventory' | 'flowerStrains')}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white"
              >
                <option value="inventory">Inventory</option>
                <option value="flowerStrains">Flower Strains</option>
              </select>
            </label>

            {collection === 'inventory' && (
              <label className="text-sm text-gray-300 space-y-2">
                <span className="block font-semibold">Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white"
                >
                  {Object.keys(store.inventory).map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <label className="text-sm text-gray-300 space-y-2">
            <span className="block font-semibold">Item</span>
            <select
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white"
            >
              <option value="">Select item</option>
              {(collection === 'inventory' ? inventoryItems : flowerItems).map((item: any) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={handleSave}
            disabled={!uploadUrl || !itemName}
            className="bg-purple-600 text-white font-bold px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save URL to Data Store
          </button>
          {saveStatus && <p className="text-sm text-gray-300">{saveStatus}</p>}
        </div>
      </div>
    </div>
  );
};
