import React from 'react';
import { DollarSign, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * Linked Modules Section
 * Shows budget data (read-only), risks, and revisions
 */
const LinkedModules = ({ activity, hasExpenseRecords }) => {
  const navigate = useNavigate();

  const handleNavigateToBudget = () => {
    navigate('/budget');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ExternalLink className="w-5 h-5 text-blue-600" />
        Bağlı Modüller
      </h3>

      <div className="space-y-4">
        {/* Budget Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Bütçe Bilgileri</span>
            </div>
            {hasExpenseRecords && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNavigateToBudget}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Bütçe Yönetimine Git
              </Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Planlanan:</span>
              <p className="font-semibold text-gray-900">
                {Number(activity.planned_budget || 0).toLocaleString('tr-TR')} ₺
              </p>
            </div>
            <div>
              <span className="text-gray-600">Gerçekleşen:</span>
              <p className="font-semibold text-gray-900">
                {Number(activity.actual_budget || 0).toLocaleString('tr-TR')} ₺
              </p>
            </div>
            <div>
              <span className="text-gray-600">Fark:</span>
              <p className="font-semibold text-gray-900">
                {(Number(activity.actual_budget || 0) - Number(activity.planned_budget || 0)).toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>
          {hasExpenseRecords && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              Harcamalar Bütçe Yönetimi modülünden girilmelidir.
            </div>
          )}
        </div>

        {/* Risks Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Riskler</span>
          </div>
          <p className="text-sm text-gray-600">Risk bilgileri Risk Yönetimi modülünden görüntülenir.</p>
        </div>

        {/* Revisions Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Revizyon Geçmişi</span>
          </div>
          <p className="text-sm text-gray-600">Revizyon bilgileri Revizyonlar modülünden görüntülenir.</p>
        </div>
      </div>
    </div>
  );
};

export default LinkedModules;

