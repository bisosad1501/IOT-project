const last7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
    }
    return days;
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
}

const getDatesInMonth = (month, year) => {
  const dates = [];
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) { 
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    dates.push(formattedDate);
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

export { last7Days, formatDate, getDatesInMonth }

