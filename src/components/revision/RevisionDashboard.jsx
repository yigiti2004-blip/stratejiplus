import React from 'react';
import { BarChart, Activity, PieChart, FileText, TrendingUp } from 'lucide-react';
import { useRevisionData } from '@/hooks/useRevisionData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RevisionDashboard = () => {
  const { stats } = useRevisionData();

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Toplam Revizyon" 
          value={stats.total} 
          icon={FileText} 
          color="text-blue-600" 
        />
        <StatCard 
          title="Onaylanan" 
          value={stats.byStatus['applied'] || 0} 
          icon={TrendingUp} 
          color="text-green-600" 
        />
        <StatCard 
          title="İncelemede" 
          value={stats.byStatus['review'] || 0} 
          icon={Activity} 
          color="text-yellow-600" 
        />
        <StatCard 
          title="Yapısal Değişiklikler" 
          value={stats.byType['Yapısal değişiklik'] || 0} 
          icon={PieChart} 
          color="text-purple-600" 
        />
      </div>

      {/* Charts Section (Simplified visual representation for now) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revizyon Nedenleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.byReason).map(([reason, count], idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{reason === 'undefined' ? 'Diğer' : reason}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(stats.byReason).length === 0 && <p className="text-sm text-gray-500 text-center py-4">Veri bulunamadı.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Seviyelere Göre Dağılım</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Ideally this data would come from stats, let's mock the structure based on types */}
             <div className="space-y-4">
               {/* This requires stats to track 'level' which wasn't in the initial hook spec fully calculated, but let's assume it's processed or we add it later. For now, placeholder. */}
               <div className="text-sm text-gray-500 text-center italic">
                  Detaylı grafik verileri revizyon kayıtları oluştukça görüntülenecektir.
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevisionDashboard;