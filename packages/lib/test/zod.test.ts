import { DateSchema } from '~/zod';

describe('zod', () => {
  describe('DateSchema', () => {
    test.each`
      val             | match
      ${''}           | ${false}
      ${null}         | ${false}
      ${undefined}    | ${false}
      ${0}            | ${false}
      ${new Date()}   | ${false}
      ${{}}           | ${false}
      ${'2018-07-17'} | ${true}
      ${'2018/07/17'} | ${false}
      ${'2018-7-17'}  | ${false}
      ${'2018-11-7'}  | ${false}
      ${'2000-02-28'} | ${true}
      ${'2000-02-29'} | ${true}
      ${'2001-02-28'} | ${true}
      ${'2001-02-29'} | ${false}
    `('val=[$val] expect validate $match', ({ val, match }) => {
      expect(DateSchema.safeParse(val).success).toBe(match);
    });
  });
});
