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
});
