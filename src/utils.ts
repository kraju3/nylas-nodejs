import { camelCase, snakeCase } from 'change-case';

type CasingFunction = (input: string, options?: any) => string;

function convertCase(
  obj: Record<string, unknown>,
  casingFunction: CasingFunction,
  excludeKeys?: string[]
): Record<string, unknown> {
  const newObj = {} as Record<string, unknown>;
  for (const key in obj) {
    if (excludeKeys?.includes(key)) {
      newObj[key] = obj[key];
    } else if (Array.isArray(obj[key])) {
      newObj[casingFunction(key)] = (obj[key] as any[]).map(item => {
        if (typeof item === 'object') {
          return convertCase(item, casingFunction);
        } else {
          return item;
        }
      });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[casingFunction(key)] = convertCase(
        obj[key] as Record<string, unknown>,
        casingFunction
      );
    } else {
      newObj[casingFunction(key)] = obj[key];
    }
  }
  return newObj;
}

// function that recursively converts all keys in an object to camelCase
export function objKeysToCamelCase(
  obj: Record<string, unknown>,
  exclude?: string[]
): any {
  return convertCase(obj, camelCase, exclude);
}

// function that recursively converts all keys in an object to snake_case
export function objKeysToSnakeCase(
  obj: Record<string, unknown>,
  exclude?: string[]
): any {
  return convertCase(obj, snakeCase, exclude);
}

/**
 * A better "Partial" type that makes all properties optional, including nested ones.
 * @see https://grrr.tech/posts/2021/typescript-partial/
 */
export type Subset<K> = {
  [attr in keyof K]?: K[attr] extends object
    ? Subset<K[attr]>
    : K[attr] extends object | null
    ? Subset<K[attr]> | null
    : K[attr] extends object | null | undefined
    ? Subset<K[attr]> | null | undefined
    : K[attr];
};