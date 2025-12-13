
import { useMemo } from 'react';
import { useInstitutionalContinuity } from './useInstitutionalContinuity';
import { useAnnualWorkPlan } from './useAnnualWorkPlan';

export const useTimelineData = (year) => {
  const { generateContinuityInstancesForYear, continuityActivities } = useInstitutionalContinuity();
  const { getStrategicPlanActivitiesForYear, getYearSpecificWorkForYear, yearSpecificWork, spActivities } = useAnnualWorkPlan();

  const timelineData = useMemo(() => {
    const continuityItems = generateContinuityInstancesForYear(year);
    const specificItems = getYearSpecificWorkForYear(year);
    const spItems = getStrategicPlanActivitiesForYear(year);

    const allItems = [
      ...continuityItems,
      ...specificItems,
      ...spItems
    ];

    // Sort by start date
    return allItems.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [year, continuityActivities, yearSpecificWork, spActivities, generateContinuityInstancesForYear, getStrategicPlanActivitiesForYear, getYearSpecificWorkForYear]);

  return timelineData;
};
