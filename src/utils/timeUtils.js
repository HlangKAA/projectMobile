/**
 * Utility functions for handling time and conflict detection.
 */

/**
 * Parses a time string like "09:00 น. - 12:00 น." or "16.30-18.30" into start and end minutes from midnight.
 * handles both "HH:MM" and "HH.MM" formats.
 * @param {string} timeString
 * @returns {object|null} Object containing start and end in minutes, or null if invalid.
 */
export const parseTimeRange = (timeString) => {
  if (!timeString) return null;

  // Normalize separators and remove "น." or spaces
  const normalized = timeString.replace(/น\./g, "").replace(/\s/g, "");

  // Split by "-" to get start and end parts
  const parts = normalized.split("-");
  if (parts.length !== 2) return null;

  const startMinutes = parseMinutes(parts[0]);
  const endMinutes = parseMinutes(parts[1]);

  if (startMinutes === null || endMinutes === null) return null;

  return { start: startMinutes, end: endMinutes };
};

/**
 * Helper to parse "HH:MM" or "HH.MM" into minutes from midnight.
 * @param {string} timeStr
 * @returns {number|null}
 */
const parseMinutes = (timeStr) => {
  // Handle both colon and dot separators
  const separator = timeStr.includes(":") ? ":" : ".";
  const [hoursStr, minutesStr] = timeStr.split(separator);

  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return null;

  return hours * 60 + minutes;
};

/**
 * Checks if a new time range overlaps with any existing event.
 * @param {string} newTimeRange - The time string for the new event (e.g., "09:00 - 10:00").
 * @param {Array} existingEvents - Array of objects, each must have a 'time' property.
 * @returns {boolean} True if there is an overlap, false otherwise.
 */
export const isOverlapping = (newTimeRange, existingEvents) => {
  const newRange = parseTimeRange(newTimeRange);

  if (!newRange) {
    console.warn("Invalid time range format for new event:", newTimeRange);
    return false; // Or throw error depending on desired strictness
  }

  return existingEvents.some((event) => {
    if (!event.time) return false;

    const eventRange = parseTimeRange(event.time);
    if (!eventRange) return false;

    // Check if the two ranges overlap
    return newRange.start < eventRange.end && newRange.end > eventRange.start;
  });
};

/**
 * Returns the current time in minutes from midnight.
 * @returns {number}
 */
export const getCurrentTimeMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

/**
 * Checks if the current time is within the given time range.
 * @param {string} timeRange - "HH:MM - HH:MM"
 * @returns {boolean}
 */
export const isTimeCurrent = (timeRange) => {
  const range = parseTimeRange(timeRange);
  if (!range) return false;
  const current = getCurrentTimeMinutes();
  return current >= range.start && current < range.end;
};

/**
 * Checks if the time range is in the future (starts after current time).
 * @param {string} timeRange
 * @returns {boolean}
 */
export const isTimeUpcoming = (timeRange) => {
  const range = parseTimeRange(timeRange);
  if (!range) return false;
  const current = getCurrentTimeMinutes();
  return range.start > current;
};
