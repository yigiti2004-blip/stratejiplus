import React from 'react';
import { getCompanyBadge } from '@/lib/companyUtils';

export const CompanyBadge = ({ companyId, size = 'sm' }) => {
  if (!companyId) return null;
  
  const badge = getCompanyBadge(companyId);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-full border font-medium ${badge.className} ${sizeClasses[size]}`}
      title={`Şirket: ${badge.name}`}
    >
      {badge.name}
    </span>
  );
};

