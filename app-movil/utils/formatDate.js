export function formatDateToDDMMYYYY(fecha) {
  if (!fecha) return '';
  if (typeof fecha === 'string') {
    const [y, m, d] = fecha.split('-');
    if (y && m && d) return `${d}-${m}-${y}`;
    return fecha;
  }
  if (fecha instanceof Date) {
    const d = String(fecha.getDate()).padStart(2, '0');
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const y = fecha.getFullYear();
    return `${d}-${m}-${y}`;
  }
  return fecha;
}
//esto sirve para formatear la fecha de la base de datos a un formato de dd-mm-yyyy