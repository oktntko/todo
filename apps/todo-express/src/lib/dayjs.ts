import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import isBetween from 'dayjs/plugin/isBetween.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export { dayjs };
