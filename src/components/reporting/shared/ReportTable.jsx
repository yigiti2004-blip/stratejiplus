
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReportTable = ({ columns, data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const itemsPerPage = 10;

  // Sorting logic
  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle numeric-like strings or percentages
        if (typeof aVal === 'string' && aVal.includes('%')) {
           aVal = parseFloat(aVal.replace('%', ''));
           bVal = parseFloat(bVal.replace('%', ''));
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-900/50">
            <TableRow className="border-gray-700 hover:bg-transparent">
              {columns.map((col, idx) => (
                <TableHead 
                  key={idx} 
                  className="whitespace-nowrap font-bold text-gray-300 h-10"
                  onClick={() => requestSort(col.dataKey)}
                >
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-400">
                    {col.header}
                    <ArrowUpDown className="w-3 h-3 text-gray-600" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  Veri bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, rowIdx) => (
                <TableRow key={rowIdx} className="border-gray-700 hover:bg-gray-700/50 transition-colors">
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className="py-3 text-gray-300" style={col.style}>
                      {col.render ? col.render(row) : row[col.dataKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700 bg-gray-900/30">
          <div className="text-xs text-gray-500">
            Toplam {data.length} kayıt, Sayfa {currentPage} / {totalPages}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 w-7 p-0 bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 w-7 p-0 bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTable;
