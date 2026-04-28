'use client';

import { Bell, Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useFamilyStore } from '@/store/family.store';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { families, currentFamily, setCurrentFamily, createFamily } = useFamilyStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await createFamily(newName.trim());
      setNewName('');
      setShowCreate(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-30">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

        <div className="flex items-center gap-3">
          {/* Family switcher */}
          {families.length > 0 && (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
                <span className="max-w-[120px] truncate">{currentFamily?.name}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[180px] hidden group-hover:block">
                {families.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCurrentFamily(f)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 truncate"
                  >
                    {f.name}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => setShowCreate(true)}
                    className="w-full text-left px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" /> New Family
                  </button>
                </div>
              </div>
            </div>
          )}

          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Family">
        <div className="space-y-4">
          <Input
            label="Family Name"
            placeholder="e.g. The Johnson Family"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={loading}>Create Family</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
