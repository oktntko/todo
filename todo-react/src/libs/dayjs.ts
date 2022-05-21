import dayjs from "dayjs";
import ja from "dayjs/locale/ja";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.locale(ja);
dayjs.extend(customParseFormat);

export default dayjs;
