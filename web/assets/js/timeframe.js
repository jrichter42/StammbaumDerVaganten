import { datePartsFromRaw, dateRawString } from './date-values.js';

export const timeframePrecisions = ['year', 'month', 'day'];

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export function emptyTimeframe() {
  return { start: null, end: null };
}

export function parseTimeframePoint(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return null;
  }

  const match = raw.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : null;
  const day = match[3] ? Number(match[3]) : null;
  if (year < 1 || year > 9999 || (month !== null && (month < 1 || month > 12))) {
    return null;
  }
  if (day !== null && (day < 1 || day > daysInMonth(year, month))) {
    return null;
  }

  return {
    year,
    month,
    day,
    precision: day !== null ? 'day' : (month !== null ? 'month' : 'year'),
  };
}

export function serializeTimeframePoint(point) {
  if (!point?.year) {
    return '';
  }

  const year = String(point.year).padStart(4, '0');
  if (point.precision === 'year' || !point.month) {
    return year;
  }

  const month = String(point.month).padStart(2, '0');
  if (point.precision === 'month' || !point.day) {
    return `${year}-${month}`;
  }

  return `${year}-${month}-${String(point.day).padStart(2, '0')}`;
}

export function timeframeFromSearchParams(params) {
  const start = parseTimeframePoint(params.get('zeit') || params.get('from') || '');
  const end = parseTimeframePoint(params.get('bis') || params.get('to') || '');
  if (!start) {
    return emptyTimeframe();
  }

  const normalizedEnd = end && pointEndKey(end) >= pointStartKey(start) ? end : null;
  return { start, end: normalizedEnd };
}

export function writeTimeframeSearchParams(params, timeframe) {
  ['zeit', 'bis', 'from', 'to'].forEach((name) => params.delete(name));
  if (!timeframe?.start) {
    return params;
  }

  params.set('zeit', serializeTimeframePoint(timeframe.start));
  if (timeframe.end) {
    params.set('bis', serializeTimeframePoint(timeframe.end));
  }
  return params;
}

export function timeframeLabel(timeframe) {
  if (!timeframe?.start) {
    return 'Gesamte Zeit';
  }

  const start = timeframePointLabel(timeframe.start);
  return timeframe.end ? `${start}–${timeframePointLabel(timeframe.end)}` : start;
}

export function timeframePointLabel(point) {
  if (!point?.year) {
    return '';
  }
  if (point.precision === 'day' && point.month && point.day) {
    return `${point.day}. ${monthNames[point.month - 1]} ${point.year}`;
  }
  if (point.precision === 'month' && point.month) {
    return `${monthNames[point.month - 1]} ${point.year}`;
  }
  return String(point.year);
}

export function timeframeBounds(timeframe) {
  if (!timeframe?.start) {
    return null;
  }

  const end = timeframe.end || timeframe.start;
  return {
    start: pointStartKey(timeframe.start),
    end: pointEndKey(end),
  };
}

export function stepTimeframePoint(point, years) {
  if (!point?.year) {
    return null;
  }

  const year = clamp(point.year + Number(years || 0), 1, 9999);
  const day = point.day ? Math.min(point.day, daysInMonth(year, point.month)) : null;
  return { ...point, year, day };
}

export function setTimeframePointPrecision(point, precision) {
  if (!point?.year || !timeframePrecisions.includes(precision)) {
    return point;
  }

  if (precision === 'year') {
    return { year: point.year, month: null, day: null, precision };
  }
  if (precision === 'month') {
    return { year: point.year, month: point.month || 1, day: null, precision };
  }
  return { year: point.year, month: point.month || 1, day: point.day || 1, precision };
}

export function updateTimeframePoint(point, values) {
  const next = { ...point, ...values };
  next.year = clamp(Number(next.year) || new Date().getFullYear(), 1, 9999);
  if (next.precision === 'year') {
    next.month = null;
    next.day = null;
  } else {
    next.month = clamp(Number(next.month) || 1, 1, 12);
    if (next.precision === 'day') {
      next.day = clamp(Number(next.day) || 1, 1, daysInMonth(next.year, next.month));
    } else {
      next.day = null;
    }
  }
  return next;
}

export function dateValueBounds(value) {
  const parts = datePartsFromRaw(dateRawString(value));
  if (!parts || parts.year === '0000') {
    return null;
  }

  const point = {
    year: Number(parts.year),
    month: parts.month === '00' ? null : Number(parts.month),
    day: parts.day === '00' ? null : Number(parts.day),
    precision: parts.day !== '00' ? 'day' : (parts.month !== '00' ? 'month' : 'year'),
  };
  return { start: pointStartKey(point), end: pointEndKey(point) };
}

export function periodBounds(period, resolveTimepoint = () => null) {
  if (!period || typeof period !== 'object') {
    return null;
  }

  const start = dateValueBounds(resolveTimepoint(period.startTimepoint) || period.customStart);
  const end = dateValueBounds(resolveTimepoint(period.endTimepoint) || period.customEnd);
  if (!start && !end) {
    return null;
  }

  return { start: start?.start ?? null, end: end?.end ?? null };
}

export function boundsOverlap(left, right) {
  if (!left || !right || (left.start === null && left.end === null) || (right.start === null && right.end === null)) {
    return false;
  }

  const leftStart = left.start ?? Number.NEGATIVE_INFINITY;
  const leftEnd = left.end ?? Number.POSITIVE_INFINITY;
  const rightStart = right.start ?? Number.NEGATIVE_INFINITY;
  const rightEnd = right.end ?? Number.POSITIVE_INFINITY;
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

export function combineBounds(boundsList) {
  const known = (boundsList || []).filter(Boolean);
  if (!known.length) {
    return null;
  }

  const starts = known.map((bounds) => bounds.start).filter(Number.isFinite);
  const ends = known.map((bounds) => bounds.end).filter(Number.isFinite);
  return {
    start: starts.length === known.length ? Math.min(...starts) : null,
    end: ends.length === known.length ? Math.max(...ends) : null,
  };
}

export function clipBounds(bounds, timeframe) {
  const scope = timeframeBounds(timeframe);
  if (!bounds || !scope || !boundsOverlap(bounds, scope)) {
    return scope ? null : bounds;
  }
  return {
    start: Math.max(bounds.start ?? scope.start, scope.start),
    end: Math.min(bounds.end ?? scope.end, scope.end),
    continuesBefore: bounds.start === null || bounds.start < scope.start,
    continuesAfter: bounds.end === null || bounds.end > scope.end,
  };
}

export function dateKeyToParts(key) {
  if (!Number.isFinite(key)) {
    return null;
  }
  return {
    year: Math.floor(key / 10000),
    month: Math.floor((key % 10000) / 100),
    day: key % 100,
  };
}

export function dateKeyLabel(key) {
  const parts = dateKeyToParts(key);
  return parts
    ? `${String(parts.day).padStart(2, '0')}.${String(parts.month).padStart(2, '0')}.${parts.year}`
    : '';
}

function pointStartKey(point) {
  return point.year * 10000 + (point.month || 1) * 100 + (point.day || 1);
}

function pointEndKey(point) {
  const month = point.month || 12;
  const day = point.day || daysInMonth(point.year, month);
  return point.year * 10000 + month * 100 + day;
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month || 1, 0)).getUTCDate();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
