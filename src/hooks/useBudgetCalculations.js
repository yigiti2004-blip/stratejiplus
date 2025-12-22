import { useMemo } from 'react';

export const useBudgetCalculations = (harcamalar, fasiller, faaliyetler) => {
  return useMemo(() => {
    const safeHarcamalar = Array.isArray(harcamalar) ? harcamalar : [];
    const safeFasiller = Array.isArray(fasiller) ? fasiller : [];
    const safeFaaliyetler = Array.isArray(faaliyetler) ? faaliyetler : [];

    const calculations = {
      fasilPerformans: {},
      faaliyetGerceklesmesi: {},
      harcamaDagilimi: {},
      sapmaAnalizi: {
        asimYasayanFaaliyetler: [],
        kritikFasillar: []
      }
    };

    // 1. FASIL PERFORMANSI
    safeFasiller.forEach(fasil => {
      // Match by ID as string so both numeric and UUID style IDs work
      const fasilHarcamalari = safeHarcamalar.filter(
        (h) => h.fasil_id != null && fasil.fasil_id != null && String(h.fasil_id) === String(fasil.fasil_id)
      );
      const toplamHarcama = fasilHarcamalari.reduce((sum, h) => sum + (Number(h.toplam_tutar) || 0), 0);
      const limit = Number(fasil.yillik_toplam_limit) || 0;
      const kullanimYuzdesi = limit > 0 ? (toplamHarcama / limit) * 100 : 0;
      const kalanButce = limit - toplamHarcama;

      let durum = 'Yeşil';
      if (kullanimYuzdesi > 100) durum = 'Kırmızı';
      else if (kullanimYuzdesi > 80) durum = 'Sarı';

      calculations.fasilPerformans[fasil.fasil_id] = {
        fasil_id: fasil.fasil_id,
        fasil_kodu: fasil.fasil_kodu,
        fasil_adi: fasil.fasil_adi,
        fasil_limiti: limit,
        toplam_harcama: toplamHarcama,
        kalan_butce: kalanButce,
        kullanim_yuzdesi: kullanimYuzdesi,
        durum: durum,
        harcama_sayisi: fasilHarcamalari.length
      };

      if (durum === 'Kırmızı' || durum === 'Sarı') {
        calculations.sapmaAnalizi.kritikFasillar.push({
          fasil_kodu: fasil.fasil_kodu,
          fasil_adi: fasil.fasil_adi,
          durum: durum,
          kullanim_yuzdesi: kullanimYuzdesi
        });
      }
    });

    // 2. FAALIYET BÜTÇE GERÇEKLEŞMESİ
    safeFaaliyetler.forEach(faaliyet => {
      const faaliyetHarcamalari = safeHarcamalar.filter(h => h.faaliyet_kodu === faaliyet.code || h.faaliyet_kodu === faaliyet.faaliyet_kodu);
      const gerceklesen = faaliyetHarcamalari.reduce((sum, h) => sum + (Number(h.toplam_tutar) || 0), 0);
      const tahmin = Number(faaliyet.plannedBudget || faaliyet.butce) || 0;
      const kalan = tahmin - gerceklesen;
      const sapma = gerceklesen - tahmin;
      const sapmaPyuzdesi = tahmin > 0 ? (sapma / tahmin) * 100 : 0;

      let sapmaDurumu = 'Normal';
      if (sapma > 0) sapmaDurumu = 'Bütçe Aşımı';

      const code = faaliyet.code || faaliyet.faaliyet_kodu;
      const name = faaliyet.name || faaliyet.faaliyet_adi;

      calculations.faaliyetGerceklesmesi[code] = {
        faaliyet_kodu: code,
        faaliyet_adi: name,
        tahmin_butce: tahmin,
        gerceklesen_harcama: gerceklesen,
        kalan_butce: kalan,
        sapma: sapma,
        sapma_yuzdesi: sapmaPyuzdesi,
        sapma_durumu: sapmaDurumu,
        harcama_sayisi: faaliyetHarcamalari.length,
        fasil_dagilimi: {}
      };

      faaliyetHarcamalari.forEach(harcama => {
        const fasil = safeFasiller.find(
          (f) => f.fasil_id != null && harcama.fasil_id != null && String(f.fasil_id) === String(harcama.fasil_id)
        );
        if (fasil) {
          if (!calculations.faaliyetGerceklesmesi[code].fasil_dagilimi[fasil.fasil_kodu]) {
            calculations.faaliyetGerceklesmesi[code].fasil_dagilimi[fasil.fasil_kodu] = {
              fasil_adi: fasil.fasil_adi,
              toplam_harcama: 0
            };
          }
          calculations.faaliyetGerceklesmesi[code].fasil_dagilimi[fasil.fasil_kodu].toplam_harcama += Number(harcama.toplam_tutar) || 0;
        }
      });

      if (sapmaDurumu === 'Bütçe Aşımı') {
        calculations.sapmaAnalizi.asimYasayanFaaliyetler.push({
          faaliyet_kodu: code,
          faaliyet_adi: name,
          sapma: sapma,
          sapma_yuzdesi: sapmaPyuzdesi
        });
      }
    });

    // 3. HARCAMA DAĞILIMI
    safeHarcamalar.forEach(harcama => {
      const fasil = safeFasiller.find(
        (f) => f.fasil_id != null && harcama.fasil_id != null && String(f.fasil_id) === String(harcama.fasil_id)
      );
      const faaliyet = safeFaaliyetler.find(f => (f.code === harcama.faaliyet_kodu) || (f.faaliyet_kodu === harcama.faaliyet_kodu));

      if (fasil && faaliyet) {
        const key = `${harcama.faaliyet_kodu}-${harcama.fasil_id}`;
        
        if (!calculations.harcamaDagilimi[key]) {
          calculations.harcamaDagilimi[key] = {
            faaliyet_kodu: harcama.faaliyet_kodu,
            faaliyet_adi: faaliyet.name || faaliyet.faaliyet_adi,
            fasil_id: harcama.fasil_id,
            fasil_kodu: fasil.fasil_kodu,
            fasil_adi: fasil.fasil_adi,
            toplam_harcama: 0,
            fasil_icindeki_pay_yuzdesi: 0,
            tahmin_butcenin_fasla_orani: 0
          };
        }

        calculations.harcamaDagilimi[key].toplam_harcama += Number(harcama.toplam_tutar) || 0;
        const limit = Number(fasil.yillik_toplam_limit) || 1;
        const butce = Number(faaliyet.plannedBudget || faaliyet.butce) || 0;

        calculations.harcamaDagilimi[key].fasil_icindeki_pay_yuzdesi = 
          (calculations.harcamaDagilimi[key].toplam_harcama / limit) * 100;
        calculations.harcamaDagilimi[key].tahmin_butcenin_fasla_orani = 
          (butce / limit) * 100;
      }
    });

    return calculations;
  }, [harcamalar, fasiller, faaliyetler]);
};