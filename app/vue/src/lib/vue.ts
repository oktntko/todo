export const satisfiesKeys =
  <T>() =>
  <K extends keyof T>(...keys: [K] extends [keyof T] ? (keyof T extends K ? K[] : [never]) : K[]) =>
    keys;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EmitsType = Record<string, (...args: any[]) => true>;
