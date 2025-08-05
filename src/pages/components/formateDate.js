// 📅 将 "2025-07-20" 转换为中午12点的 Date 对象（避免跨时区偏移）
export function parseDateToNoon(dateString) {
  const [year, month, day] = dateString.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
}
