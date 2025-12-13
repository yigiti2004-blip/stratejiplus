// Multi-Tenant Data Initializer
// Creates separate data for Company A and Company B

export const initializeData = () => {
  // ============================================
  // COMPANY A DATA
  // ============================================
  const companyA = {
    id: 'company-a',
    name: 'TechCorp A',
    units: [
      { unitId: 'comp-a-org-1', unitName: 'Genel Müdürlük', unitCode: 'GM-A', status: 'aktif', companyId: 'company-a', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { unitId: 'comp-a-org-2', unitName: 'İnsan Kaynakları', unitCode: 'IK-A', status: 'aktif', companyId: 'company-a', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { unitId: 'comp-a-org-3', unitName: 'Teknoloji', unitCode: 'TECH-A', status: 'aktif', companyId: 'company-a', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    users: [
      { 
        userId: 'comp-a-admin', 
        fullName: 'Ahmet Yılmaz', 
        email: 'ahmet@companya.com', 
        roleId: 'admin', 
        unitId: 'comp-a-org-1',
        companyId: 'company-a',
        status: 'aktif',
        password: 'admin123',
        mustChangePassword: false,
        lastLoginDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        userId: 'comp-a-user1', 
        fullName: 'Ayşe Demir', 
        email: 'ayse@companya.com', 
        roleId: 'unit-manager', 
        unitId: 'comp-a-org-2',
        companyId: 'company-a',
        status: 'aktif',
        password: 'user123',
        mustChangePassword: false,
        lastLoginDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    strategicAreas: [
      { id: 'comp-a-sa-1', code: 'SA1-A', name: 'Dijital Dönüşüm ve İnovasyon', organizationId: 'comp-a-org-3', companyId: 'company-a', responsibleUnit: 'Teknoloji', description: 'Şirketin dijital dönüşüm stratejisi' },
      { id: 'comp-a-sa-2', code: 'SA2-A', name: 'Müşteri Memnuniyeti', organizationId: 'comp-a-org-1', companyId: 'company-a', responsibleUnit: 'Genel Müdürlük', description: 'Müşteri deneyimini iyileştirme' }
    ],
    strategicObjectives: [
      { id: 'comp-a-obj-1', code: 'A1.1-A', name: 'Yapay Zeka Entegrasyonu', strategicAreaId: 'comp-a-sa-1', companyId: 'company-a', responsibleUnit: 'Teknoloji', description: 'AI teknolojilerinin iş süreçlerine entegrasyonu' },
      { id: 'comp-a-obj-2', code: 'A2.1-A', name: 'Müşteri Destek Sistemi', strategicAreaId: 'comp-a-sa-2', companyId: 'company-a', responsibleUnit: 'Genel Müdürlük', description: '7/24 müşteri desteği sağlama' }
    ],
    targets: [
      { id: 'comp-a-t-1', code: 'H1.1.1-A', name: 'AI projelerinin %80 tamamlanması', objectiveId: 'comp-a-obj-1', companyId: 'company-a', startYear: 2024, endYear: 2025, responsibleUnit: 'Teknoloji', plannedStartDate: '2024-01-01', plannedEndDate: '2024-12-31', completion_percentage: 65 },
      { id: 'comp-a-t-2', code: 'H2.1.1-A', name: 'Müşteri memnuniyet skorunun 4.5/5 olması', objectiveId: 'comp-a-obj-2', companyId: 'company-a', startYear: 2024, endYear: 2025, responsibleUnit: 'Genel Müdürlük', plannedStartDate: '2024-01-01', plannedEndDate: '2024-12-31', completion_percentage: 75 }
    ],
    indicators: [
      { id: 'comp-a-ind-1', code: 'G1.1.1.1-A', name: 'Tamamlanan AI Proje Sayısı', targetId: 'comp-a-t-1', companyId: 'company-a', targetValue: 10, actualValue: 8, unit: 'Adet', measurementType: 'Sayısal' },
      { id: 'comp-a-ind-2', code: 'G2.1.1.1-A', name: 'Müşteri Memnuniyet Skoru', targetId: 'comp-a-t-2', companyId: 'company-a', targetValue: 4.5, actualValue: 4.2, unit: 'Puan', measurementType: 'Sayısal' }
    ],
    activities: [
      { id: 'comp-a-act-1', code: 'F1.1.1.1-A', name: 'AI Altyapı Kurulumu', targetId: 'comp-a-t-1', companyId: 'company-a', plannedBudget: 500000, budgetChapterId: 'comp-a-chap-1', status: 'Devam Ediyor', responsibleUnit: 'Teknoloji', plannedStartDate: '2024-02-01', plannedEndDate: '2024-11-30' },
      { id: 'comp-a-act-2', code: 'F2.1.1.1-A', name: 'Müşteri Anket Sistemi', targetId: 'comp-a-t-2', companyId: 'company-a', plannedBudget: 150000, budgetChapterId: 'comp-a-chap-2', status: 'Tamamlandı', responsibleUnit: 'Genel Müdürlük', plannedStartDate: '2024-01-01', plannedEndDate: '2024-06-30' }
    ],
    budgetChapters: [
      { id: 'comp-a-chap-1', code: '01.1-A', name: 'Teknoloji Yatırımları', description: 'Yazılım ve donanım', companyId: 'company-a', annualBudget: 2000000 },
      { id: 'comp-a-chap-2', code: '03.2-A', name: 'Pazarlama Giderleri', description: 'Reklam ve tanıtım', companyId: 'company-a', annualBudget: 800000 }
    ],
    expenses: [
      { id: 'comp-a-exp-1', activityId: 'comp-a-act-1', companyId: 'company-a', date: '2024-02-15', description: 'Sunucu alımı', amount: 300000, vatRate: 20, totalAmount: 360000, status: 'Onaylandı', budgetChapterId: 'comp-a-chap-1' },
      { id: 'comp-a-exp-2', activityId: 'comp-a-act-2', companyId: 'company-a', date: '2024-03-20', description: 'Anket platformu lisansı', amount: 120000, vatRate: 20, totalAmount: 144000, status: 'Onaylandı', budgetChapterId: 'comp-a-chap-2' }
    ],
    risks: [
      { 
        id: 'comp-a-r-1', name: 'Teknoloji Gecikmesi', description: 'AI projelerinde teknik zorluklar', 
        companyId: 'company-a', score: 12, probability: 3, impact: 4, status: 'Aktif', linkedEntityType: 'Faaliyet', linkedEntityId: 'comp-a-act-1',
        responsible: 'Teknoloji', targetDate: '2024-12-31'
      }
    ]
  };

  // ============================================
  // COMPANY B DATA
  // ============================================
  const companyB = {
    id: 'company-b',
    name: 'Manufacturing B',
    units: [
      { unitId: 'comp-b-org-1', unitName: 'Genel Müdürlük', unitCode: 'GM-B', status: 'aktif', companyId: 'company-b', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { unitId: 'comp-b-org-2', unitName: 'Üretim', unitCode: 'PROD-B', status: 'aktif', companyId: 'company-b', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { unitId: 'comp-b-org-3', unitName: 'Kalite Kontrol', unitCode: 'QC-B', status: 'aktif', companyId: 'company-b', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    users: [
      { 
        userId: 'comp-b-admin', 
        fullName: 'Mehmet Kaya', 
        email: 'mehmet@companyb.com', 
        roleId: 'admin', 
        unitId: 'comp-b-org-1',
        companyId: 'company-b',
        status: 'aktif',
        password: 'admin123',
        mustChangePassword: false,
        lastLoginDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        userId: 'comp-b-user1', 
        fullName: 'Fatma Şahin', 
        email: 'fatma@companyb.com', 
        roleId: 'unit-manager', 
        unitId: 'comp-b-org-2',
        companyId: 'company-b',
        status: 'aktif',
        password: 'user123',
        mustChangePassword: false,
        lastLoginDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    strategicAreas: [
      { id: 'comp-b-sa-1', code: 'SA1-B', name: 'Üretim Verimliliği', organizationId: 'comp-b-org-2', companyId: 'company-b', responsibleUnit: 'Üretim', description: 'Üretim süreçlerinin optimizasyonu' },
      { id: 'comp-b-sa-2', code: 'SA2-B', name: 'Kalite Yönetimi', organizationId: 'comp-b-org-3', companyId: 'company-b', responsibleUnit: 'Kalite Kontrol', description: 'Ürün kalitesinin artırılması' }
    ],
    strategicObjectives: [
      { id: 'comp-b-obj-1', code: 'A1.1-B', name: 'Otomasyon Artışı', strategicAreaId: 'comp-b-sa-1', companyId: 'company-b', responsibleUnit: 'Üretim', description: 'Üretim hatlarının otomasyonu' },
      { id: 'comp-b-obj-2', code: 'A2.1-B', name: 'Kalite Standartları', strategicAreaId: 'comp-b-sa-2', companyId: 'company-b', responsibleUnit: 'Kalite Kontrol', description: 'ISO standartlarına uyum' }
    ],
    targets: [
      { id: 'comp-b-t-1', code: 'H1.1.1-B', name: 'Üretim kapasitesinin %30 artırılması', objectiveId: 'comp-b-obj-1', companyId: 'company-b', startYear: 2024, endYear: 2025, responsibleUnit: 'Üretim', plannedStartDate: '2024-01-01', plannedEndDate: '2024-12-31', completion_percentage: 45 },
      { id: 'comp-b-t-2', code: 'H2.1.1-B', name: 'Hata oranının %50 azaltılması', objectiveId: 'comp-b-obj-2', companyId: 'company-b', startYear: 2024, endYear: 2025, responsibleUnit: 'Kalite Kontrol', plannedStartDate: '2024-01-01', plannedEndDate: '2024-12-31', completion_percentage: 60 }
    ],
    indicators: [
      { id: 'comp-b-ind-1', code: 'G1.1.1.1-B', name: 'Günlük Üretim Miktarı', targetId: 'comp-b-t-1', companyId: 'company-b', targetValue: 1000, actualValue: 750, unit: 'Adet', measurementType: 'Sayısal' },
      { id: 'comp-b-ind-2', code: 'G2.1.1.1-B', name: 'Hata Oranı', targetId: 'comp-b-t-2', companyId: 'company-b', targetValue: 0.5, actualValue: 0.8, unit: '%', measurementType: 'Sayısal' }
    ],
    activities: [
      { id: 'comp-b-act-1', code: 'F1.1.1.1-B', name: 'Yeni Üretim Hattı Kurulumu', targetId: 'comp-b-t-1', companyId: 'company-b', plannedBudget: 2000000, budgetChapterId: 'comp-b-chap-1', status: 'Planlandı', responsibleUnit: 'Üretim', plannedStartDate: '2024-03-01', plannedEndDate: '2024-09-30' },
      { id: 'comp-b-act-2', code: 'F2.1.1.1-B', name: 'Kalite Kontrol Sistemi', targetId: 'comp-b-t-2', companyId: 'company-b', plannedBudget: 500000, budgetChapterId: 'comp-b-chap-2', status: 'Devam Ediyor', responsibleUnit: 'Kalite Kontrol', plannedStartDate: '2024-02-01', plannedEndDate: '2024-08-30' }
    ],
    budgetChapters: [
      { id: 'comp-b-chap-1', code: '01.1-B', name: 'Makine ve Ekipman', description: 'Üretim makineleri', companyId: 'company-b', annualBudget: 5000000 },
      { id: 'comp-b-chap-2', code: '03.2-B', name: 'Kalite Sistemleri', description: 'Test ve ölçüm cihazları', companyId: 'company-b', annualBudget: 1500000 }
    ],
    expenses: [
      { id: 'comp-b-exp-1', activityId: 'comp-b-act-1', companyId: 'company-b', date: '2024-04-10', description: 'Makine alımı', amount: 1500000, vatRate: 20, totalAmount: 1800000, status: 'Beklemede', budgetChapterId: 'comp-b-chap-1' },
      { id: 'comp-b-exp-2', activityId: 'comp-b-act-2', companyId: 'company-b', date: '2024-02-25', description: 'Test cihazı', amount: 250000, vatRate: 20, totalAmount: 300000, status: 'Onaylandı', budgetChapterId: 'comp-b-chap-2' }
    ],
    risks: [
      { 
        id: 'comp-b-r-1', name: 'Makine Arızası', description: 'Eski makinelerin arıza riski', 
        companyId: 'company-b', score: 15, probability: 3, impact: 5, status: 'Aktif', linkedEntityType: 'Faaliyet', linkedEntityId: 'comp-b-act-1',
        responsible: 'Üretim', targetDate: '2024-12-31'
      }
    ]
  };

  // Merge both companies' data
  const allUnits = [...companyA.units, ...companyB.units];
  const allUsers = [...companyA.users, ...companyB.users];
  const allStrategicAreas = [...companyA.strategicAreas, ...companyB.strategicAreas];
  const allStrategicObjectives = [...companyA.strategicObjectives, ...companyB.strategicObjectives];
  const allTargets = [...companyA.targets, ...companyB.targets];
  const allIndicators = [...companyA.indicators, ...companyB.indicators];
  const allActivities = [...companyA.activities, ...companyB.activities];
  const allBudgetChapters = [...companyA.budgetChapters, ...companyB.budgetChapters];
  const allExpenses = [...companyA.expenses, ...companyB.expenses];
  const allRisks = [...companyA.risks, ...companyB.risks];

  // Check existing data
  const existingUsersStr = localStorage.getItem('users');
  let existingUsers = [];
  if (existingUsersStr) {
    try {
      existingUsers = JSON.parse(existingUsersStr);
    } catch (e) {
      existingUsers = [];
    }
  }

  // Merge users, keeping existing and adding new company users
  const mergedUsers = [...existingUsers];
  allUsers.forEach(newUser => {
    if (!mergedUsers.some(u => u.email === newUser.email)) {
      mergedUsers.push(newUser);
    }
  });

  // Initialize or update data
  if (!localStorage.getItem('units') || !localStorage.getItem('strategicAreas')) {
    localStorage.setItem('units', JSON.stringify(allUnits));
    localStorage.setItem('organizations', JSON.stringify(allUnits)); // Backward compatibility
    localStorage.setItem('users', JSON.stringify(mergedUsers));
    localStorage.setItem('strategicAreas', JSON.stringify(allStrategicAreas));
    localStorage.setItem('strategicObjectives', JSON.stringify(allStrategicObjectives));
    localStorage.setItem('targets', JSON.stringify(allTargets));
    localStorage.setItem('indicators', JSON.stringify(allIndicators));
    localStorage.setItem('activities', JSON.stringify(allActivities));
    localStorage.setItem('budgetChapters', JSON.stringify(allBudgetChapters));
    localStorage.setItem('expenses', JSON.stringify(allExpenses));
    localStorage.setItem('risks', JSON.stringify(allRisks));
  } else {
    // Update users if needed
    localStorage.setItem('users', JSON.stringify(mergedUsers));
  }
};
