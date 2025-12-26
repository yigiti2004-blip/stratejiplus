import React from 'react';
import { TrendingUp, Calendar, CheckCircle } from 'lucide-react';

/**
 * Status Summary Section
 * Shows key metrics for the activity
 */
const StatusSummary = ({ activity, avgCompletion, recordCount, hasExpenseRecords }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-blue-600" />
        Durum Özeti
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Gerçekleşme Oranı</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgCompletion.toFixed(1)}%</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Kayıt Sayısı</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{recordCount}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Durum</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{activity.status || 'Planlandı'}</p>
        </div>
      </div>

      {hasExpenseRecords && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Uyarı:</strong> Bu faaliyet için harcama işaretli kayıtlar bulunmaktadır. 
            Harcamalar Bütçe Yönetimi modülünden girilmelidir.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusSummary;

