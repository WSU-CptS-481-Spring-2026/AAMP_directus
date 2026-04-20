import type { Accountability } from '@directus/types';

/**
 * Check if the accountability object represents an admin user
 * @param accountability - The accountability object to check
 * @returns true if the user is an admin, false otherwise
 */
export function isAdmin(accountability: Accountability | null): boolean {
	return accountability?.admin === true;
}

/**
 * Check if the accountability object represents a public user (no authentication)
 * @param accountability - The accountability object to check
 * @returns true if the user is public (not authenticated), false otherwise
 */
export function isPublicUser(accountability: Accountability | null): boolean {
	return !accountability?.user && !accountability?.role;
}
