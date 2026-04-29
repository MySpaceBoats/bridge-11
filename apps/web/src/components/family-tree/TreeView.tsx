'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge, useNodesState, useEdgesState, Controls,
  MiniMap, Background, type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { TreeNode, TreeEdge } from '@/types';
import { MemberNode } from './MemberNode';
import { treeApi } from '@/lib/api';

const nodeTypes = { member: MemberNode };

interface TreeViewProps {
  nodes: TreeNode[];
  edges: TreeEdge[];
  familyId: string;
  onUpdate?: () => void;
}

export function TreeView({ nodes: initialNodes, edges: initialEdges, familyId, onUpdate }: TreeViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.map((n) => ({ ...n, type: 'member' })),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges.map((e) => ({
      ...e,
      animated: false,
      style: { stroke: '#6088ff', strokeWidth: 2 },
      labelStyle: { fontSize: 11, fill: '#666' },
      labelBgStyle: { fill: '#f8f8f8' },
    })),
  );
  const [selectedRelation, setSelectedRelation] = useState('sibling');

  const onConnect = useCallback(
    async (params: Connection) => {
      const edge = {
        ...params,
        id: `${params.source}-${params.target}`,
        label: selectedRelation,
        style: { stroke: '#6088ff', strokeWidth: 2 },
        animated: false,
      };
      setEdges((eds) => addEdge(edge as any, eds));
      try {
        await treeApi.addRelation(familyId, {
          fromUserId: params.source,
          toUserId: params.target,
          relationType: selectedRelation,
        });
        onUpdate?.();
      } catch {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
    },
    [familyId, selectedRelation, onUpdate],
  );

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-3 left-3 z-10 bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
        <label className="text-xs text-gray-600 block mb-1">Relation type when connecting:</label>
        <select
          value={selectedRelation}
          onChange={(e) => setSelectedRelation(e.target.value)}
          className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {['parent', 'child', 'sibling', 'spouse', 'cousin', 'grandparent', 'grandchild', 'uncle_aunt', 'nephew_niece', 'other'].map((r) => (
            <option key={r} value={r}>{r.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
