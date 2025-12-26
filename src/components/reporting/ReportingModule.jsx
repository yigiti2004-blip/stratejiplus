
import React, { useState, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuthContext } from '@/hooks/useAuthContext';
import { getCompanyData } from '@/lib/supabase';

export default function ReportingModule() {
  const { currentUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState('r1');
  
  // State for R1
  const [stats, setStats] = useState({
    areas: [],
    objectives: [],
    targets: [],
    activities: []
  });

  // State for R3
  const [r3Data, setR3Data] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const companyId = currentUser?.companyId;
        const userId = currentUser?.id || currentUser?.userId;
        const isAdmin = currentUser?.roleId === 'admin';

        if (companyId && userId) {
          const [areasRaw, objectivesRaw, targetsRaw, activitiesRaw] = await Promise.all([
            getCompanyData('strategic_areas', userId, companyId, isAdmin),
            getCompanyData('strategic_objectives', userId, companyId, isAdmin),
            getCompanyData('targets', userId, companyId, isAdmin),
            getCompanyData('activities', userId, companyId, isAdmin),
          ]);

          const areas = (areasRaw || []).map(item => ({
            ...item,
            companyId: item.company_id || item.companyId,
          }));
          const objectives = (objectivesRaw || []).map(item => ({
            ...item,
            companyId: item.company_id || item.companyId,
            strategicAreaId: item.strategic_area_id || item.strategicAreaId,
          }));
          const targets = (targetsRaw || []).map(item => ({
            ...item,
            companyId: item.company_id || item.companyId,
            objectiveId: item.objective_id || item.objectiveId,
          }));
          const activities = (activitiesRaw || []).map(item => ({
            ...item,
            companyId: item.company_id || item.companyId,
            targetId: item.target_id || item.targetId,
          }));

          setStats({ areas, objectives, targets, activities });
        }
      } catch (error) {
        console.error("Data loading error (R1):", error);
      }
    };
    loadData();
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  // Load R3 data logic
  useEffect(() => {
    if (activeTab === 'r3') {
      const loadR3Data = async () => {
        try {
          const companyId = currentUser?.companyId;
          const userId = currentUser?.id || currentUser?.userId;
          const isAdmin = currentUser?.roleId === 'admin';

          let activitiesList = [];
          let targetsList = [];
          let monitoringHistory = [];

          if (companyId && userId) {
            const [activitiesRaw, targetsRaw, realizationRecordsRaw] = await Promise.all([
              getCompanyData('activities', userId, companyId, isAdmin),
              getCompanyData('targets', userId, companyId, isAdmin),
              getCompanyData('activity_realization_records', userId, companyId, isAdmin),
            ]);

            activitiesList = activitiesRaw || [];
            targetsList = targetsRaw || [];
            monitoringHistory = (realizationRecordsRaw || []).map(item => ({
              id: item.id,
              activityId: item.activity_id,
              recordDate: item.record_date || item.created_at,
            }));
          }
        // If 'strategies' exists as a full tree, we can use it. But often we use flat lists in this app.
        // Let's stick to flat lists which are more reliable if the app uses them.
        
        // Map target names to IDs for easy lookup
        const targetMap = {};
        targetsList.forEach(t => {
          targetMap[t.id] = t.content || t.name || 'Bilinmeyen Hedef';
        });

        const processedActivities = activitiesList.map(activity => {
          // Find tracking records
          const activityTracking = monitoringHistory.filter(
            record => record.activityId === activity.id
          );

          // Find evidence files (Assuming a key in localStorage or property on tracking)
          // Since evidence might not be fully implemented as a separate store, we check monitoring records for attachments/evidence
          // Or check if 'evidenceFiles' exists as requested in prompt.
          // Evidence files would come from activity_realization_records.evidence_url
          const evidenceFiles = [];
          const activityEvidence = evidenceFiles.filter(
            file => file.activityId === activity.id
          );
          
          // Also check if monitoring records have 'evidence' field if evidenceFiles is empty
          const evidenceInTracking = activityTracking.filter(r => r.evidence || (r.files && r.files.length > 0));
          const totalEvidenceCount = activityEvidence.length + evidenceInTracking.length;

          // Determine status
          let status = 'Başlamadı';
          let lastTrackingDate = '-';

          if (activityTracking.length > 0) {
            // Sort by date desc
            const sortedTracking = [...activityTracking].sort(
              (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
            );
            const lastDate = sortedTracking[0].date || sortedTracking[0].createdAt;
            if (lastDate) {
               lastTrackingDate = new Date(lastDate).toLocaleDateString('tr-TR');
            }

            // Logic for status based on evidence
            if (totalEvidenceCount > 0) {
              status = 'Tam';
            } else {
              status = 'Eksik'; // Tracked but no evidence
            }
          } else {
             // If activity is marked as completed in main list but has no tracking records?
             if (activity.status === 'Tamamlandı' || activity.completion === 100) {
                 status = 'Tam'; // Trust the main status
             }
          }

          return {
            id: activity.id,
            code: activity.code || '-',
            name: activity.content || activity.name || '-',
            targetName: targetMap[activity.targetId] || 'Bağlı Hedef Bulunamadı',
            lastTrackingDate,
            evidenceStatus: totalEvidenceCount > 0 ? 'Var' : 'Yok',
            status,
            trackingCount: activityTracking.length,
            evidenceCount: totalEvidenceCount
          };
        });

        setR3Data(processedActivities);
        } catch (error) {
          console.error('R3 veri yükleme hatası:', error);
          setR3Data([]);
        }
      };
      loadR3Data();
    }
  }, [activeTab, currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);


  // --- R1 CALCULATIONS ---
  const calculateR1Data = () => {
    return {
      totalStrategies: stats.areas.length,
      totalObjectives: stats.objectives.length,
      totalTargets: stats.targets.length,
      totalActivities: stats.activities.length
    };
  };

  const calculateCompletionData = () => {
    const totalActivitiesCount = stats.activities.length;
    const completedActivities = stats.activities.filter(a => 
      a.status === 'Tamamlandı' || 
      a.completion === 100 || 
      a.status === 'completed' ||
      a.progress === 100
    ).length;

    const totalTargetsCount = stats.targets.length;
    const completedTargets = stats.targets.filter(t => 
      t.status === 'Tamamlandı' || 
      t.completion === 100 || 
      t.status === 'completed' ||
      (t.completion && Number(t.completion) >= 100)
    ).length;

    return {
      activityCompletion: totalActivitiesCount > 0 ? Math.round((completedActivities / totalActivitiesCount) * 100) : 0,
      targetCompletion: totalTargetsCount > 0 ? Math.round((completedTargets / totalTargetsCount) * 100) : 0,
      completedActivities,
      totalActivities: totalActivitiesCount,
      completedTargets,
      totalTargets: totalTargetsCount
    };
  };

  const r1Data = calculateR1Data();
  const completionData = calculateCompletionData();

  // --- EXPORTS R1 ---
  const exportR1ToExcel = () => {
    const data = [
      ['Rapor Merkezi - R1 Genel Durum'],
      [''],
      ['Sistem Yapısı', 'Değer'],
      ['Toplam Stratejiler', r1Data.totalStrategies],
      ['Toplam Amaçlar', r1Data.totalObjectives],
      ['Toplam Hedefler', r1Data.totalTargets],
      ['Toplam Faaliyetler', r1Data.totalActivities],
      [''],
      ['Tamamlanma Durumu', 'Değer'],
      ['Faaliyet Tamamlanma %', `${completionData.activityCompletion}%`],
      ['Hedef Tamamlanma %', `${completionData.targetCompletion}%`],
      ['Tamamlanan Faaliyetler', `${completionData.completedActivities} / ${completionData.totalActivities}`],
      ['Tamamlanan Hedefler', `${completionData.completedTargets} / ${completionData.totalTargets}`]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "R1 Genel Durum");
    const wscols = [{wch: 25}, {wch: 15}];
    ws['!cols'] = wscols;
    XLSX.writeFile(wb, 'R1_Genel_Durum.xlsx');
  };

  const exportR1ToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Rapor Merkezi - R1 Genel Durum', 14, 20);
    doc.setFontSize(11);
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 30);

    const tableBody = [
      [{ content: 'Sistem Yapısı', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
      ['Toplam Stratejiler', r1Data.totalStrategies],
      ['Toplam Amaçlar', r1Data.totalObjectives],
      ['Toplam Hedefler', r1Data.totalTargets],
      ['Toplam Faaliyetler', r1Data.totalActivities],
      [{ content: 'Tamamlanma Durumu', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
      ['Faaliyet Tamamlanma %', `%${completionData.activityCompletion}`],
      ['Hedef Tamamlanma %', `%${completionData.targetCompletion}`],
      ['Tamamlanan Faaliyetler', `${completionData.completedActivities} / ${completionData.totalActivities}`],
      ['Tamamlanan Hedefler', `${completionData.completedTargets} / ${completionData.totalTargets}`]
    ];

    doc.autoTable({
      startY: 40,
      head: [['Metrik', 'Değer']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 }
    });
    doc.save('R1_Genel_Durum.pdf');
  };

  // --- EXPORTS R3 ---
  const exportR3ToExcel = () => {
    const data = [
      ['Rapor Merkezi - R3 Faaliyet & Kanıt'],
      [''],
      ['Faaliyet Kodu', 'Faaliyet Adı', 'Bağlı Olduğu Hedef', 'Son İzleme Tarihi', 'Kanıt Durumu', 'Durum'],
      ...r3Data.map(row => [
        row.code,
        row.name,
        row.targetName,
        row.lastTrackingDate,
        row.evidenceStatus,
        row.status
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "R3 Faaliyet Kanıt");
    // Auto width
    const wscols = [{wch: 15}, {wch: 40}, {wch: 40}, {wch: 20}, {wch: 15}, {wch: 15}];
    ws['!cols'] = wscols;
    XLSX.writeFile(wb, 'R3_Faaliyet_Kanit.xlsx');
  };

  const exportR3ToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Rapor Merkezi - R3 Faaliyet & Kanıt', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 28);
    
    // Summary
    const total = r3Data.length;
    const tam = r3Data.filter(a => a.status === 'Tam').length;
    const eksik = r3Data.filter(a => a.status === 'Eksik').length;
    const baslamadi = r3Data.filter(a => a.status === 'Başlamadı').length;
    
    doc.text(`Özet: Toplam ${total} | Tam: ${tam} | Eksik: ${eksik} | Başlamadı: ${baslamadi}`, 14, 35);

    const tableBody = r3Data.map(row => [
      row.code,
      row.name,
      row.targetName,
      row.lastTrackingDate,
      row.evidenceStatus,
      row.status
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Kod', 'Faaliyet', 'Hedef', 'Son İzleme', 'Kanıt', 'Durum']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: {
        1: { cellWidth: 40 },
        2: { cellWidth: 40 }
      }
    });

    doc.save('R3_Faaliyet_Kanit.pdf');
  };

  const tabs = [
    { id: 'r1', label: 'R1 Genel Durum' },
    { id: 'r2', label: 'R2 Performans (Alan-Amaç-Hedef)' },
    { id: 'r3', label: 'R3 Faaliyet & Kanıt' },
    { id: 'r4', label: 'R4 Bütçe & Sapma' },
    { id: 'r5', label: 'R5 Revizyon Geçmişi' },
    { id: 'r6', label: 'R6 Risk İlişkisi' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Tam': return 'bg-green-900 text-green-200';
      case 'Eksik': return 'bg-yellow-900 text-yellow-200';
      case 'Başlamadı': return 'bg-red-900 text-red-200';
      default: return 'bg-gray-700 text-gray-200';
    }
  };

  const getEvidenceColor = (status) => {
    return status === 'Var' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-white mb-6">📊 Rapor Merkezi</h1>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap border-b border-gray-700 pb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded font-semibold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-lg p-6 text-white">
        
        {/* R1 Tab */}
        {activeTab === 'r1' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-2xl font-bold">R1 Genel Durum</h2>
              <div className="flex gap-3">
                <button onClick={exportR1ToExcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2">
                  <FileSpreadsheet size={18} /> Excel indir
                </button>
                <button onClick={exportR1ToPDF} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-2">
                  <FileText size={18} /> PDF indir
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-gray-400 text-sm">Toplam Stratejiler</p>
                <p className="text-3xl font-bold text-blue-400">{r1Data.totalStrategies}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-gray-400 text-sm">Toplam Amaçlar</p>
                <p className="text-3xl font-bold text-purple-400">{r1Data.totalObjectives}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-500">
                <p className="text-gray-400 text-sm">Toplam Hedefler</p>
                <p className="text-3xl font-bold text-yellow-400">{r1Data.totalTargets}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-gray-400 text-sm">Toplam Faaliyetler</p>
                <p className="text-3xl font-bold text-green-400">{r1Data.totalActivities}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Faaliyet Tamamlanma</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-600 rounded-full h-4">
                      <div className="bg-green-500 h-4 rounded-full transition-all" style={{ width: `${completionData.activityCompletion}%` }}></div>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{completionData.activityCompletion}%</p>
                </div>
                <p className="text-gray-400 text-sm mt-2">{completionData.completedActivities} / {completionData.totalActivities} tamamlandı</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Hedef Tamamlanma</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-600 rounded-full h-4">
                      <div className="bg-blue-500 h-4 rounded-full transition-all" style={{ width: `${completionData.targetCompletion}%` }}></div>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{completionData.targetCompletion}%</p>
                </div>
                <p className="text-gray-400 text-sm mt-2">{completionData.completedTargets} / {completionData.totalTargets} tamamlandı</p>
              </div>
            </div>
          </div>
        )}

        {/* R3 Tab */}
        {activeTab === 'r3' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-2xl font-bold">R3 Faaliyet & Kanıt</h2>
              <div className="flex gap-3">
                <button onClick={exportR3ToExcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2">
                  <FileSpreadsheet size={18} /> Excel indir
                </button>
                <button onClick={exportR3ToPDF} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-2">
                  <FileText size={18} /> PDF indir
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-gray-400 text-sm">Toplam Faaliyetler</p>
                <p className="text-3xl font-bold text-blue-400">{r3Data.length}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-gray-400 text-sm">Tam</p>
                <p className="text-3xl font-bold text-green-400">{r3Data.filter(a => a.status === 'Tam').length}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-500">
                <p className="text-gray-400 text-sm">Eksik</p>
                <p className="text-3xl font-bold text-yellow-400">{r3Data.filter(a => a.status === 'Eksik').length}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-red-500">
                <p className="text-gray-400 text-sm">Başlamadı</p>
                <p className="text-3xl font-bold text-red-400">{r3Data.filter(a => a.status === 'Başlamadı').length}</p>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Faaliyet Kodu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Faaliyet Adı</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Bağlı Olduğu Hedef</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Son İzleme Tarihi</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Kanıt Durumu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {r3Data.length > 0 ? (
                    r3Data.map((activity, index) => (
                      <tr key={activity.id || index} className="hover:bg-gray-600 transition">
                        <td className="px-4 py-3 text-sm">{activity.code}</td>
                        <td className="px-4 py-3 text-sm">{activity.name}</td>
                        <td className="px-4 py-3 text-sm">{activity.targetName}</td>
                        <td className="px-4 py-3 text-sm">{activity.lastTrackingDate}</td>
                        <td className={`px-4 py-3 text-sm font-semibold ${getEvidenceColor(activity.evidenceStatus)}`}>
                          {activity.evidenceStatus}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                        Faaliyet bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other Tabs - Placeholders */}
        {['r2', 'r4', 'r5', 'r6'].includes(activeTab) && (
          <div>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-2xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <div className="flex gap-3">
                <button disabled className="px-4 py-2 bg-gray-600 text-gray-300 rounded cursor-not-allowed opacity-50 flex items-center gap-2">
                  <Download size={18} /> Excel indir
                </button>
                <button disabled className="px-4 py-2 bg-gray-600 text-gray-300 rounded cursor-not-allowed opacity-50 flex items-center gap-2">
                  <Download size={18} /> PDF indir
                </button>
              </div>
            </div>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Yakında</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
