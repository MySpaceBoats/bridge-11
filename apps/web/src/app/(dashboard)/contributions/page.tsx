'use client';

import { useEffect, useState } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { useFamilyStore } from '@/store/family.store';
import { contributionsApi } from '@/lib/api';
import { ContributionCard } from '@/components/contributions/ContributionCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Contribution } from '@/types';

export default function ContributionsPage() {
  const { currentFamily } = useFamilyStore();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', targetAmount: '', currency: 'EUR' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!currentFamily) return;
    setLoading(true);
    try {
      setContributions(await contributionsApi.list(currentFamily.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentFamily?.id]);

  const handleCreate = async () => {
    if (!form.title.trim() || !currentFamily) return;
    setSaving(true);
    try {
      await contributionsApi.create(currentFamily.id, {
        title: form.title.trim(),
        description: form.description || undefined,
        targetAmount: form.targetAmount ? parseFloat(form.targetAmount) : undefined,
        currency: form.currency,
      });
      setShowCreate(false);
      setForm({ title: '', description: '', targetAmount: '', currency: 'EUR' });
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-brand-500" />
          <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> New Collection
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : contributions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Wallet className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-medium">No collections yet</p>
          <p className="text-sm mt-1">Start a collection to fund your next family event!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contributions.map((c) => (
            <ContributionCard key={c.id} contribution={c} familyId={currentFamily!.id} onUpdate={load} />
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Collection">
        <div className="space-y-4">
          <Input
            label="Title *"
            placeholder="Birthday Gift for Dad"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Description"
            placeholder="What is this collection for?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Goal Amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="500.00"
              value={form.targetAmount}
              onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="XOF">XOF (CFA)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
