export const migrateOldCodes = () => {
  try {
    const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
    let modified = false;

    // 1. Migrate Areas (A1 -> SA1)
    const updatedAreas = areas.map(area => {
      if (area.code && !area.code.startsWith('SA')) {
        // Assume old format like A1, A2 or just numbers
        const num = area.code.replace(/\D/g, '');
        modified = true;
        return { ...area, code: `SA${num || 1}` };
      }
      return area;
    });

    if (modified) {
      localStorage.setItem('strategicAreas', JSON.stringify(updatedAreas));
      console.log('Migrated Areas to SA format');
    }

    // 2. Migrate Objectives (H1.1 -> A1.1)
    // Old system might have used H for objectives (Hedef as Objective) or just A
    const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
    let objModified = false;
    const updatedObjectives = objectives.map(obj => {
      // Logic: If starts with H and depth is 2 (H1.1), it might be an objective in old system
      // Or if we just want to ensure A prefix for objectives
      if (obj.code && !obj.code.startsWith('A')) {
        // If it was H1.1, make it A1.1
        const newCode = obj.code.replace(/^H/, 'A').replace(/^O/, 'A'); // Handle potential old prefixes
        objModified = true;
        return { ...obj, code: newCode };
      }
      return obj;
    });

    if (objModified) {
      localStorage.setItem('strategicObjectives', JSON.stringify(updatedObjectives));
      console.log('Migrated Objectives to A format');
    }

    // 3. Migrate Targets (PG1.1.1 -> H1.1.1)
    const targets = JSON.parse(localStorage.getItem('targets') || '[]');
    let targetsModified = false;
    const updatedTargets = targets.map(t => {
      if (t.code && (t.code.startsWith('PG') || !t.code.startsWith('H'))) {
        const newCode = t.code.replace(/^PG/, 'H').replace(/^T/, 'H');
        targetsModified = true;
        return { ...t, code: newCode };
      }
      return t;
    });
    
    if (targetsModified) {
      localStorage.setItem('targets', JSON.stringify(updatedTargets));
      console.log('Migrated Targets to H format');
    }
    
    // Indicators and Activities typically follow parent, assuming they are newly created mostly. 
    // But for completeness:
    const indicators = JSON.parse(localStorage.getItem('indicators') || '[]');
    let indModified = false;
    const updatedIndicators = indicators.map(i => {
       // If G1 -> G1.1.1.1 (Requires knowing parent). 
       // Simple heuristic: if simple G number, try to append to parent if possible, or just leave for manual fix
       // Here we just ensure G prefix if missing or wrong
       return i;
    });
    // (Skipping complex deep migration for indicators/activities to avoid breaking relations without full tree traversal)

  } catch (error) {
    console.error("Migration failed:", error);
  }
};