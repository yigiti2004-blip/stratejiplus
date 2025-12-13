
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR').format(date);
  } catch (e) {
    return dateString;
  }
}

export function getDelayStatus(plannedEndDate, actualEndDate) {
  if (!plannedEndDate) return 'unknown';
  
  const planned = new Date(plannedEndDate);
  const now = new Date();
  
  // If completed (actualEndDate exists)
  if (actualEndDate) {
    const actual = new Date(actualEndDate);
    if (actual <= planned) return 'early'; // Completed on time or early
    return 'delayed'; // Completed late
  }
  
  // If not completed yet
  if (now > planned) return 'delayed'; // Overdue
  return 'pending'; // In progress, not overdue
}

export function getStatusColor(status) {
  const colors = {
    // Delay statuses
    'delayed': 'text-red-600 bg-red-50 border-red-200',
    'early': 'text-green-600 bg-green-50 border-green-200',
    'ontime': 'text-green-600 bg-green-50 border-green-200',
    'pending': 'text-blue-600 bg-blue-50 border-blue-200',
    'unknown': 'text-gray-600 bg-gray-50 border-gray-200',
    
    // General statuses (fallback if used elsewhere)
    'Kritik': 'text-red-600 bg-red-50 border-red-200',
    'Yüksek': 'text-orange-600 bg-orange-50 border-orange-200',
    'Orta': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'Düşük': 'text-green-600 bg-green-50 border-green-200',
    'Normal': 'text-green-600 bg-green-50 border-green-200',
    'Başarılı': 'text-green-600 bg-green-50 border-green-200'
  };

  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
}
