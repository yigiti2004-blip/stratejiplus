
import React from 'react';

const GanttBar = ({ item, onHover, onLeave, onClick }) => {
  const getStyle = () => {
    switch (item.sourceType) {
      case 'stratejik-plan':
        return 'bg-blue-500 border-blue-600 hover:bg-blue-400';
      case 'kurumsal-süreklilik':
        return 'bg-purple-600 border-purple-700 hover:bg-purple-500';
      case 'yıla-özgü':
        return 'bg-emerald-500 border-emerald-600 hover:bg-emerald-400';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const handleMouseMove = (e) => {
    onHover(item, { x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className={`absolute h-6 rounded border shadow-sm cursor-pointer transition-colors ${getStyle()}`}
      style={{
        left: `${item.startPercent}%`,
        width: `${item.durationPercent}%`,
        minWidth: '4px'
      }}
      onMouseEnter={handleMouseMove}
      onMouseMove={handleMouseMove}
      onMouseLeave={onLeave}
      onClick={() => onClick(item)}
    >
      {/* Label inside bar if wide enough */}
      {item.durationPercent > 15 && (
        <div className="h-full flex items-center px-2">
          <span className="text-[10px] font-bold text-white truncate w-full shadow-sm drop-shadow-md">
            {item.workName}
          </span>
        </div>
      )}
    </div>
  );
};

export default GanttBar;
