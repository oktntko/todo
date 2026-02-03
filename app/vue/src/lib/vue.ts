export const satisfiesKeys =
  <T>() =>
  <K extends keyof T>(...keys: [K] extends [keyof T] ? (keyof T extends K ? K[] : [never]) : K[]) =>
    keys;

// oxlint-disable-next-line typescript/no-explicit-any
export type EmitsType = Record<string, (...args: any[]) => true>;
