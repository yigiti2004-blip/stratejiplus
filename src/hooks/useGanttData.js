
import { useMemo } from 'react';
import { useTimelineData } from './useTimelineData';

export const useGanttData = (year, month = 'all') => {
  // Leverage the existing timeline logic which already combines and processes all sources
  const allItems = useTimelineData(year);

  const ganttData = useMemo(() => {
    // 1. Filter by month if selected
    let filteredItems = allItems;
    
    if (month !== 'all') {
      const monthIndex = parseInt(month, 10);
      filteredItems = allItems.filter(item => {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        
        // Check if the item's duration overlaps with the selected month
        // Item starts before end of month AND ends after start of month
        const monthStart = new Date(year, monthIndex, 1);
        const monthEnd = new Date(year, monthIndex + 1, 0); // Last day of month
        
        return startDate <= monthEnd && endDate >= monthStart;
      });
    }

    // 2. Add Gantt-specific properties (positions, widths)
    // We'll calculate these relative to the view (year or month)
    const viewStart = month === 'all' 
      ? new Date(year, 0, 1) 
      : new Date(year, parseInt(month), 1);
      
    const viewEnd = month === 'all' 
      ? new Date(year, 11, 31) 
      : new Date(year, parseInt(month) + 1, 0);

    const totalDuration = viewEnd - viewStart;

    return filteredItems.map(item => {
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);

      // Clamp dates to view range for visualization
      const visualStart = startDate < viewStart ? viewStart : startDate;
      const visualEnd = endDate > viewEnd ? viewEnd : endDate;

      // Calculate percentages for CSS positioning
      const startPercent = Math.max(0, ((visualStart - viewStart) / totalDuration) * 100);
      const durationPercent = Math.max(0.5, ((visualEnd - visualStart) / totalDuration) * 100); // Min width 0.5% visibility

      return {
        ...item,
        visualStart,
        visualEnd,
        startPercent,
        durationPercent,
        isClampedStart: startDate < viewStart,
        isClampedEnd: endDate > viewEnd
      };
    });
  }, [allItems, year, month]);

  return ganttData;
};
