/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/array-type */
type MergeObjects<A extends Record<string, any>, B extends Record<string, any>> = {
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

export function mergeObjects<A extends Record<string, any>, B extends Record<string, any>>(
  objA: A,
  objB: B
): MergeObjects<A, B> {
  const merged = {
    ...objA,
    ...Object.fromEntries(
      Object.entries(objB).map(([key, value]) => {
        const originalValue = objA[key as keyof A];
        if (Array.isArray(originalValue) && Array.isArray(value)) {
          // Merge arrays and remove duplicates & nullish
          [...new Set([...originalValue, ...value])].filter((item) => item !== undefined);
        }
        return [key, value ?? originalValue];
      })
    ),
  };

  return merged as MergeObjects<A, B>;
}
