// Company utility functions

const COMPANY_MAP = {
  'company-a': { id: 'company-a', name: 'TechCorp A', color: 'blue' },
  'company-b': { id: 'company-b', name: 'Manufacturing B', color: 'green' },
  'comp-A': { id: 'comp-A', name: 'TechCorp A', color: 'blue' },
  'comp-B': { id: 'comp-B', name: 'Manufacturing B', color: 'green' },
  'comp-a': { id: 'comp-a', name: 'TechCorp A', color: 'blue' },
  'comp-b': { id: 'comp-b', name: 'Manufacturing B', color: 'green' },
};

export const getCompanyName = (companyId) => {
  if (!companyId) return 'Bilinmeyen Şirket';
  return COMPANY_MAP[companyId]?.name || companyId;
};

export const getCompanyColor = (companyId) => {
  if (!companyId) return 'gray';
  return COMPANY_MAP[companyId]?.color || 'gray';
};

export const getCompanyBadge = (companyId) => {
  const name = getCompanyName(companyId);
  const color = getCompanyColor(companyId);
  
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  
  return {
    name,
    color,
    className: colorClasses[color] || colorClasses.gray
  };
};

