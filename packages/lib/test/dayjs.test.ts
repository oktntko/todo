import { dayjs } from '~/dayjs';

describe('dayjs', () => {
  describe('customParseFormat', () => {
    test.each`
      date                            | format                    | localeORstrict | match
      ${'05/02/69 1:02:03 PM -05:00'} | ${'MM/DD/YY H:mm:ss A Z'} | ${undefined}   | ${'1969-05-02T18:02:03.000Z'}
    `(
      'date=[$date] format=[$format] localeORstrict=[$localeORstrict] expect validate $match',
      ({ date, format, localeORstrict, match }) => {
        expect(dayjs(date, format, localeORstrict).toISOString()).toBe(match);
      },
    );
  });
});
