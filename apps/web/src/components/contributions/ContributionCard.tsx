'use client';

import { useState } from 'react';
import { Wallet, Users, TrendingUp } from 'lucide-react';
import type { Contribution } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { contributionsApi } from '@/lib/api';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface ContributionCardProps {
  contribution: Contribution;
  familyId: string;
  onUpdate?: () => void;
}

export function ContributionCard({ contribution, familyId, onUpdate }: ContributionCardProps) {
  const { user } = useAuthStore();
  const [showPledge, setShowPledge] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const totalPledged = contribution.payments?.reduce((s, p) => s + Number(p.promisedAmount), 0) ?? 0;
  const totalPaid = contribution.payments?.reduce((s, p) => s + Number(p.paidAmount), 0) ?? 0;
  const myPayment = contribution.payments?.find((p) => p.userId === user?.id);
  const progress = contribution.targetAmount ? (totalPaid / contribution.targetAmount) * 100 : 0;
  const currency = contribution.currency ?? 'EUR';

  const handlePledge = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    setLoading(true);
    try {
      await contributionsApi.pledge(familyId, contribution.id, { promisedAmount: num });
      setShowPledge(false);
      setAmount('');
      onUpdate?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{contribution.title}</h3>
            {contribution.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{contribution.description}</p>
            )}
          </div>
          {myPayment && <Badge variant="success">Pledged</Badge>}
        </div>

        {contribution.targetAmount && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1.5">
              <span>{formatCurrency(totalPaid, currency)} paid</span>
              <span>Goal: {formatCurrency(contribution.targetAmount, currency)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {contribution.payments?.length ?? 0} contributors
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {formatCurrency(totalPledged, currency)} pledged
            </span>
          </div>

          {!myPayment && (
            <Button size="sm" onClick={() => setShowPledge(true)}>
              Pledge
            </Button>
          )}
        </div>
      </Card>

      <Modal open={showPledge} onClose={() => setShowPledge(false)} title={`Pledge to "${contribution.title}"`}>
        <div className="space-y-4">
          <Input
            label={`Amount (${currency})`}
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPledge(false)}>Cancel</Button>
            <Button onClick={handlePledge} loading={loading}>Confirm Pledge</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
