'use client';

import { useEffect, useState, useRef } from 'react';
import { Image as ImageIcon, Plus, Upload, FolderOpen } from 'lucide-react';
import NextImage from 'next/image';
import { useFamilyStore } from '@/store/family.store';
import { mediaApi } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Album } from '@/types';

export default function AlbumsPage() {
  const { currentFamily } = useFamilyStore();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!currentFamily) return;
    setLoading(true);
    try {
      const data = await mediaApi.getAlbums(currentFamily.id);
      setAlbums(data);
    } finally {
      setLoading(false);
    }
  };

  const loadAlbum = async (album: Album) => {
    if (!currentFamily) return;
    const detail = await mediaApi.getAlbum(currentFamily.id, album.id);
    setSelectedAlbum(detail);
  };

  useEffect(() => { load(); }, [currentFamily?.id]);

  const createAlbum = async () => {
    if (!albumName.trim() || !currentFamily) return;
    setCreating(true);
    try {
      await mediaApi.createAlbum(currentFamily.id, albumName.trim());
      setAlbumName('');
      setShowCreate(false);
      await load();
    } finally {
      setCreating(false);
    }
  };

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentFamily || !selectedAlbum) return;
    setUploading(true);
    try {
      for (const file of Array.from(e.target.files)) {
        await mediaApi.uploadMedia(currentFamily.id, file, selectedAlbum.id);
      }
      await loadAlbum(selectedAlbum);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {selectedAlbum ? (
            <button onClick={() => setSelectedAlbum(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
              <ImageIcon className="w-6 h-6 text-brand-500" />
            </button>
          ) : (
            <ImageIcon className="w-6 h-6 text-brand-500" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedAlbum ? selectedAlbum.name : 'Albums'}
          </h1>
        </div>
        <div className="flex gap-2">
          {selectedAlbum && (
            <>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={uploadFiles} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>
                <Upload className="w-4 h-4" /> Upload
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAlbum(null)}>
                ← Albums
              </Button>
            </>
          )}
          {!selectedAlbum && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> New Album
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : selectedAlbum ? (
        <div>
          {(selectedAlbum.media?.length ?? 0) === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Upload className="w-12 h-12 mx-auto mb-3" />
              <p>No photos yet. Upload some!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedAlbum.media!.map((m) => (
                <div key={m.id} className="aspect-square relative rounded-xl overflow-hidden bg-gray-200 group">
                  <NextImage src={m.url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${m.url}` : m.url} alt={m.name ?? ''} fill className="object-cover group-hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-medium">No albums yet</p>
          <p className="text-sm mt-1">Create an album to start sharing memories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((album) => (
            <button key={album.id} onClick={() => loadAlbum(album)} className="group text-left">
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 mb-2">
                {album.coverUrl ? (
                  <NextImage
                    src={album.coverUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${album.coverUrl}` : album.coverUrl}
                    alt={album.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FolderOpen className="w-10 h-10 text-gray-300" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{album.name}</p>
              {album.event && <p className="text-xs text-gray-500 truncate">{album.event.title}</p>}
            </button>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Album">
        <div className="space-y-4">
          <Input
            label="Album Name"
            placeholder="Summer 2025, Wedding..."
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createAlbum} loading={creating}>Create Album</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
