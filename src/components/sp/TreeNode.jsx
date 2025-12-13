import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Edit2, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TreeNode = ({
  item,
  level,
  expandedItems,
  selectedItem,
  onToggleExpand,
  onSelectItem,
  onEdit,
  onDelete,
  children = []
}) => {
  const isExpanded = expandedItems.has(item.id);
  const isSelected = selectedItem?.id === item.id;
  const hasChildren = children && children.length > 0;

  // Indentation calc
  const indentSize = 24;
  const paddingLeft = level * indentSize;

  return (
    <div className="tree-node relative">
      <div
        className={cn("tree-row group", isSelected && "selected")}
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectItem(item);
        }}
      >
        <button
          className={cn("expand-btn", isExpanded && "expanded")}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id);
          }}
          disabled={!hasChildren}
        >
          {hasChildren && <ChevronRight className="w-4 h-4" />}
        </button>

        <span className="item-code">{item.code}</span>
        <span className="item-name">{item.name}</span>
        
        {item.status && (
          <span className={cn(
            "item-status hidden sm:inline-block",
            item.status === 'Aktif' ? "bg-green-100 text-green-700" : 
            item.status === 'Pasif' ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"
          )}>
            {item.status}
          </span>
        )}

        <div className="item-actions ml-auto mr-2">
          <button onClick={(e) => { e.stopPropagation(); onSelectItem(item); }}>
             <Eye className="w-3 h-3" /> Detay
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
             <Edit2 className="w-3 h-3" /> Düzenle
          </button>
          {/* <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200">
             <Trash2 className="w-3 h-3" /> Sil
          </button> */}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
             {/* Optional: Vertical line connector can be implemented here with CSS if needed */}
             {children.map(child => (
                <TreeNode
                  key={child.id}
                  item={child}
                  level={level + 1}
                  expandedItems={expandedItems}
                  selectedItem={selectedItem}
                  onToggleExpand={onToggleExpand}
                  onSelectItem={onSelectItem}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  children={child.children || []}
                />
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};