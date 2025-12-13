import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, CheckCircle, Search, TrendingDown, PieChart } from 'lucide-react';

const BudgetReports = ({ calculations, fasiller, faaliyetler }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Defensive checks for data existence
  const fasilPerformans = calculations?.fasilPerformans || {};
  const faaliyetGerceklesmesi = calculations?.faaliyetGerceklesmesi || {};
  const harcamaDagilimi = calculations?.harcamaDagilimi || {};
  
  // Deep safety check for nested arrays
  const sapmaAnalizi = calculations?.sapmaAnalizi || {};
  const asimYasayanFaaliyetler = Array.isArray(sapmaAnalizi?.asimYasayanFaaliyetler) ? sapmaAnalizi.asimYasayanFaaliyetler : [];
  const kritikFasillar = Array.isArray(sapmaAnalizi?.kritikFasillar) ? sapmaAnalizi.kritikFasillar : [];

  // Filter for the new detailed table with safety checks
  const filteredActivities = Object.values(faaliyetGerceklesmesi).filter(item => {
    if (!item) return false;
    const term = searchTerm.toLowerCase();
    const adi = (item.faaliyet_adi || '').toLowerCase();
    const kodu = (item.faaliyet_kodu || '').toLowerCase();
    return adi.includes(term) || kodu.includes(term);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-8"
    >
      {/* 1. SECTION: Fasıl Bazlı Kullanım Raporu */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-gray-800">Fasıl Bazlı Kullanım Raporu</h3>
        </div>
        
        {Object.keys(fasilPerformans).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fasıl Kodu</th>
                  <th className="px-4 py-3 font-semibold">Fasıl Adı</th>
                  <th className="px-4 py-3 font-semibold">Limit</th>
                  <th className="px-4 py-3 font-semibold">Harcanan</th>
                  <th className="px-4 py-3 font-semibold">Kalan</th>
                  <th className="px-4 py-3 font-semibold">Kullanım %</th>
                  <th className="px-4 py-3 font-semibold">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.values(fasilPerformans).map(fasil => (
                  <tr key={fasil.fasil_kodu} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{fasil.fasil_kodu}</td>
                    <td className="px-4 py-3 text-gray-600">{fasil.fasil_adi}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{(fasil.fasil_limiti || 0).toLocaleString('tr-TR')} ₺</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{(fasil.toplam_harcama || 0).toLocaleString('tr-TR')} ₺</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{(fasil.kalan_butce || 0).toLocaleString('tr-TR')} ₺</td>
                    <td className="px-4 py-3 text-gray-600 font-bold">{(fasil.kullanim_yuzdesi || 0).toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        fasil.durum === 'Kırmızı' ? 'bg-red-100 text-red-700' :
                        fasil.durum === 'Sarı' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {fasil.durum}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Henüz veri yok</p>
        )}
      </section>

      {/* 2. SECTION: SAPMA ANALIZI (DARK THEME) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="bg-[#2A2F3A] p-2 rounded-lg">
             <TrendingUp className="text-white" size={24} />
           </div>
           <div>
             <h3 className="text-xl font-bold text-gray-900">Sapma Analizi ve Bütçe Performansı</h3>
             <p className="text-sm text-gray-500">Faaliyet bazlı bütçe sapmaları ve kritik göstergeler</p>
           </div>
        </div>

        {/* UPPER SECTION: SUMMARY CARDS (DARK) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Bütçe Aşımı */}
            <div className="bg-[#2A2F3A] rounded-xl p-6 shadow-xl border border-gray-700 flex flex-col h-full overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="bg-red-500/20 text-red-400 p-2 rounded-lg">
                           <TrendingUp size={20} />
                        </span>
                        Bütçe Aşımı Yaşayan Faaliyetler
                    </h4>
                    <span className="text-gray-300 text-sm font-bold bg-[#374151] px-3 py-1 rounded-full border border-gray-600">
                        {asimYasayanFaaliyetler.length} Adet
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar relative z-10">
                   {asimYasayanFaaliyetler.length > 0 ? (
                       <ul className="space-y-3">
                           {asimYasayanFaaliyetler.map(item => (
                               <li key={item.faaliyet_kodu} className="bg-[#1F2937] p-4 rounded-lg border-l-4 border-red-500 flex justify-between items-center group hover:bg-[#374151] transition-all duration-200">
                                   <div className="flex flex-col gap-1">
                                       <span className="text-white font-bold text-sm tracking-wide">{item.faaliyet_kodu}</span>
                                       <span className="text-gray-400 text-xs truncate max-w-[220px]" title={item.faaliyet_adi}>{item.faaliyet_adi}</span>
                                   </div>
                                   <div className="text-right">
                                       <div className="text-red-400 font-bold text-sm">+{ (item.sapma || 0).toLocaleString('tr-TR') } ₺</div>
                                       <div className="text-red-500/70 text-xs font-medium mt-0.5">SAPMA: %{ (item.sapma_yuzdesi || 0).toFixed(1) }</div>
                                   </div>
                               </li>
                           ))}
                       </ul>
                   ) : (
                       <div className="flex flex-col items-center justify-center h-48 text-gray-400 opacity-60">
                           <CheckCircle size={48} className="mb-3 text-green-500" />
                           <p className="font-medium">Harika! Bütçe aşımı bulunmuyor.</p>
                       </div>
                   )}
                </div>
            </div>

            {/* Card 2: Kritik Fasıllar */}
            <div className="bg-[#2A2F3A] rounded-xl p-6 shadow-xl border border-gray-700 flex flex-col h-full overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="bg-yellow-500/20 text-yellow-400 p-2 rounded-lg">
                           <AlertTriangle size={20} />
                        </span>
                        Kritik Seviyeye Gelen Fasıllar
                    </h4>
                    <span className="text-gray-300 text-sm font-bold bg-[#374151] px-3 py-1 rounded-full border border-gray-600">
                        {kritikFasillar.length} Adet
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar relative z-10">
                   {kritikFasillar.length > 0 ? (
                       <ul className="space-y-3">
                           {kritikFasillar.map(item => (
                               <li key={item.fasil_kodu} className={`bg-[#1F2937] p-4 rounded-lg border-l-4 ${item.durum === 'Kırmızı' ? 'border-red-500' : 'border-yellow-500'} flex justify-between items-center hover:bg-[#374151] transition-all duration-200`}>
                                   <div className="flex flex-col gap-1">
                                       <span className="text-white font-bold text-sm tracking-wide">{item.fasil_kodu}</span>
                                       <span className="text-gray-400 text-xs">{item.fasil_adi}</span>
                                   </div>
                                   <div className="text-right">
                                       <div className={`${item.durum === 'Kırmızı' ? 'text-red-400' : 'text-yellow-400'} font-bold text-lg`}>%{ (item.kullanim_yuzdesi || 0).toFixed(1) }</div>
                                       <span className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Kullanım</span>
                                   </div>
                               </li>
                           ))}
                       </ul>
                   ) : (
                       <div className="flex flex-col items-center justify-center h-48 text-gray-400 opacity-60">
                           <CheckCircle size={48} className="mb-3 text-green-500" />
                           <p className="font-medium">Tüm fasıllar normal seviyede.</p>
                       </div>
                   )}
                </div>
            </div>
        </div>

        {/* LOWER SECTION: NEW TABLE (DARK) */}
        <div className="bg-[#2A2F3A] rounded-xl shadow-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-white font-bold text-lg">Faaliyet Bazlı Bütçe Gerçekleşme Özeti</h3>
                    <p className="text-gray-400 text-sm mt-1">Tüm faaliyetlerin anlık bütçe performans takibi</p>
                </div>
                
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                       type="text" 
                       placeholder="Faaliyet Ara..." 
                       className="w-full bg-[#1F2937] text-white pl-10 pr-4 py-2.5 rounded-lg text-sm border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-500"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#111827] text-gray-400 uppercase font-semibold tracking-wider text-xs">
                        <tr>
                            <th className="px-6 py-4">Faaliyet Kodu</th>
                            <th className="px-6 py-4">Faaliyet Adı</th>
                            <th className="px-6 py-4 text-right">Tahmini Bütçe</th>
                            <th className="px-6 py-4 text-right">Gerçekleşen</th>
                            <th className="px-6 py-4 text-right">Sapma Tutarı</th>
                            <th className="px-6 py-4 text-right">Sapma %</th>
                            <th className="px-6 py-4 text-center">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredActivities.length > 0 ? (
                           filteredActivities.map((item) => {
                               // Safe value access
                               const sapma = item.sapma || 0;
                               const isOverBudget = sapma > 0;
                               const sapmaYuzdesi = item.sapma_yuzdesi || 0;
                               const tahminButce = item.tahmin_butce || 0;
                               const gerceklesen = item.gerceklesen_harcama || 0;
                               
                               return (
                                   <tr key={item.faaliyet_kodu} className="group bg-[#2A2F3A] even:bg-[#232833] hover:bg-[#374151] transition-colors duration-150">
                                       <td className="px-6 py-4 font-bold text-white group-hover:text-blue-400 transition-colors">
                                           {item.faaliyet_kodu}
                                       </td>
                                       <td className="px-6 py-4 text-gray-300 font-medium">
                                           {item.faaliyet_adi}
                                       </td>
                                       <td className="px-6 py-4 text-right text-gray-300 font-mono">
                                           {tahminButce.toLocaleString('tr-TR')} ₺
                                       </td>
                                       <td className="px-6 py-4 text-right text-gray-200 font-mono font-bold">
                                           {gerceklesen.toLocaleString('tr-TR')} ₺
                                       </td>
                                       <td className={`px-6 py-4 text-right font-bold font-mono ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                                           {isOverBudget ? '+' : ''}{sapma.toLocaleString('tr-TR')} ₺
                                       </td>
                                       <td className={`px-6 py-4 text-right font-bold ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                                           {isOverBudget ? <TrendingUp size={14} className="inline mr-1" /> : <TrendingDown size={14} className="inline mr-1" />}
                                           %{Math.abs(sapmaYuzdesi).toFixed(1)}
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                               isOverBudget 
                                                 ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                                 : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                           }`}>
                                               {item.sapma_durumu === 'Bütçe Aşımı' ? 'AŞIM' : 'NORMAL'}
                                           </span>
                                       </td>
                                   </tr>
                               );
                           })
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <Search size={32} className="mb-2 opacity-50" />
                                        <p>Aradığınız kriterlere uygun faaliyet bulunamadı.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </section>

      {/* 3. SECTION: Harcama Dağılımı */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-2">
        <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <PieChart size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Harcama Dağılımı (Faaliyet – Fasıl Kırılımı)</h3>
        </div>
        
        {Object.keys(harcamaDagilimi).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Faaliyet</th>
                  <th className="px-4 py-3 font-semibold">Fasıl</th>
                  <th className="px-4 py-3 font-semibold">Toplam Harcama</th>
                  <th className="px-4 py-3 font-semibold">Fasıl İçindeki Pay %</th>
                  <th className="px-4 py-3 font-semibold">Tahmin Bütçenin Fasla Oranı %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.values(harcamaDagilimi).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{item.faaliyet_adi}</td>
                    <td className="px-4 py-3 text-gray-600">{item.fasil_kodu} – {item.fasil_adi}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{(item.toplam_harcama || 0).toLocaleString('tr-TR')} ₺</td>
                    <td className="px-4 py-3 text-gray-600 font-bold">{(item.fasil_icindeki_pay_yuzdesi || 0).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-gray-600">{(item.tahmin_butcenin_fasla_orani || 0).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Henüz harcama kaydı yok</p>
        )}
      </section>
    </motion.div>
  );
};

// Explicit default export to match import in BudgetManagement.jsx
export default BudgetReports;