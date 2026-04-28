'use client';

import { useEffect, useState } from 'react';
import { BarChart2, Plus, X } from 'lucide-react';
import { useFamilyStore } from '@/store/family.store';
import { pollsApi } from '@/lib/api';
import { PollCard } from '@/components/polls/PollCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Poll } from '@/types';

export default function PollsPage() {
  const { currentFamily } = useFamilyStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ question: '', options: ['', ''], endsAt: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!currentFamily) return;
    setLoading(true);
    try {
      setPolls(await pollsApi.list(currentFamily.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentFamily?.id]);

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, ''] }));
  const removeOption = (i: number) =>
    setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));
  const setOption = (i: number, val: string) =>
    setForm((f) => { const opts = [...f.options]; opts[i] = val; return { ...f, options: opts }; });

  const handleCreate = async () => {
    const options = form.options.filter((o) => o.trim());
    if (!form.question.trim() || options.length < 2 || !currentFamily) return;
    setSaving(true);
    try {
      await pollsApi.create(currentFamily.id, {
        question: form.question.trim(),
        options,
        endsAt: form.endsAt || undefined,
      });
      setShowCreate(false);
      setForm({ question: '', options: ['', ''], endsAt: '' });
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-brand-500" />
          <h1 className="text-2xl font-bold text-gray-900">Polls</h1>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> New Poll
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : polls.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BarChart2 className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-medium">No polls yet</p>
          <p className="text-sm mt-1">Create a poll to help your family decide!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} familyId={currentFamily!.id} onUpdate={load} />
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Poll" size="md">
        <div className="space-y-4">
          <Input
            label="Question *"
            placeholder="Which date works for the reunion?"
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Options *</label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    className="flex-1"
                  />
                  {form.options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addOption} className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add option
              </button>
            </div>
          </div>

          <Input
            label="End Date (optional)"
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create Poll</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
