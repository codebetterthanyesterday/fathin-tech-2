'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface ReorderableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  children: React.ReactNode;
  renderOverlay?: (activeId: string) => React.ReactNode;
}

export function ReorderableList<T extends { id: string }>({
  items,
  onReorder,
  children,
  renderOverlay,
}: ReorderableListProps<T>) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className={`space-y-3 transition-opacity duration-200 ${activeId ? 'opacity-90' : ''}`}>
          {children}
        </div>
      </SortableContext>
      
      {renderOverlay && (
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: '0.4' } },
            }),
          }}
        >
          {activeId ? renderOverlay(activeId) : null}
        </DragOverlay>
      )}
    </DndContext>
  );
}

export function useReorderableItem(id: string) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  return { attributes, listeners, setNodeRef, style, isDragging };
}

export function ReorderableDragHandle({ attributes, listeners, isDragging }: { attributes: any; listeners: any; isDragging?: boolean }) {
  return (
    <button
      {...attributes}
      {...listeners}
      type="button"
      className={`flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 touch-none ${
        isDragging ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 cursor-grab active:cursor-grabbing'
      }`}
      aria-label="Drag to reorder"
      title="Drag to reorder"
      tabIndex={0}
    >
      <GripVertical className="w-5 h-5" />
    </button>
  );
}

interface ReorderableFallbackProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isProcessing?: boolean;
}

export function ReorderableFallbackControls({
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isProcessing = false,
}: ReorderableFallbackProps) {
  return (
    <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800/80 flex-shrink-0">
      <button
        onClick={onMoveUp}
        disabled={isFirst || isProcessing}
        className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded"
        title="Move up"
        aria-label="Move item up"
        type="button"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
      <button
        onClick={onMoveDown}
        disabled={isLast || isProcessing}
        className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded"
        title="Move down"
        aria-label="Move item down"
        type="button"
      >
        <ArrowDown className="w-4 h-4" />
      </button>
    </div>
  );
}
