import { ColorSchema, DateSchema, TimeSchema, z } from '~/zod';

describe('zod', () => {
  describe('DateSchema', () => {
    const error = {
      errors: ['無効な日付形式です。'],
    };
    test.each`
      arg              | success  | data            | error
      ${'1997-07-17'}  | ${true}  | ${'1997-07-17'} | ${undefined}
      ${'1997-7-17'}   | ${false} | ${undefined}    | ${error}
      ${'1997-07-7'}   | ${false} | ${undefined}    | ${error}
      ${'21997-07-17'} | ${false} | ${undefined}    | ${error}
      ${'1997-02-28'}  | ${true}  | ${'1997-02-28'} | ${undefined}
      ${'1997-02-29'}  | ${false} | ${undefined}    | ${error}
      ${'2000-02-29'}  | ${true}  | ${'2000-02-29'} | ${undefined}
    `(`parse($arg) => $success: 'data=$data' 'error=$error'`, ({ arg, success, data, error }) => {
      const result = DateSchema.safeParse(arg);
      expect(result.success).toBe(success);
      if (result.success) {
        expect(result.data).toBe(data);
      } else {
        expect(z.treeifyError(result.error)).toMatchObject(error);
      }
    });
  });

  describe('TimeSchema', () => {
    const error = {
      errors: ['無効な時刻形式です。'],
    };
    test.each`
      arg         | success  | data         | error
      ${'07:17'}  | ${true}  | ${'07:17'}   | ${undefined}
      ${'7:17'}   | ${false} | ${undefined} | ${error}
      ${'07:7'}   | ${false} | ${undefined} | ${error}
      ${'107:17'} | ${false} | ${undefined} | ${error}
      ${'00:00'}  | ${true}  | ${'00:00'}   | ${undefined}
      ${'23:59'}  | ${true}  | ${'23:59'}   | ${undefined}
      ${'24:00'}  | ${false} | ${undefined} | ${error}
      ${'23:60'}  | ${false} | ${undefined} | ${error}
    `(`parse($arg) => $success: 'data=$data' 'error=$error'`, ({ arg, success, data, error }) => {
      const result = TimeSchema.safeParse(arg);
      expect(result.success).toBe(success);
      if (result.success) {
        expect(result.data).toBe(data);
      } else {
        expect(z.treeifyError(result.error)).toMatchObject(error);
      }
    });
  });

  describe('ColorSchema', () => {
    const error = {
      errors: ['無効な色です。'],
    };
    // cSpell:ignore afafah
    test.each`
      arg                | success  | data              | error
      ${'#abc' /*    */} | ${true}  | ${'#ABC' /*   */} | ${undefined}
      ${'#ABC' /*    */} | ${true}  | ${'#ABC' /*   */} | ${undefined}
      ${'#000' /*    */} | ${true}  | ${'#000' /*   */} | ${undefined}
      ${'#FFF' /*    */} | ${true}  | ${'#FFF' /*   */} | ${undefined}
      ${'#000000' /* */} | ${true}  | ${'#000000' /**/} | ${undefined}
      ${'#FF0000' /* */} | ${true}  | ${'#FF0000' /**/} | ${undefined}
      ${'#00FF00' /* */} | ${true}  | ${'#00FF00' /**/} | ${undefined}
      ${'#0000FF' /* */} | ${true}  | ${'#0000FF' /**/} | ${undefined}
      ${'#FFFFFF' /* */} | ${true}  | ${'#FFFFFF' /**/} | ${undefined}
      ${'#1AFFa1' /* */} | ${true}  | ${'#1AFFA1' /**/} | ${undefined}
      ${'#F00' /*    */} | ${true}  | ${'#F00' /*   */} | ${undefined}
      ${'123456' /*  */} | ${false} | ${undefined}      | ${error}
      ${'#123abce' /**/} | ${false} | ${undefined}      | ${error}
      ${'#afafah' /* */} | ${false} | ${undefined}      | ${error}
    `(`parse($arg) => $success: 'data=$data' 'error=$error'`, ({ arg, success, data, error }) => {
      const result = ColorSchema.safeParse(arg);
      expect(result.success).toBe(success);
      if (result.success) {
        expect(result.data).toBe(data);
      } else {
        expect(z.treeifyError(result.error)).toMatchObject(error);
      }
    });
  });
});
