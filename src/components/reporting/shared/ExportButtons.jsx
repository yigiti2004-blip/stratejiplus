
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../exportUtils';

const ExportButtons = ({ data, columns, fileName }) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => exportToPDF(fileName, data, columns)}
        className="bg-gray-800 border-gray-700 text-red-400 hover:bg-red-900/20 hover:text-red-300"
      >
        <FileText className="w-4 h-4 mr-2" /> PDF İndir
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => exportToExcel(fileName, data, columns)}
        className="bg-gray-800 border-gray-700 text-green-400 hover:bg-green-900/20 hover:text-green-300"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel İndir
      </Button>
    </div>
  );
};

export default ExportButtons;
