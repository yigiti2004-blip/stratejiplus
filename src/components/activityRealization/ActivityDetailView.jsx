import React from 'react';
import { Calendar, User, FileText, DollarSign, AlertTriangle, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActivityLog from './ActivityLog';
import LinkedModules from './LinkedModules';
import StatusSummary from './StatusSummary';

/**
 * Activity Detail View
 * Structured as: Status Summary, Activity Log, Linked Modules
 */
const ActivityDetailView = ({
  activity,
  realizationRecords,
  canAddRecord,
  onAddRecord,
  currentUser,
}) => {
  // Calculate average completion
  const avgCompletion = realizationRecords.length > 0
    ? realizationRecords.reduce((sum, r) => sum + (Number(r.completion_percentage) || 0), 0) / realizationRecords.length
    : 0;

  // Check if any record has expense flag = Yes
  const hasExpenseRecords = realizationRecords.some(r => r.expense_flag === 'Yes');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{activity.code} - {activity.name}</h2>
            <p className="text-sm text-gray-600 mt-1">Faaliyet Detay Görünümü</p>
          </div>
          {canAddRecord && (
            <Button onClick={onAddRecord} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Gerçekleşme Kaydı Ekle
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Summary */}
        <StatusSummary
          activity={activity}
          avgCompletion={avgCompletion}
          recordCount={realizationRecords.length}
          hasExpenseRecords={hasExpenseRecords}
        />

        {/* Activity Log */}
        <ActivityLog
          activity={activity}
          realizationRecords={realizationRecords}
        />

        {/* Linked Modules */}
        <LinkedModules
          activity={activity}
          hasExpenseRecords={hasExpenseRecords}
        />
      </div>
    </div>
  );
};

export default ActivityDetailView;

