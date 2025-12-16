import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HarcamaForm = ({ editingItem, faaliyetler = [], fasiller = [], onSave, onCancel }) => {
  const [faaliyet_kodu, setFaaliyetKodu] = useState('');
  const [fasil_id, setFasilId] = useState('');
  const [harcama_adi, setHarcamaAdi] = useState('');
  const [harcama_tarihi, setHarcamaTarihi] = useState(new Date().toISOString().split('T')[0]);
  const [tutar_kdv_hariç, setTutarKdvHariç] = useState('');
  const [kdv_yuzde, setKdvYuzde] = useState('20');
  const [toplam_tutar, setToplamTutar] = useState(0);
  const [yk_karari_no, setYkKarariNo] = useState('');
  const [yk_karari_aciklama, setYkKarariAciklama] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [durum, setDurum] = useState('Onaylandı');
  const [errors, setErrors] = useState({});

  // Fasiller ve Faaliyetler'i kontrol et
  const validFasiller = Array.isArray(fasiller) ? fasiller : [];
  const validFaaliyetler = Array.isArray(faaliyetler) ? faaliyetler : [];

  useEffect(() => {
    if (editingItem) {
      setFaaliyetKodu(editingItem.faaliyet_kodu || '');
      setFasilId(editingItem.fasil_id || '');
      setHarcamaAdi(editingItem.harcama_adi || '');
      setHarcamaTarihi(editingItem.harcama_tarihi || new Date().toISOString().split('T')[0]);
      setTutarKdvHariç(editingItem.tutar_kdv_hariç || '');
      setKdvYuzde(editingItem.kdv_yuzde || '20');
      setYkKarariNo(editingItem.yk_karari_no || '');
      setYkKarariAciklama(editingItem.yk_karari_aciklama || '');
      setAciklama(editingItem.aciklama || '');
      setDurum(editingItem.durum || 'Onaylandı');
    }
  }, [editingItem]);

  // Tutar hesaplama
  useEffect(() => {
    const tutar = Number(tutar_kdv_hariç) || 0;
    const kdv = Number(kdv_yuzde) || 0;
    const toplam = tutar + (tutar * kdv / 100);
    setToplamTutar(toplam);
  }, [tutar_kdv_hariç, kdv_yuzde]);

  const validateForm = () => {
    const newErrors = {};

    if (!faaliyet_kodu) {
      newErrors.faaliyet_kodu = 'Faaliyet seçimi gereklidir';
    }

    if (!fasil_id) {
      newErrors.fasil_id = 'Fasıl seçimi gereklidir';
    }

    if (!harcama_adi.trim()) {
      newErrors.harcama_adi = 'Harcama Adı gereklidir';
    }

    if (!harcama_tarihi) {
      newErrors.harcama_tarihi = 'Tarih gereklidir';
    }

    if (!tutar_kdv_hariç || Number(tutar_kdv_hariç) <= 0) {
      newErrors.tutar_kdv_hariç = 'Tutar 0\'dan büyük olmalıdır';
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
      faaliyet_kodu,
      fasil_id: Number(fasil_id),
      harcama_adi,
      harcama_tarihi,
      tutar_kdv_hariç: Number(tutar_kdv_hariç),
      kdv_yuzde: Number(kdv_yuzde),
      toplam_tutar: Number(toplam_tutar),
      yk_karari_no,
      yk_karari_aciklama,
      aciklama,
      durum
    };

    onSave(formData);
  };

  // Aktif fasılları filtrele (Bütçe Yönetimi'nden)
  const aktivFasiller = validFasiller.filter(f => f && f.durum === 'Aktif');

  return (
  <motion.form
      onSubmit={handleSubmit}
      className="harcama-form sp-item-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <div className="form-section">
        <h3 className="form-section-title">Üst Bilgiler</h3>

        <div className="form-group">
          <label>Faaliyet Seçimi * (SP Yönetimi'nden)</label>
          <select
            value={faaliyet_kodu}
            onChange={(e) => setFaaliyetKodu(e.target.value)}
            className={errors.faaliyet_kodu ? 'form-input input-error' : 'form-input'}
          >
            <option value="">-- Faaliyet Seçin --</option>
            {validFaaliyetler.length > 0 ? (
              validFaaliyetler.map(f => (
                <option key={f.faaliyet_kodu} value={f.faaliyet_kodu}>
                  {f.faaliyet_kodu} – {f.faaliyet_adi}
                </option>
              ))
            ) : (
              <option disabled>Faaliyet bulunamadı</option>
            )}
          </select>
          {errors.faaliyet_kodu && <span className="error-text">{errors.faaliyet_kodu}</span>}
        </div>

        <div className="form-group">
          <label>Fasıl Seçimi * (Bütçe Yönetimi'nden)</label>
          <select
            value={fasil_id}
            onChange={(e) => setFasilId(e.target.value)}
            className={errors.fasil_id ? 'form-input input-error' : 'form-input'}
          >
            <option value="">-- Fasıl Seçin --</option>
            {aktivFasiller.length > 0 ? (
              aktivFasiller.map(f => (
                <option key={f.fasil_id} value={f.fasil_id}>
                  {f.fasil_kodu} – {f.fasil_adi}
                </option>
              ))
            ) : (
              <option disabled>Aktif fasıl bulunamadı</option>
            )}
          </select>
          {errors.fasil_id && <span className="error-text">{errors.fasil_id}</span>}
        </div>

        <div className="form-group">
          <label>Harcama Adı *</label>
          <input
            type="text"
            value={harcama_adi}
            onChange={(e) => setHarcamaAdi(e.target.value)}
            placeholder="Harcama Adı"
            className={errors.harcama_adi ? 'form-input input-error' : 'form-input'}
          />
          {errors.harcama_adi && <span className="error-text">{errors.harcama_adi}</span>}
        </div>

        <div className="form-group">
          <label>Harcama Tarihi *</label>
          <input
            type="date"
            value={harcama_tarihi}
            onChange={(e) => setHarcamaTarihi(e.target.value)}
            className={errors.harcama_tarihi ? 'form-input input-error' : 'form-input'}
          />
          {errors.harcama_tarihi && <span className="error-text">{errors.harcama_tarihi}</span>}
        </div>

        <div className="form-group">
          <label>Açıklama</label>
          <textarea
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            placeholder="Açıklama"
            rows="3"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Tutar Bilgileri</h3>

        <div className="form-group">
          <label>Tutar (KDV Hariç) *</label>
          <input
            type="number"
            value={tutar_kdv_hariç}
            onChange={(e) => setTutarKdvHariç(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={errors.tutar_kdv_hariç ? 'form-input input-error' : 'form-input'}
          />
          {errors.tutar_kdv_hariç && <span className="error-text">{errors.tutar_kdv_hariç}</span>}
        </div>

        <div className="form-group">
          <label>KDV (%)</label>
          <input
            type="number"
            value={kdv_yuzde}
            onChange={(e) => setKdvYuzde(e.target.value)}
            placeholder="20"
            step="0.01"
            min="0"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Toplam Tutar (Otomatik)</label>
          <input
            type="number"
            value={toplam_tutar.toFixed(2)}
            disabled
            className="form-input"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Onay Bilgileri</h3>

        <div className="form-group">
          <label>YK Kararı No</label>
          <input
            type="text"
            value={yk_karari_no}
            onChange={(e) => setYkKarariNo(e.target.value)}
            placeholder="YK Kararı No"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>YK Kararı Açıklama</label>
          <textarea
            value={yk_karari_aciklama}
            onChange={(e) => setYkKarariAciklama(e.target.value)}
            placeholder="Açıklama"
            rows="3"
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
            <option value="Onaylandı">Onaylandı</option>
            <option value="Beklemede">Beklemede</option>
            <option value="Reddedildi">Reddedildi</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Kaydet</button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">İptal</button>
      </div>
    </motion.form>
  );
};

export default HarcamaForm;