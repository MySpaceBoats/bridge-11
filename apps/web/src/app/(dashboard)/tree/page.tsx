'use client';

import { useEffect, useState } from 'react';
import { GitBranch, Plus, RefreshCw } from 'lucide-react';
import { useFamilyStore } from '@/store/family.store';
import { treeApi } from '@/lib/api';
import { TreeView } from '@/components/family-tree/TreeView';
import { Button } from '@/components/ui/Button';
import type { TreeNode, TreeEdge } from '@/types';

export default function TreePage() {
  const { currentFamily } = useFamilyStore();
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [edges, setEdges] = useState<TreeEdge[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTree = async () => {
    if (!currentFamily) return;
    setLoading(true);
    try {
      const data = await treeApi.getTree(currentFamily.id);
      setNodes(data.nodes ?? []);
      setEdges(data.edges ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTree(); }, [currentFamily?.id]);

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-gray-500">Select a family to view the tree.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-brand-500" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Family Tree</h1>
            <p className="text-xs text-gray-500">
              {nodes.length} members · Drag to connect
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadTree}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
            <GitBranch className="w-12 h-12" />
            <p className="text-lg font-medium">No members in the tree yet.</p>
            <p className="text-sm">Invite family members to see them here.</p>
          </div>
        ) : (
          <TreeView
            nodes={nodes}
            edges={edges}
            familyId={currentFamily.id}
            onUpdate={loadTree}
          />
        )}
      </div>
    </div>
  );
}
