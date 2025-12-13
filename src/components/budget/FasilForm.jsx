import React, { useState, useEffect } from 'react';

const FasilForm = ({ editingItem, onSave, onCancel }) => {
  const [fasil_kodu, setFasilKodu] = useState('');
  const [fasil_adi, setFasilAdi] = useState('');
  const [fasil_aciklama, setFasilAciklama] = useState('');
  const [yillik_toplam_limit, setYillikTotalLimit] = useState('');
  const [yillik_tahsis_limit, setYillikTahsisLimit] = useState('');
  const [mali_yil, setMaliYil] = useState(new Date().getFullYear());
  const [sorumlu_birim, setSorumliBirim] = useState('');
  const [sorumlu_kisi, setSorumluKisi] = useState('');
  const [durum, setDurum] = useState('Aktif');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingItem) {
      setFasilKodu(editingItem.fasil_kodu || '');
      setFasilAdi(editingItem.fasil_adi || '');
      setFasilAciklama(editingItem.fasil_aciklama || '');
      setYillikTotalLimit(editingItem.yillik_toplam_limit || '');
      setYillikTahsisLimit(editingItem.yillik_tahsis_limit || '');
      setMaliYil(editingItem.mali_yil || new Date().getFullYear());
      setSorumliBirim(editingItem.sorumlu_birim || '');
      setSorumluKisi(editingItem.sorumlu_kisi || '');
      setDurum(editingItem.durum || 'Aktif');
    }
  }, [editingItem]);

  const validateForm = () => {
    const newErrors = {};

    if (!fasil_kodu.trim()) {
      newErrors.fasil_kodu = 'Fasıl Kodu gereklidir';
    }

    if (!fasil_adi.trim()) {
      newErrors.fasil_adi = 'Fasıl Adı gereklidir';
    }

    if (!yillik_toplam_limit || Number(yillik_toplam_limit) <= 0) {
      newErrors.yillik_toplam_limit = 'Limit 0\'dan büyük olmalıdır';
    }

    if (!sorumlu_birim.trim()) {
      newErrors.sorumlu_birim = 'Sorumlu Birim gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = {
      fasil_kodu,
      fasil_adi,
      fasil_aciklama,
      yillik_toplam_limit: Number(yillik_toplam_limit),
      yillik_tahsis_limit: yillik_tahsis_limit ? Number(yillik_tahsis_limit) : null,
      mali_yil: Number(mali_yil),
      sorumlu_birim,
      sorumlu_kisi,
      durum
    };

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="fasil-form">
      <div className="form-section">
        <h3>Fasıl Bilgileri</h3>

        <div className="form-group">
          <label>Fasıl Kodu *</label>
          <input
            type="text"
            value={fasil_kodu}
            onChange={(e) => setFasilKodu(e.target.value)}
            placeholder="F01"
            disabled={!!editingItem}
            className={errors.fasil_kodu ? 'form-input input-error' : 'form-input'}
          />
          {errors.fasil_kodu && <span className="error-text">{errors.fasil_kodu}</span>}
        </div>

        <div className="form-group">
          <label>Fasıl Adı *</label>
          <input
            type="text"
            value={fasil_adi}
            onChange={(e) => setFasilAdi(e.target.value)}
            placeholder="Fasıl Adı"
            className={errors.fasil_adi ? 'form-input input-error' : 'form-input'}
          />
          {errors.fasil_adi && <span className="error-text">{errors.fasil_adi}</span>}
        </div>

        <div className="form-group">
          <label>Fasıl Açıklaması</label>
          <textarea
            value={fasil_aciklama}
            onChange={(e) => setFasilAciklama(e.target.value)}
            placeholder="Açıklama"
            rows="3"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Limit Bilgileri</h3>

        <div className="form-group">
          <label>Yıllık Toplam Limit *</label>
          <input
            type="number"
            value={yillik_toplam_limit}
            onChange={(e) => setYillikTotalLimit(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={errors.yillik_toplam_limit ? 'form-input input-error' : 'form-input'}
          />
          {errors.yillik_toplam_limit && <span className="error-text">{errors.yillik_toplam_limit}</span>}
        </div>

        <div className="form-group">
          <label>Yıllık Tahsis Limit</label>
          <input
            type="number"
            value={yillik_tahsis_limit}
            onChange={(e) => setYillikTahsisLimit(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Mali Yıl *</label>
          <input
            type="number"
            value={mali_yil}
            onChange={(e) => setMaliYil(e.target.value)}
            min="2000"
            max="2100"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Sorumluluk Bilgileri</h3>

        <div className="form-group">
          <label>Sorumlu Birim *</label>
          <input
            type="text"
            value={sorumlu_birim}
            onChange={(e) => setSorumliBirim(e.target.value)}
            placeholder="Birim Adı"
            className={errors.sorumlu_birim ? 'form-input input-error' : 'form-input'}
          />
          {errors.sorumlu_birim && <span className="error-text">{errors.sorumlu_birim}</span>}
        </div>

        <div className="form-group">
          <label>Sorumlu Kişi</label>
          <input
            type="text"
            value={sorumlu_kisi}
            onChange={(e) => setSorumluKisi(e.target.value)}
            placeholder="Kişi Adı"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Durum</label>
          <select
            value={durum}
            onChange={(e) => setDurum(e.target.value)}
            className="form-input"
          >
            <option value="Aktif">Aktif</option>
            <option value="Pasif">Pasif</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Kaydet</button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">İptal</button>
      </div>
    </form>
  );
};

export default FasilForm;