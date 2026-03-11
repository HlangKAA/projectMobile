/**
 * Utility functions for handling time and conflict detection.
 */

/**
 * Parses a time string like "09:00 - 12:00" or "16.30-18.30" into {start, end} minutes.
 * @param {string} timeString
 * @returns {{start: number, end: number}|null}
 */
export const parseTimeRange = (timeString) => {
  if (!timeString) return null;
  const normalized = timeString.replace(/น\./g, "").replace(/\s/g, "");
  const parts = normalized.split("-");
  if (parts.length !== 2) return null;
  const startMinutes = parseMinutes(parts[0]);
  const endMinutes = parseMinutes(parts[1]);
  if (startMinutes === null || endMinutes === null) return null;
  return { start: startMinutes, end: endMinutes };
};

/**
 * Helper to parse "HH:MM" or "HH.MM" into minutes from midnight.
 */
const parseMinutes = (timeStr) => {
  const separator = timeStr.includes(":") ? ":" : ".";
  const [hoursStr, minutesStr] = timeStr.split(separator);
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

/**
 * Checks if a new time range overlaps with any existing event.
 * @param {string} newTimeRange
 * @param {Array} existingEvents - each must have a 'time' property
 * @returns {boolean}
 */
export const isOverlapping = (newTimeRange, existingEvents) => {
  return findConflicts(newTimeRange, existingEvents).length > 0;
};

/**
 * Finds all events that overlap with the given time range.
 * @param {string} newTimeRange
 * @param {Array} existingEvents - each must have a 'time' property
 * @returns {Array} - array of conflicting event objects
 */
export const findConflicts = (newTimeRange, existingEvents) => {
  const newRange = parseTimeRange(newTimeRange);
  if (!newRange) return [];

  return existingEvents.filter((event) => {
    if (!event.time) return false;
    const eventRange = parseTimeRange(event.time);
    if (!eventRange) return false;
    // Two ranges overlap if one starts before the other ends
    return newRange.start < eventRange.end && newRange.end > eventRange.start;
  });
};

/**
 * Returns the current time in minutes from midnight.
 */
export const getCurrentTimeMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

/**
 * Checks if the current time is within the given time range.
 * @param {string} timeRange - "HH:MM - HH:MM"
 */
export const isTimeCurrent = (timeRange) => {
  const range = parseTimeRange(timeRange);
  if (!range) return false;
  const current = getCurrentTimeMinutes();
  return current >= range.start && current < range.end;
};

/**
 * Checks if the time range is in the future (starts after current time).
 */
export const isTimeUpcoming = (timeRange) => {
  const range = parseTimeRange(timeRange);
  if (!range) return false;
  const current = getCurrentTimeMinutes();
  return range.start > current;
};
