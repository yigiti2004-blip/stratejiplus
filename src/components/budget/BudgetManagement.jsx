import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFasiller } from '../../hooks/useFasiller';
import { useHarcamalar } from '../../hooks/useHarcamalar';
import { useFaaliyetler } from '../../hooks/useFaaliyetler';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import HarcamaForm from './HarcamaForm';
import FasilForm from './FasilForm';
import BudgetReports from './BudgetReports';

const BudgetManagement = ({ currentUser }) => {
  const { fasiller, addFasil, updateFasil, deleteFasil } = useFasiller();
  const { harcamalar, addHarcama, updateHarcama, deleteHarcama } = useHarcamalar();
  const { faaliyetler } = useFaaliyetler();
  const calculations = useBudgetCalculations(harcamalar, fasiller, faaliyetler);

  // Debug logging - always visible
  useEffect(() => {
    console.log('=== BUDGET MANAGEMENT DEBUG ===');
    console.log('Fasiller:', fasiller?.length || 0, fasiller);
    console.log('Harcamalar:', harcamalar?.length || 0, harcamalar);
    console.log('Faaliyetler:', faaliyetler?.length || 0, faaliyetler);
    console.log('Calculations fasilPerformans:', Object.keys(calculations?.fasilPerformans || {}).length, calculations?.fasilPerformans);
    console.log('===============================');
  }, [fasiller, harcamalar, faaliyetler, calculations]);

  const [activeTab, setActiveTab] = useState('harcamalar');
  const [showHarcamaModal, setShowHarcamaModal] = useState(false);
  const [showFasilModal, setShowFasilModal] = useState(false);
  const [editingHarcama, setEditingHarcama] = useState(null);
  const [editingFasil, setEditingFasil] = useState(null);

  // ===== HARCAMA İŞLEMLERİ =====
  const handleAddHarcama = () => {
    setEditingHarcama(null);
    setShowHarcamaModal(true);
  };

  const handleEditHarcama = (harcama) => {
    setEditingHarcama(harcama);
    setShowHarcamaModal(true);
  };

  const handleSaveHarcama = async (formData) => {
    try {
      if (editingHarcama) {
        await updateHarcama(editingHarcama.harcama_id, formData);
      } else {
        await addHarcama(formData);
      }
      setShowHarcamaModal(false);
      setEditingHarcama(null);
    } catch (error) {
      console.error('Harcama kaydedilirken hata:', error);
      alert('Harcama kaydedilirken bir hata oluştu');
    }
  };

  const handleDeleteHarcama = async (id) => {
    if (window.confirm('Bu harcamayı silmek istediğinize emin misiniz?')) {
      try {
        await deleteHarcama(id);
      } catch (error) {
        console.error('Harcama silinirken hata:', error);
        alert('Harcama silinirken bir hata oluştu');
      }
    }
  };

  // ===== FASIL İŞLEMLERİ =====
  const handleAddFasil = () => {
    setEditingFasil(null);
    setShowFasilModal(true);
  };

  const handleEditFasil = (fasil) => {
    setEditingFasil(fasil);
    setShowFasilModal(true);
  };

  const handleSaveFasil = async (formData) => {
    try {
      if (editingFasil) {
        // Düzenleme
        await updateFasil(editingFasil.fasil_id, formData);
      } else {
        // Yeni ekleme - generate ID if not provided
        if (!formData.fasil_id) {
          formData.fasil_id = `fasil-${Date.now()}`;
        }
        await addFasil(formData);
      }
      setShowFasilModal(false);
      setEditingFasil(null);
    } catch (error) {
      console.error('Fasıl kaydedilirken hata:', error);
      alert('Fasıl kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  const handleDeleteFasil = async (id) => {
    if (window.confirm('Bu fasılı silmek istediğinize emin misiniz?')) {
      try {
        await deleteFasil(id);
      } catch (error) {
        console.error('Fasıl silinirken hata:', error);
        alert('Fasıl silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      }
    }
  };

  return (
    <div className="budget-management">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'harcamalar' ? 'active' : ''}`}
          onClick={() => setActiveTab('harcamalar')}
        >
          Harcamalar
        </button>
        <button
          className={`tab ${activeTab === 'fasiller' ? 'active' : ''}`}
          onClick={() => setActiveTab('fasiller')}
        >
          Bütçe Fasılları
        </button>
        <button
          className={`tab ${activeTab === 'raporlar' ? 'active' : ''}`}
          onClick={() => setActiveTab('raporlar')}
        >
          Raporlar
        </button>
      </div>

      {/* Harcamalar Tab */}
      {activeTab === 'harcamalar' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-content">
          <div className="section-header">
            <h2>Harcama Yönetimi</h2>
            <button className="btn btn-primary" onClick={handleAddHarcama}>
              + Yeni Harcama Ekle
            </button>
          </div>

          {/* Debug Info */}
          <div style={{ padding: '10px', background: '#f3f4f6', marginBottom: '10px', borderRadius: '4px', fontSize: '12px' }}>
            <strong>Debug:</strong> Fasıllar: {fasiller?.length || 0} | Harcamalar: {harcamalar?.length || 0} | 
            Performans Entries: {Object.keys(calculations?.fasilPerformans || {}).length}
          </div>

          {Object.keys(calculations?.fasilPerformans || {}).length > 0 ? (
            <div className="fasil-performans">
              <h3>Fasıl Performansı</h3>
              <div className="fasil-grid">
                {Object.values(calculations.fasilPerformans).map(fasil => {
                  const durumLower = (fasil.durum || 'Yeşil').toLowerCase();
                  console.log('Rendering fasil:', fasil.fasil_kodu, 'durum:', durumLower, 'full fasil:', fasil);
                  return (
                    <div key={fasil.fasil_id || fasil.fasil_kodu} className={`fasil-card fasil-${durumLower}`}>
                      <div className="fasil-header">
                        <div>
                          <h4>{fasil.fasil_kodu || 'N/A'}</h4>
                          <p>{fasil.fasil_adi || 'N/A'}</p>
                        </div>
                        <span className={`badge badge-${durumLower}`} style={{ 
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: durumLower === 'kırmızı' ? '#fee2e2' : durumLower === 'sarı' ? '#fef3c7' : '#d1fae5',
                          color: durumLower === 'kırmızı' ? '#991b1b' : durumLower === 'sarı' ? '#92400e' : '#065f46'
                        }}>
                          {fasil.durum || 'Yeşil'}
                        </span>
                      </div>
                      <div className="fasil-stats">
                        <div className="stat">
                          <span>Limit:</span>
                          <span>{(fasil.fasil_limiti || 0).toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="stat">
                          <span>Harcama:</span>
                          <span>{(fasil.toplam_harcama || 0).toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="stat">
                          <span>Kalan:</span>
                          <span>{(fasil.kalan_butce || 0).toLocaleString('tr-TR')} ₺</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(fasil.kullanim_yuzdesi || 0, 100)}%` }} />
                      </div>
                      <div className="progress-label">{(fasil.kullanim_yuzdesi || 0).toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
              <p style={{ color: '#991b1b', fontWeight: 'bold' }}>⚠️ Fasıl Performansı verisi bulunamadı</p>
              <p style={{ color: '#991b1b', fontSize: '14px', marginTop: '10px' }}>
                Fasıllar: {fasiller?.length || 0} | Harcamalar: {harcamalar?.length || 0}
                {fasiller?.length === 0 && <span style={{ display: 'block', marginTop: '5px' }}>→ Önce bir Fasıl oluşturun</span>}
                {harcamalar?.length === 0 && <span style={{ display: 'block', marginTop: '5px' }}>→ Önce bir Harcama oluşturun</span>}
              </p>
            </div>
          )}

          {harcamalar && harcamalar.length > 0 ? (
            <div className="harcama-listesi">
              <h3>Harcama Listesi</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Faaliyet</th>
                      <th>Fasıl</th>
                      <th>Harcama Adı</th>
                      <th>Tutar</th>
                      <th>Toplam</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {harcamalar.map(harcama => {
                      const fasil = fasiller.find(f => f.fasil_id === harcama.fasil_id);
                      const faaliyet = faaliyetler.find(f => f.faaliyet_kodu === harcama.faaliyet_kodu);
                      return (
                        <tr key={harcama.harcama_id}>
                          <td>{new Date(harcama.harcama_tarihi).toLocaleDateString('tr-TR')}</td>
                          <td>{faaliyet?.faaliyet_adi || harcama.faaliyet_kodu}</td>
                          <td>{fasil?.fasil_kodu || '-'}</td>
                          <td>{harcama.harcama_adi}</td>
                          <td>{Number(harcama.tutar_kdv_hariç).toLocaleString('tr-TR')} ₺</td>
                          <td>{Number(harcama.toplam_tutar).toLocaleString('tr-TR')} ₺</td>
                          <td className="actions">
                            <button className="btn-icon" onClick={() => handleEditHarcama(harcama)} title="Düzenle">✎</button>
                            <button className="btn-icon" onClick={() => handleDeleteHarcama(harcama.harcama_id)} title="Sil">🗑</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="empty-message">Henüz harcama kaydı yok</p>
          )}
        </motion.div>
      )}

      {/* Fasiller Tab */}
      {activeTab === 'fasiller' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-content">
          <div className="section-header">
            <h2>Bütçe Fasılları</h2>
            <button className="btn btn-primary" onClick={handleAddFasil}>
              + Yeni Fasıl Ekle
            </button>
          </div>

          {fasiller && Array.isArray(fasiller) && fasiller.length > 0 ? (
            <div className="fasil-listesi">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fasıl Kodu</th>
                      <th>Fasıl Adı</th>
                      <th>Mali Yıl</th>
                      <th>Yıllık Limit</th>
                      <th>Tahsis Limit</th>
                      <th>Sorumlu Birim</th>
                      <th>Sorumlu Kişi</th>
                      <th>Durum</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fasiller.map((fasil) => {
                      if (!fasil || !fasil.fasil_id) return null;
                      return (
                        <tr key={fasil.fasil_id}>
                          <td className="code">{fasil.fasil_kodu || '-'}</td>
                          <td>{fasil.fasil_adi || '-'}</td>
                          <td>{fasil.mali_yil || '-'}</td>
                          <td>{fasil.yillik_toplam_limit ? Number(fasil.yillik_toplam_limit).toLocaleString('tr-TR') + ' ₺' : '-'}</td>
                          <td>{fasil.yillik_tahsis_limit ? Number(fasil.yillik_tahsis_limit).toLocaleString('tr-TR') + ' ₺' : '-'}</td>
                          <td>{fasil.sorumlu_birim || '-'}</td>
                          <td>{fasil.sorumlu_kisi || '-'}</td>
                          <td><span className={`badge badge-${(fasil.durum || 'Aktif').toLowerCase()}`}>{fasil.durum || 'Aktif'}</span></td>
                          <td className="actions">
                            <button className="btn-icon" onClick={() => handleEditFasil(fasil)} title="Düzenle">✎</button>
                            <button className="btn-icon" onClick={() => handleDeleteFasil(fasil.fasil_id)} title="Sil">🗑</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="empty-message">Henüz fasıl kaydı yok</p>
          )}
        </motion.div>
      )}

      {/* Raporlar Tab */}
      {activeTab === 'raporlar' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-content">
          <BudgetReports calculations={calculations} fasiller={fasiller} faaliyetler={faaliyetler} />
        </motion.div>
      )}

      {/* Harcama Modal */}
      {showHarcamaModal && (
        <div className="modal-overlay" onClick={() => setShowHarcamaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingHarcama ? 'Harcama Düzenle' : 'Yeni Harcama'}</h2>
              <button className="modal-close" onClick={() => setShowHarcamaModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <HarcamaForm
                editingItem={editingHarcama}
                faaliyetler={faaliyetler}
                fasiller={fasiller}
                onSave={handleSaveHarcama}
                onCancel={() => setShowHarcamaModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Fasıl Modal */}
      {showFasilModal && (
        <div className="modal-overlay" onClick={() => setShowFasilModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFasil ? 'Fasıl Düzenle' : 'Yeni Fasıl'}</h2>
              <button className="modal-close" onClick={() => setShowFasilModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <FasilForm
                editingItem={editingFasil}
                onSave={handleSaveFasil}
                onCancel={() => setShowFasilModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;