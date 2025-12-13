
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

const ReportFilters = ({ filters, filterConfig, onFilterChange, onReset }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
      <div className="flex items-center gap-2 mb-4 text-gray-300 font-medium border-b border-gray-700 pb-2">
        <Filter className="w-4 h-4" /> Filtreler
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filterConfig.map((config) => (
          <div key={config.key} className="space-y-1.5">
            <Label className="text-xs text-gray-400 font-semibold uppercase">{config.label}</Label>
            
            {config.type === 'select' && (
              <Select 
                value={filters[config.key] || 'all'} 
                onValueChange={(val) => onFilterChange(config.key, val)}
              >
                <SelectTrigger className="h-9 bg-gray-900 border-gray-700 text-gray-200">
                  <SelectValue placeholder={config.placeholder || "Seçiniz"} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="all">Tümü</SelectItem>
                  {config.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {config.type === 'text' && (
              <Input
                type="text"
                className="h-9 bg-gray-900 border-gray-700 text-gray-200"
                placeholder={config.placeholder}
                value={filters[config.key] || ''}
                onChange={(e) => onFilterChange(config.key, e.target.value)}
              />
            )}
             
            {config.type === 'date' && (
              <Input
                type="date"
                className="h-9 bg-gray-900 border-gray-700 text-gray-200"
                value={filters[config.key] || ''}
                onChange={(e) => onFilterChange(config.key, e.target.value)}
              />
            )}
            
            {config.type === 'range' && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="h-9 bg-gray-900 border-gray-700 text-gray-200"
                  value={filters[config.minKey] || ''}
                  onChange={(e) => onFilterChange(config.minKey, e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  className="h-9 bg-gray-900 border-gray-700 text-gray-200"
                  value={filters[config.maxKey] || ''}
                  onChange={(e) => onFilterChange(config.maxKey, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}

        <div className="flex items-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset} 
            className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
          >
            <X className="w-4 h-4 mr-1" /> Temizle
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
