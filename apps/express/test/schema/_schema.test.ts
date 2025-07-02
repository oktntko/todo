import { ColorSchema, DateSchema, TimeSchema } from '~/schema/_schema';

describe('/src/schema/_schema.ts', () => {
  describe('DateSchema', () => {
    const error = [{ message: '無効な日付形式です。' }];
    test.each([
      { arg: '1997-07-17', success: true, data: '1997-07-17', error: undefined },
      { arg: '1997-7-17', success: false, data: undefined, error },
      { arg: '1997-07-7', success: false, data: undefined, error },
      { arg: '21997-07-17', success: false, data: undefined, error },
      { arg: '1997-02-28', success: true, data: '1997-02-28', error: undefined },
      { arg: '1997-02-29', success: false, data: undefined, error },
      { arg: '2000-02-29', success: true, data: '2000-02-29', error: undefined },
    ])(`parse($arg) => $success: 'data=$data' 'error=$error'`, ({ arg, success, data, error }) => {
      const result = DateSchema.safeParse(arg);
      expect(result.success).toBe(success);
      expect(result.data).toBe(data);
      if (error) {
        expect(result.error?.errors).toMatchObject(error);
      }
    });
  });

  describe('TimeSchema', () => {
    const error = [{ message: '無効な時刻形式です。' }];
    test.each([
      { arg: '07:17', success: true, data: '07:17', error: undefined },
      { arg: '7:17', success: false, data: undefined, error },
      { arg: '07:7', success: false, data: undefined, error },
      { arg: '107:17', success: false, data: undefined, error },
      { arg: '00:00', success: true, data: '00:00', error: undefined },
      { arg: '23:59', success: true, data: '23:59', error: undefined },
      { arg: '24:00', success: false, data: undefined, error },
      { arg: '23:60', success: false, data: undefined, error },
    ])(`parse($arg) => $success: 'data=$data' 'error=$error'`, ({ arg, success, data, error }) => {
      const result = TimeSchema.safeParse(arg);
      expect(result.success).toBe(success);
      expect(result.data).toBe(data);
      if (error) {
        expect(result.error?.errors).toMatchObject(error);
      }
    });
  });

  describe('ColorSchema', () => {
    const error = [{ message: '無効な色です。' }];
    test.each([
      { arg: '#abc' /*   */, success: true, data: '#ABC' /*   */, error: undefined },
      { arg: '#ABC' /*   */, success: true, data: '#ABC' /*   */, error: undefined },
      { arg: '#000' /*   */, success: true, data: '#000' /*   */, error: undefined },
      { arg: '#FFF' /*   */, success: true, data: '#FFF' /*   */, error: undefined },
      { arg: '#000000' /**/, success: true, data: '#000000' /**/, error: undefined },
      { arg: '#FF0000' /**/, success: true, data: '#FF0000' /**/, error: undefined },
      { arg: '#00FF00' /**/, success: true, data: '#00FF00' /**/, error: undefined },
      { arg: '#0000FF' /**/, success: true, data: '#0000FF' /**/, error: undefined },
      { arg: '#FFFFFF' /**/, success: true, data: '#FFFFFF' /**/, error: undefined },
      { arg: '#1AFFa1' /**/, success: true, data: '#1AFFA1' /**/, error: undefined },
      { arg: '#F00' /*   */, success: true, data: '#F00' /*   */, error: undefined },

      { arg: '123456' /*   */, success: false, data: undefined, error },
      { arg: '#123abce' /* */, success: false, data: undefined, error },
      // cSpell:ignore afafah
      { arg: '#afafah' /*  */, success: false, data: undefined, error },
    ])(`parse($arg) => $success: 'data=$data' 'error=$error'`, ({ arg, success, data, error }) => {
      const result = ColorSchema.safeParse(arg);
      expect(result.success).toBe(success);
      expect(result.data).toBe(data);
      if (error) {
        expect(result.error?.errors).toMatchObject(error);
      }
    });
  });
});
