'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, ArrowLeft, Users } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useFamilyStore } from '@/store/family.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Event } from '@/types';

const statusColor: Record<string, any> = {
  going: 'success', not_going: 'error', maybe: 'warning',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentFamily } = useFamilyStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [responding, setResponding] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await eventsApi.get(currentFamily!.id, id);
      setEvent(data);
    } catch {
      router.push('/events');
    }
  };

  useEffect(() => { if (currentFamily) load(); }, [id, currentFamily?.id]);

  const respond = async (status: string) => {
    if (!currentFamily || !event) return;
    setResponding(status);
    try {
      await eventsApi.respond(currentFamily.id, event.id, status);
      await load();
    } finally {
      setResponding(null);
    }
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const myStatus = event.participations?.find((p) => p.userId === user?.id)?.status;
  const goingList = event.participations?.filter((p) => p.status === 'going') ?? [];
  const maybeList = event.participations?.filter((p) => p.status === 'maybe') ?? [];
  const notGoingList = event.participations?.filter((p) => p.status === 'not_going') ?? [];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <button onClick={() => router.push('/events')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h1>
        <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-500" />
            {formatDate(event.startDate, 'PPPp')}
            {event.endDate && <> → {formatDate(event.endDate, 'PPPp')}</>}
          </span>
          {event.location && (
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500" />
              {event.location}
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-gray-700 mb-6">{event.description}</p>
        )}

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Your response:</span>
          {myStatus && <Badge variant={statusColor[myStatus]}>{myStatus.replace('_', ' ')}</Badge>}
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant={myStatus === 'going' ? 'primary' : 'outline'}
            onClick={() => respond('going')}
            loading={responding === 'going'}
          >
            ✓ Going
          </Button>
          <Button
            size="sm"
            variant={myStatus === 'maybe' ? 'secondary' : 'outline'}
            onClick={() => respond('maybe')}
            loading={responding === 'maybe'}
          >
            ? Maybe
          </Button>
          <Button
            size="sm"
            variant={myStatus === 'not_going' ? 'danger' : 'outline'}
            onClick={() => respond('not_going')}
            loading={responding === 'not_going'}
          >
            ✕ Can't make it
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: `Going (${goingList.length})`, list: goingList, color: 'text-green-600' },
          { label: `Maybe (${maybeList.length})`, list: maybeList, color: 'text-yellow-600' },
          { label: `Not Going (${notGoingList.length})`, list: notGoingList, color: 'text-red-600' },
        ].map(({ label, list, color }) => (
          <Card key={label} padding="sm">
            <p className={`text-sm font-semibold mb-3 ${color}`}>{label}</p>
            <div className="space-y-2">
              {list.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <Avatar src={p.user?.avatarUrl} firstName={p.user?.firstName ?? ''} lastName={p.user?.lastName ?? ''} size="xs" />
                  <span className="text-sm text-gray-700 truncate">
                    {p.user?.firstName} {p.user?.lastName}
                  </span>
                </div>
              ))}
              {list.length === 0 && <p className="text-xs text-gray-400">No responses</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
