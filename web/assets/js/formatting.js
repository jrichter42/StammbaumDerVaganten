export function publicYearSpan(years) {
  const numeric = (years || []).flatMap((value) => String(value || '').match(/\d{4}/g) || [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  if (!numeric.length) {
    return '';
  }

  const start = Math.min(...numeric);
  const end = Math.max(...numeric);
  return start === end ? String(start) : `${start}-${end}`;
}

export function publicGraphShortLabel(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

export function shortObjectId(id) {
  return String(id || '').slice(0, 8);
}

export function foldSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de')
    .replace(/\s+/g, ' ')
    .trim();
}

export function modifiedDateLine(value) {
  return [
    relativeModifiedDisplay(value),
    modifiedDateDisplay(value),
  ].filter(Boolean).join(' · ');
}

export function relativeModifiedDisplay(value) {
  const date = modifiedDateValue(value);
  if (!date) {
    return '';
  }

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;
  let valueLabel = 'jetzt';

  if (diffMs >= year) {
    valueLabel = `${Math.floor(diffMs / year)}y`;
  } else if (diffMs >= month) {
    valueLabel = `${Math.floor(diffMs / month)}mo`;
  } else if (diffMs >= day) {
    valueLabel = `${Math.floor(diffMs / day)}d`;
  } else if (diffMs >= hour) {
    valueLabel = `${Math.floor(diffMs / hour)}h`;
  } else if (diffMs >= minute) {
    valueLabel = `${Math.floor(diffMs / minute)}m`;
  }

  return valueLabel;
}

export function modifiedDateValue(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return null;
  }

  const time = Date.parse(raw);
  return Number.isNaN(time) ? null : new Date(time);
}

export function modifiedDateDisplay(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!match) {
    return raw;
  }

  const date = `${match[3]}.${match[2]}.${match[1]}`;
  return match[4] && match[5] ? `${date} ${match[4]}:${match[5]}` : date;
}

export function uniqueStrings(values) {
  const seen = new Set();
  const result = [];
  values.forEach((value) => {
    const text = String(value || '').trim();
    const key = text.toLocaleLowerCase('de-DE');
    if (!text || seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(text);
  });
  return result;
}

export function hasTrimmedText(value) {
  return String(value || '').trim() !== '';
}

export function normalizedText(value) {
  return String(value || '').trim().toLocaleLowerCase('de-DE');
}

export function formatDateTime(value) {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) {
    return value || '';
  }

  const formattedDate = new Intl.DateTimeFormat('de', {
    dateStyle: 'medium',
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat('de', {
    timeStyle: 'short',
  }).format(date);
  return `${formattedDate} ${formattedTime}`;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}
