/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/array-type */
type MergeObjects<
  A extends Record<string, any>,
  B extends Record<string, any>,
> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K] extends undefined
      ? K extends keyof A
        ? A[K]
        : never
      : B[K] extends Array<any>
        ? K extends keyof A
          ? A[K] extends Array<any>
            ? Array<A[K][number] | B[K][number]>
            : B[K]
          : B[K]
        : B[K]
    : K extends keyof A
      ? A[K]
      : never;
};

export function mergeObjects<
  A extends Record<string, any>,
  B extends Record<string, any>,
>(objA: A, objB: B): MergeObjects<A, B> {
  const merged = {
    ...objA,
    ...Object.fromEntries(
      Object.entries(objB).map(([key, value]) => {
        if (Array.isArray(objA[key as keyof A]) && Array.isArray(value)) {
          // Merge arrays and remove duplicates
          return [key, [...new Set([...objA[key as keyof A], ...value])]];
        }
        return [key, value !== undefined ? value : objA[key as keyof A]];
      })
    ),
  };

  return merged as MergeObjects<A, B>;
}
