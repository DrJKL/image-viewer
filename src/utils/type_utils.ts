import { Settings } from '../app/settings/settings';

// Checks, if T misses keys from U
type CheckMissing<T extends readonly any[], U extends Record<string, any>> = {
  [K in keyof U]: K extends T[number] ? never : K;
}[keyof U] extends never
  ? T
  : T & 'Error: missing keys';
// Note: `T & "Error: missing keys"` is just for nice IDE errors. You could also write `never`.
// Checks, if T contains duplicate items
type CheckDuplicate<T extends readonly any[]> = {
  [P1 in keyof T]: '_flag_' extends {
    [P2 in keyof T]: P2 extends P1
      ? never
      : T[P2] extends T[P1]
      ? '_flag_'
      : never;
  }[keyof T]
    ? [T[P1], 'Error: duplicate']
    : T[P1];
};
export function createKeys<
  T extends readonly (keyof Settings)[] | [keyof Settings]
>(t: T & CheckMissing<T, Settings> & CheckDuplicate<T>): T {
  return t;
}
