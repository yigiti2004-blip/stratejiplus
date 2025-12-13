export const CodeGenerator = {
  generateAreaCode: (existingAreas) => {
    const maxNum = existingAreas && existingAreas.length > 0
      ? Math.max(...existingAreas.map(a => {
          const match = a.code ? a.code.match(/SA(\d+)/) : null;
          return match ? parseInt(match[1]) : 0;
        }))
      : 0;
    return `SA${maxNum + 1}`;
  },

  generateObjectiveCode: (parentAreaCode, existingObjectives) => {
    if (!parentAreaCode) return 'A?.?';
    // Parent SA1 -> Area Num 1
    const areaNumMatch = parentAreaCode.match(/SA(\d+)/);
    const areaNum = areaNumMatch ? areaNumMatch[1] : parentAreaCode.replace(/\D/g, ''); // Fallback
    
    const prefix = `A${areaNum}.`;
    const objectivesInArea = existingObjectives.filter(o => o.code && o.code.startsWith(prefix));
    
    const maxNum = objectivesInArea.length > 0
      ? Math.max(...objectivesInArea.map(o => {
          const parts = o.code.split('.');
          return parseInt(parts[parts.length - 1]) || 0;
        }))
      : 0;
    
    return `${prefix}${maxNum + 1}`;
  },

  generateTargetCode: (parentObjectiveCode, existingTargets) => {
    if (!parentObjectiveCode) return 'H?.?.?';
    // Parent A1.1 -> H1.1.x
    // Replace leading A with H
    const prefixBase = parentObjectiveCode.replace(/^A/, 'H');
    const prefix = `${prefixBase}.`;
    
    const targetsUnderObjective = existingTargets.filter(t => t.code && t.code.startsWith(prefix));
    
    const maxNum = targetsUnderObjective.length > 0
      ? Math.max(...targetsUnderObjective.map(t => {
          const parts = t.code.split('.');
          return parseInt(parts[parts.length - 1]) || 0;
        }))
      : 0;
      
    return `${prefix}${maxNum + 1}`;
  },

  generateIndicatorCode: (parentTargetCode, existingIndicators) => {
    if (!parentTargetCode) return 'G?.?.?.?';
    // Parent H1.1.1 -> G1.1.1.x
    const prefixBase = parentTargetCode.replace(/^H/, 'G');
    const prefix = `${prefixBase}.`;
    
    const indicatorsUnderTarget = existingIndicators.filter(i => i.code && i.code.startsWith(prefix));
    
    const maxNum = indicatorsUnderTarget.length > 0
      ? Math.max(...indicatorsUnderTarget.map(i => {
          const parts = i.code.split('.');
          return parseInt(parts[parts.length - 1]) || 0;
        }))
      : 0;
      
    return `${prefix}${maxNum + 1}`;
  },

  generateActivityCode: (parentTargetCode, existingActivities) => {
    if (!parentTargetCode) return 'F?.?.?.?';
    // Parent H1.1.1 -> F1.1.1.x
    const prefixBase = parentTargetCode.replace(/^H/, 'F');
    const prefix = `${prefixBase}.`;
    
    const activitiesUnderTarget = existingActivities.filter(a => a.code && a.code.startsWith(prefix));
    
    const maxNum = activitiesUnderTarget.length > 0
      ? Math.max(...activitiesUnderTarget.map(a => {
          const parts = a.code.split('.');
          return parseInt(parts[parts.length - 1]) || 0;
        }))
      : 0;
      
    return `${prefix}${maxNum + 1}`;
  }
};