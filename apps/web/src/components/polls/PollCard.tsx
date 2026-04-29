'use client';

import { useState } from 'react';
import { BarChart2, Clock, Users } from 'lucide-react';
import type { Poll } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { pollsApi } from '@/lib/api';
import { timeAgo, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface PollCardProps {
  poll: Poll;
  familyId: string;
  onUpdate?: () => void;
}

export function PollCard({ poll, familyId, onUpdate }: PollCardProps) {
  const { user } = useAuthStore();
  const [voting, setVoting] = useState(false);

  const myVote = poll.votes?.find((v) => v.userId === user?.id);
  const totalVotes = poll.votes?.length ?? 0;
  const isExpired = poll.endsAt && new Date(poll.endsAt) < new Date();

  const vote = async (optionIndex: number) => {
    if (myVote || isExpired || voting) return;
    setVoting(true);
    try {
      await pollsApi.vote(familyId, poll.id, optionIndex);
      onUpdate?.();
    } finally {
      setVoting(false);
    }
  };

  const getCount = (index: number) =>
    poll.results?.[index]?.count ?? poll.votes?.filter((v) => v.optionIndex === index).length ?? 0;

  const getPercent = (index: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((getCount(index) / totalVotes) * 100);
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <h3 className="font-semibold text-gray-900">{poll.question}</h3>
        </div>
        {isExpired && <Badge variant="error">Closed</Badge>}
      </div>

      <div className="space-y-3 mb-4">
        {poll.options.map((option, i) => {
          const count = getCount(i);
          const percent = getPercent(i);
          const isSelected = myVote?.optionIndex === i;
          const showResults = !!myVote || isExpired;

          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={!!myVote || !!isExpired || voting}
              className={`w-full text-left rounded-lg border p-3 transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
              } disabled:cursor-default`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{option}</span>
                {showResults && <span className="text-sm text-gray-500">{percent}%</span>}
              </div>
              {showResults && (
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {totalVotes} votes</span>
        {poll.endsAt && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {isExpired ? 'Ended' : 'Ends'} {formatDate(poll.endsAt, 'PP')}
          </span>
        )}
        <span>By {poll.createdBy?.firstName} {poll.createdBy?.lastName} · {timeAgo(poll.createdAt)}</span>
      </div>
    </Card>
  );
}
