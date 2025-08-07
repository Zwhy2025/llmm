import dayjs from 'dayjs';

/**
 * Formats a timestamp into a more readable string.
 * @param {string | Date} time The timestamp to format.
 * @param {string} format The desired output format.
 * @returns {string} The formatted time string.
 */
export function formatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return '';
  return dayjs(time).format(format);
}

/**
 * Gets the display name for an API type.
 * @param {string} type The API type slug.
 * @returns {string} The display name.
 */
export function getApiTypeName(type) {
  const typeNames = {
    'openai': 'OpenAI 兼容',
    'anthropic': 'Anthropic Claude',
    'custom': '自定义'
  };
  return typeNames[type] || type;
}

/**
 * Gets the Element Plus tag type for an API type.
 * @param {string} type The API type slug.
 * @returns {string} The tag type (e.g., 'primary', 'success').
 */
export function getApiTypeTagType(type) {
  const typeMap = {
    'openai': 'primary',
    'anthropic': 'success',
    'custom': 'warning'
  };
  return typeMap[type] || 'info';
}
