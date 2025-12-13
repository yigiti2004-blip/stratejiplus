import React from 'react';
import { getRiskMatrixColor } from '@/lib/calculations';

const RiskMatrix = ({ risks, onRiskClick }) => {
  const MatrixCell = ({ p, i }) => {
    const cellRisks = risks.filter(r => Number(r.probability) === p && Number(r.impact) === i && r.status !== 'Kapatıldı');
    const count = cellRisks.length;
    const colorClass = getRiskMatrixColor(p, i);
    
    return (
      <div className={`w-full h-24 border border-white/20 rounded-lg flex flex-col items-center justify-center relative transition-transform hover:scale-105 ${colorClass} text-white shadow-sm group`}>
        <div className="absolute top-1 left-2 text-[10px] opacity-70">O:{p} x E:{i}</div>
        {count > 0 ? (
          <>
            <div className="text-2xl font-bold drop-shadow-md">{count}</div>
            <div className="text-[10px] opacity-80">{count === 1 ? 'Risk' : 'Risk'}</div>
          </>
        ) : (
          <div className="text-white/20 text-sm">-</div>
        )}
        
        {/* Tooltip-like list on hover if needed, or click handler */}
        {count > 0 && (
           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center rounded-lg transition-opacity" onClick={() => onRiskClick && onRiskClick(cellRisks)}>
              <span className="text-xs bg-black/50 px-2 py-1 rounded">Görüntüle</span>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Risk Matrisi (Isı Haritası)</h3>
      <div className="flex">
         {/* Y-Axis Label */}
         <div className="flex items-center justify-center w-12 mr-2">
            <span className="-rotate-90 font-bold text-gray-500 tracking-widest uppercase text-sm whitespace-nowrap">Olasılık (1-5)</span>
         </div>
         
         <div className="flex-1 space-y-3">
            {[5, 4, 3, 2, 1].map(row => (
               <div key={row} className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map(col => (
                     <MatrixCell key={`${row}-${col}`} p={row} i={col} />
                  ))}
               </div>
            ))}
         </div>
      </div>
      {/* X-Axis Label */}
      <div className="text-center mt-4 font-bold text-gray-500 tracking-widest uppercase text-sm pl-12">
         Etki Derecesi (1-5)
      </div>
    </div>
  );
};

export default RiskMatrix;