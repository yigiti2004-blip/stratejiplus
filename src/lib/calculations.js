
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);
};

export const calculateCompletion = (actual, target, type = 'increasing') => {
  const numActual = Number(actual) || 0;
  const numTarget = Number(target) || 0;

  if (!numTarget && numTarget !== 0) return 0;
  if (numTarget === 0) return 0;

  let completion = 0;
  
  if (type === 'decreasing') {
    if (numActual === 0) return 100;
    completion = (numTarget / numActual) * 100;
  } else {
    completion = (numActual / numTarget) * 100;
  }
  
  return Math.min(Math.max(completion, 0), 100);
};

const calculateAverage = (items) => {
  const activeItems = items ? items.filter(item => item.status !== 'İptal Edildi') : [];
  if (!activeItems || activeItems.length === 0) return 0;
  const total = activeItems.reduce((sum, item) => sum + (item.completion || 0), 0);
  return total / activeItems.length;
};

export const calculateIndicatorStats = (indicator) => {
  if (indicator.status === 'İptal Edildi') return { ...indicator, completion: 0 };
  const completion = calculateCompletion(indicator.actualValue, indicator.targetValue);
  return { ...indicator, completion };
};

export const calculateTargetStats = (target, indicators) => {
  if (target.status === 'İptal Edildi') return { ...target, completion: 0, indicators: [] };
  const targetInds = indicators
    .filter(i => i.targetId === target.id)
    .map(calculateIndicatorStats);
  const activeInds = targetInds.filter(i => i.status !== 'İptal Edildi');
  const completion = calculateAverage(activeInds);
  return { ...target, completion, indicators: targetInds };
};

export const calculateObjectiveStats = (objective, targets, indicators) => {
  if (objective.status === 'İptal Edildi') return { ...objective, completion: 0, targets: [] };
  const objTargets = targets
    .filter(t => t.objectiveId === objective.id)
    .map(t => calculateTargetStats(t, indicators));
  const activeTargets = objTargets.filter(t => t.status !== 'İptal Edildi');
  const completion = calculateAverage(activeTargets);
  return { ...objective, completion, targets: objTargets };
};

export const calculateAreaStats = (area, objectives, targets, indicators) => {
  if (area.status === 'İptal Edildi') return { ...area, completion: 0, objectives: [] };
  const areaObjs = objectives
    .filter(o => o.strategicAreaId === area.id)
    .map(o => calculateObjectiveStats(o, targets, indicators));
  const activeObjs = areaObjs.filter(o => o.status !== 'İptal Edildi');
  const completion = calculateAverage(activeObjs);
  return { ...area, completion, objectives: areaObjs };
};

export const calculateAreaCompletion = (areaId, year) => {
  try {
    const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
    const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
    const targets = JSON.parse(localStorage.getItem('targets') || '[]');
    const indicators = JSON.parse(localStorage.getItem('indicators') || '[]');
    
    const area = areas.find(a => a.id === areaId);
    if (!area || area.status === 'İptal Edildi') return 0;
    
    const stats = calculateAreaStats(area, objectives, targets, indicators);
    return stats.completion || 0;
  } catch (e) {
    console.error("Calculation error:", e);
    return 0;
  }
};

export const getStatusColor = (percentage) => {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const getStatusLabel = (percentage) => {
  if (percentage >= 80) return { text: 'Başarılı', class: 'text-green-600 bg-green-50' };
  if (percentage >= 50) return { text: 'Orta Risk', class: 'text-yellow-600 bg-yellow-50' };
  return { text: 'Kritik', class: 'text-red-600 bg-red-50' };
};

export const calculateRiskScore = (probability, impact) => {
  return (Number(probability) || 0) * (Number(impact) || 0);
};

export const getRiskLevel = (score) => {
  if (score >= 16) return { label: 'Kritik', value: 'Critical', color: 'red', bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-500' };
  if (score >= 11) return { label: 'Yüksek', value: 'High', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', badge: 'bg-orange-500' };
  if (score >= 6) return { label: 'Orta', value: 'Medium', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-500' };
  return { label: 'Düşük', value: 'Low', color: 'green', bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-500' };
};

export const getRiskMatrixColor = (prob, imp) => {
  const score = prob * imp;
  const level = getRiskLevel(score);
  const map = {
    'red': 'bg-red-500',
    'orange': 'bg-orange-400',
    'yellow': 'bg-yellow-400',
    'green': 'bg-green-400'
  };
  return map[level.color];
};

export const calculateBudgetVariance = (planned, actual) => {
  const p = Number(planned) || 0;
  const a = Number(actual) || 0;
  const variance = p - a; // Variance: Planned - Actual (Positive means under budget, Negative means over budget)
  const percentage = p === 0 ? (a > 0 ? -100 : 0) : (variance / p) * 100;
  return { variance, percentage };
};

export const getBudgetStatus = (realizationPercentage) => {
  if (realizationPercentage > 100) {
    return { label: 'Aşım', color: 'red', bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
  }
  if (realizationPercentage < 60) {
    return { label: 'Düşük Gerçekleşme', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' };
  }
  return { label: 'Normal', color: 'green', bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' };
};

export const calculateActivityBudget = (activity, expenses) => {
  const activityExpenses = expenses.filter(e => e.activityId === activity.id && e.status !== 'Reddedildi');
  const actualBudget = activityExpenses.reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);
  const plannedBudget = activity.status === 'İptal Edildi' ? 0 : (Number(activity.plannedBudget) || 0);
  const { variance, percentage } = calculateBudgetVariance(plannedBudget, actualBudget);
  
  return {
    ...activity,
    actualBudget,
    plannedBudget,
    originalPlannedBudget: Number(activity.plannedBudget) || 0,
    variance,
    variancePercentage: percentage
  };
};

export const calculateChapterBudget = (chapter, activitiesWithBudget) => {
  const chapterActivities = activitiesWithBudget.filter(a => a.budgetChapterId === chapter.id);
  const plannedTotal = chapterActivities.reduce((sum, a) => sum + (Number(a.plannedBudget) || 0), 0);
  const actualTotal = chapterActivities.reduce((sum, a) => sum + (Number(a.actualBudget) || 0), 0);
  const { variance, percentage } = calculateBudgetVariance(plannedTotal, actualTotal);
  const allocationPercentage = (plannedTotal / (Number(chapter.annualBudget) || 1)) * 100;

  return {
    ...chapter,
    plannedTotal, 
    actualTotal,
    variance,
    variancePercentage: percentage,
    allocationPercentage
  };
};
