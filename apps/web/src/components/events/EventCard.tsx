'use client';

import { Calendar, MapPin, Users, Check, X, HelpCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Event } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { eventsApi } from '@/lib/api';
import { useState } from 'react';

interface EventCardProps {
  event: Event;
  familyId: string;
  currentUserId: string;
  onUpdate?: () => void;
}

export function EventCard({ event, familyId, currentUserId, onUpdate }: EventCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const myStatus = event.participations?.find((p) => p.userId === currentUserId)?.status;
  const going = event.participations?.filter((p) => p.status === 'going') ?? [];

  const respond = async (status: string) => {
    setLoading(status);
    try {
      await eventsApi.respond(familyId, event.id, status);
      onUpdate?.();
    } finally {
      setLoading(null);
    }
  };

  const statusBadge: Record<string, { label: string; variant: any }> = {
    going: { label: 'Going', variant: 'success' },
    not_going: { label: 'Not Going', variant: 'error' },
    maybe: { label: 'Maybe', variant: 'warning' },
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
            {myStatus && <Badge variant={statusBadge[myStatus].variant}>{statusBadge[myStatus].label}</Badge>}
          </div>

          <div className="flex flex-col gap-1 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(parseISO(event.startDate), 'PPP p')}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </span>
            )}
            {going.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {going.length} going
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
          )}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={myStatus === 'going' ? 'primary' : 'outline'}
              onClick={() => respond('going')}
              loading={loading === 'going'}
            >
              <Check className="w-3.5 h-3.5" /> Going
            </Button>
            <Button
              size="sm"
              variant={myStatus === 'maybe' ? 'secondary' : 'outline'}
              onClick={() => respond('maybe')}
              loading={loading === 'maybe'}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Maybe
            </Button>
            <Button
              size="sm"
              variant={myStatus === 'not_going' ? 'danger' : 'outline'}
              onClick={() => respond('not_going')}
              loading={loading === 'not_going'}
            >
              <X className="w-3.5 h-3.5" /> No
            </Button>
          </div>
        </div>

        {going.length > 0 && (
          <div className="flex -space-x-2">
            {going.slice(0, 4).map((p) => (
              <Avatar key={p.id} src={p.user?.avatarUrl} firstName={p.user?.firstName ?? ''} lastName={p.user?.lastName ?? ''} size="xs" className="border-2 border-white" />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
