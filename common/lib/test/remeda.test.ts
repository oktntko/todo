import { R } from '~/remeda';

describe('remeda', () => {
  describe('join', () => {
    test.each`
      val                            | glue   | match
      ${[1, 2, 3]}                   | ${','} | ${'1,2,3'}
      ${['a', 'b', 'c']}             | ${''}  | ${'abc'}
      ${['hello', 'world'] as const} | ${' '} | ${'hello world'}
    `('val=[$val] glue=[$glue] expect $match', ({ val, glue, match }) => {
      expect(R.join(val, glue)).toBe(match);
    });
  });

  describe('calcRgb', () => {
    test.each`
      arg          | r      | g      | b
      ${'#00FF00'} | ${0}   | ${255} | ${0}
      ${'#000'}    | ${0}   | ${0}   | ${0}
      ${'#FFF'}    | ${255} | ${255} | ${255}
      ${'abc'}     | ${170} | ${187} | ${204}
      ${'#1a2b3c'} | ${26}  | ${43}  | ${60}
      ${''}        | ${0}   | ${0}   | ${0}
      ${undefined} | ${0}   | ${0}   | ${0}
    `('calcRgb($arg) -> {r:$r,g:$g,b:$b}', ({ arg, r, g, b }) => {
      expect(R.rgb(arg)).toEqual(`rgb(${r}, ${g}, ${b})`);
    });
  });

  describe('calcRgba', () => {
    test.each`
      arg          | r      | g      | b      | a
      ${'#00FF00'} | ${0}   | ${255} | ${0}   | ${0}
      ${'#000'}    | ${0}   | ${0}   | ${0}   | ${0}
      ${'#FFF'}    | ${255} | ${255} | ${255} | ${255}
      ${'abc'}     | ${170} | ${187} | ${204} | ${204}
      ${'#1a2b3c'} | ${26}  | ${43}  | ${60}  | ${60}
      ${''}        | ${0}   | ${0}   | ${0}   | ${0}
      ${undefined} | ${0}   | ${0}   | ${0}   | ${0}
    `('calcRgb($arg) -> {r:$r,g:$g,b:$b}', ({ arg, r, g, b, a }) => {
      expect(R.rgba(arg, a)).toEqual(`rgba(${r}, ${g}, ${b}, ${a})`);
    });
  });

  describe('hex', () => {
    test.each`
      arg          | r      | g      | b
      ${'#00FF00'} | ${0}   | ${255} | ${0}
      ${'#000000'} | ${0}   | ${0}   | ${0}
      ${'#FFFFFF'} | ${255} | ${255} | ${255}
      ${'#AABBCC'} | ${170} | ${187} | ${204}
      ${'#1A2B3C'} | ${26}  | ${43}  | ${60}
      ${'#000000'} | ${0}   | ${0}   | ${0}
      ${'#000000'} | ${''}  | ${''}  | ${''}
    `('calcRgb($arg) -> {r:$r,g:$g,b:$b}', ({ arg, r, g, b }) => {
      expect(R.hex(`rgb(${r}, ${g}, ${b})`)).toEqual(arg);
    });
  });
});
