export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const getMeasurementLabel = (key: string): string => {
  const labels: Record<string, string> = {
    chest: 'Грудь',
    waist: 'Талия',
    hips: 'Бедра',
    arms: 'Бицепс',
    forearms: 'Предплечье',
    thighs: 'Бедро',
    calves: 'Голень',
    neck: 'Шея'
  };
  return labels[key] || key;
}; 