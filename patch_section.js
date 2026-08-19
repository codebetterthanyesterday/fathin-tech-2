const fs = require('fs');
const content = fs.readFileSync('components/admin/sections/section-list.tsx', 'utf8');

// Replace imports
let newContent = content.replace(
  /import \{\n  DndContext,[\s\S]*?from '@dnd-kit\/utilities';/,
  `import { ReorderableList, useReorderableItem, ReorderableDragHandle, ReorderableFallbackControls } from '@/components/admin/shared/reorderable-list';\nimport { arrayMove } from '@dnd-kit/sortable';`
);

// Replace SectionRow
newContent = newContent.replace(
  /const \{\n    attributes,\n    listeners,\n    setNodeRef,\n    transform,\n    transition,\n    isDragging,\n  \} = useSortable\(\{ id: section\.id \}\);\n\n  const style = \{\n    transform: CSS\.Transform\.toString\(transform\),\n    transition,\n  \};/g,
  `const { attributes, listeners, setNodeRef, style, isDragging } = useReorderableItem(section.id);`
);

// Replace grip vertical
newContent = newContent.replace(
  /<button\n          \{\.\.\.\(isDragOverlay \? \{\} : \{\ \.\.\.attributes, \.\.\.listeners \}\)\}\n          className="flex-shrink-0 p-1\.5 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-white\/5 cursor-grab active:cursor-grabbing transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white\/30"\n          aria-label="Drag to reorder"\n          title="Drag to reorder"\n          tabIndex=\{0\}\n        >\n          <GripVertical className="w-4 h-4" \/>\n        <\/button>/g,
  `<ReorderableDragHandle attributes={isDragOverlay ? {} : attributes} listeners={isDragOverlay ? {} : listeners} isDragging={isDragging && !isDragOverlay} />`
);

// Replace chevron buttons
newContent = newContent.replace(
  /\{\/\* Keyboard-accessible up\/down — always present, accessible alternative to drag \*\/\}[\s\S]*?<button\n            onClick=\{\(\) => onMove\(section\.id, 'down'\)\}[\s\S]*?<\/button>\n          <\/button>/,
  `{/* Keyboard-accessible up/down — always present, accessible alternative to drag */}\n          <ReorderableFallbackControls\n            onMoveUp={() => onMove(section.id, 'up')}\n            onMoveDown={() => onMove(section.id, 'down')}\n            isFirst={isFirst}\n            isLast={isLast}\n            isProcessing={isPending}\n          />`
);

// Fix overlapping chevron
newContent = newContent.replace(
  /<ReorderableFallbackControls\n            onMoveUp=\{\(\) => onMove\(section\.id, 'up'\)\}\n            onMoveDown=\{\(\) => onMove\(section\.id, 'down'\)\}\n            isFirst=\{isFirst\}\n            isLast=\{isLast\}\n            isProcessing=\{isPending\}\n          \/>\n\n          \{\/\* Visibility toggle \*\/\}/g,
  `<ReorderableFallbackControls\n            onMoveUp={() => onMove(section.id, 'up')}\n            onMoveDown={() => onMove(section.id, 'down')}\n            isFirst={isFirst}\n            isLast={isLast}\n            isProcessing={isPending}\n          />\n\n          {/* Visibility toggle */}`
);

// We need to properly regex the fallback replacement since my regex was a bit off (it had <\/button>\n <\/button>)
