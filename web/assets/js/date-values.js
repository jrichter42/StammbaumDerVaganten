export function dateYear(value) {
  const display = dateDisplayValue(value);
  const match = String(display || '').match(/\d{4}/);
  return match ? match[0] : '';
}

export function dateDisplayValue(value) {
  const raw = dateRawString(value);
  if (!raw) {
    return '';
  }

  const parts = datePartsFromRaw(raw);
  if (!parts) {
    return raw;
  }

  if (parts.month === '00') {
    return parts.year;
  }

  if (parts.day === '00') {
    return `${parts.month}.${parts.year}`;
  }

  return `${parts.day}.${parts.month}.${parts.year}`;
}

export function dateInputValue(value) {
  return dateRawString(value);
}

export function dateRawString(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return normalizeDateRaw(value);
  }

  if (typeof value === 'object') {
    return normalizeDateRaw(value.rawValue || value.value || value.display || '');
  }

  return '';
}

export function normalizeDateRaw(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const parts = datePartsFromRaw(raw);
  if (!parts) {
    return raw;
  }

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function datePartsFromRaw(raw) {
  const value = String(raw || '').trim();
  let match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{1,4})$/);
  if (match) {
    return {
      year: match[3].padStart(4, '0'),
      month: match[2].padStart(2, '0'),
      day: match[1].padStart(2, '0'),
    };
  }

  match = value.match(/^(\d{1,2})\.(\d{1,4})$/);
  if (match) {
    return {
      year: match[2].padStart(4, '0'),
      month: match[1].padStart(2, '0'),
      day: '00',
    };
  }

  match = value.match(/^(\d{1,4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/);
  if (!match) {
    return null;
  }

  const year = match[1].padStart(4, '0');
  const month = match[2] === undefined ? '00' : match[2].padStart(2, '0');
  const day = match[3] === undefined ? '00' : match[3].padStart(2, '0');
  return { year, month, day };
}

export function dateDetailFromRaw(raw) {
  const parts = datePartsFromRaw(raw);
  if (!parts || parts.month === '00') {
    return 'year';
  }

  return parts.day === '00' ? 'month' : 'day';
}

export function dateVisibleValueForDetail(raw, detail) {
  const parts = datePartsFromRaw(raw);
  if (!parts) {
    return '';
  }

  if (detail === 'day') {
    return parts.year === '0000' ? '' : `${parts.day}.${parts.month}.${parts.year}`;
  }

  if (detail === 'month') {
    return parts.year === '0000' ? '' : `${parts.month}.${parts.year}`;
  }

  return parts.year === '0000' ? '' : parts.year;
}

export function dateRawForDetail(raw, detail) {
  const parts = datePartsFromRaw(raw);
  if (!parts) {
    return '';
  }

  if (detail === 'day') {
    return parts.month === '00' || parts.day === '00' ? '' : `${parts.year}-${parts.month}-${parts.day}`;
  }

  if (detail === 'month') {
    return parts.month === '00' ? `${parts.year}-00-00` : `${parts.year}-${parts.month}-00`;
  }

  return parts.year === '0000' ? '' : `${parts.year}-00-00`;
}

export function dateRawFromVisibleValue(value, detail) {
  const visible = String(value || '').trim();
  if (!visible) {
    return '';
  }

  const parts = datePartsFromRaw(visible);
  if (!parts) {
    return '';
  }

  if (detail === 'year') {
    return parts.year === '0000' ? '' : `${parts.year}-00-00`;
  }

  if (detail === 'month') {
    return parts.year === '0000' ? '' : `${parts.year}-${parts.month}-00`;
  }

  return parts.year === '0000' ? '' : `${parts.year}-${parts.month}-${parts.day}`;
}

export function datePlaceholderForDetail(detail) {
  if (detail === 'day') {
    return 'TT.MM.JJJJ';
  }

  if (detail === 'month') {
    return 'MM.JJJJ';
  }

  return 'JJJJ';
}

export function dateDetailScale() {
  return ['day', 'month', 'year'];
}

export function dateDetailRank(detail) {
  return { year: 0, month: 1, day: 2 }[detail] ?? 0;
}

export function dateDetailReductionRemovesValue(raw, targetDetail) {
  const parts = datePartsFromRaw(raw);
  if (!parts) {
    return false;
  }

  if (targetDetail === 'year') {
    return parts.month !== '00' || parts.day !== '00';
  }

  if (targetDetail === 'month') {
    return parts.day !== '00';
  }

  return false;
}
