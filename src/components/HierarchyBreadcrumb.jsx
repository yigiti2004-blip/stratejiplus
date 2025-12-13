import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const HierarchyBreadcrumb = ({ selectedAlan, selectedAmac, selectedHedef, onNavigate }) => {
  return (
    <div className="flex items-center gap-2 p-4 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
      <button 
        onClick={() => onNavigate('root')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="font-bold">Ana Sayfa</span>
      </button>

      {selectedAlan && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          <button 
            onClick={() => onNavigate('areas')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all border border-transparent",
              !selectedAmac ? "bg-blue-50 text-blue-700 border-blue-100 font-bold" : "text-gray-600"
            )}
          >
            <span className="font-mono font-bold text-xs">{selectedAlan.code}</span>
            <span className="truncate max-w-[200px]">{selectedAlan.name}</span>
          </button>
        </>
      )}

      {selectedAmac && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          <button 
            onClick={() => onNavigate('objectives')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all border border-transparent",
              !selectedHedef ? "bg-purple-50 text-purple-700 border-purple-100 font-bold" : "text-gray-600"
            )}
          >
            <span className="font-mono font-bold text-xs">{selectedAmac.code}</span>
            <span className="truncate max-w-[200px]">{selectedAmac.name}</span>
          </button>
        </>
      )}

      {selectedHedef && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100 font-bold">
            <span className="font-mono font-bold text-xs">{selectedHedef.code}</span>
            <span className="truncate max-w-[200px]">{selectedHedef.name}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default HierarchyBreadcrumb;