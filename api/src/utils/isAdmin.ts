import type { Accountability } from '@directus/types';

export function isAdmin(acc: Accountability| null): boolean {
    return acc?.admin ?? false;
}
