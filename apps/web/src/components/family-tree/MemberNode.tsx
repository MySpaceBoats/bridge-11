'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

export const MemberNode = memo(({ data }: NodeProps) => (
  <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 shadow-sm min-w-[140px] text-center cursor-default hover:border-brand-400 transition-colors">
    <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-brand-400" />

    <div className="flex flex-col items-center gap-2">
      <Avatar
        src={data.avatarUrl}
        firstName={data.firstName}
        lastName={data.lastName}
        size="md"
      />
      <div>
        <p className="text-sm font-semibold text-gray-900 leading-tight">
          {data.firstName} {data.lastName}
        </p>
        {data.role === 'admin' && (
          <Badge variant="info" className="mt-1 text-[10px]">Admin</Badge>
        )}
      </div>
    </div>

    <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-brand-400" />
  </div>
));
MemberNode.displayName = 'MemberNode';
