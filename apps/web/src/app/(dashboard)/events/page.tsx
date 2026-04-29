'use client';

import { useEffect, useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { useFamilyStore } from '@/store/family.store';
import { useAuthStore } from '@/store/auth.store';
import { eventsApi } from '@/lib/api';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Event } from '@/types';

export default function EventsPage() {
  const { currentFamily } = useFamilyStore();
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!currentFamily) return;
    setLoading(true);
    try {
      const data = await eventsApi.list(currentFamily.id);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentFamily?.id]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.startDate || !currentFamily) return;
    setSaving(true);
    try {
      await eventsApi.create(currentFamily.id, form);
      setShowCreate(false);
      setForm({ title: '', description: '', startDate: '', endDate: '', location: '' });
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-brand-500" />
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-medium">No events yet</p>
          <p className="text-sm mt-1">Create the first event for your family!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              familyId={currentFamily!.id}
              currentUserId={user?.id ?? ''}
              onUpdate={load}
            />
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Event">
        <div className="space-y-4">
          <Input
            label="Title *"
            placeholder="Family Reunion 2025"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Description"
            placeholder="What's this event about?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date *"
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <Input
              label="End Date"
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <Input
            label="Location"
            placeholder="Paris, France"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create Event</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
