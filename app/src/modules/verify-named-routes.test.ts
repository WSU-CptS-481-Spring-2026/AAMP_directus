import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, test } from 'vitest';

/**
 * Test for issue #26733: Use named routes instead of hardcoded path strings
 *
 * This test ensures that navigation across the app (content, deployment, settings modules)
 * uses named routes ({ name, params }) instead of hardcoded template literal paths
 * (e.g., /deployments/${provider}/settings).
 *
 * Hardcoded paths are fragile: route changes can silently break navigation without any error.
 * Named routes are safe and catch breaking changes at runtime.
 */

const modulesPath = join(__dirname, 'modules');

/**
 * Keywords that indicate hardcoded path usage in navigation
 */
const HARDCODED_PATH_PATTERNS = [
    // Template literals with forward slashes
    /`\/[a-zA-Z0-9${}/_-]+`/g,
    // String literals with forward slashes
    /'\/[a-zA-Z0-9${}/_-]+'/g,
    /"\/[a-zA-Z0-9${}/_-]+"/g,
];

/**
 * List of paths to scan for hardcoded routes
 * Focus on modules that contain navigation
 */
const NAVIGATION_MODULES = [
    'content',
    'deployments',
    'settings',
    'documentation',
    'extensions',
    'flows',
    'users',
    'files',
];

interface FileViolation {
    file: string;
    line: number;
    content: string;
    matches: string[];
}

function scanDirectory(dir: string, pattern: RegExp): FileViolation[] {
    const violations: FileViolation[] = [];

    try {
        const entries = readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

            const fullPath = join(dir, entry.name);

            if (entry.isDirectory()) {
                violations.push(...scanDirectory(fullPath, pattern));
            } else if (entry.isFile() && (entry.name.endsWith('.vue') || entry.name.endsWith('.ts'))) {
                try {
                    const content = readFileSync(fullPath, 'utf-8');
                    const lines = content.split('\n');

                    lines.forEach((line, index) => {
                        // Skip comments and imports
                        if (line.trim().startsWith('//') || line.trim().startsWith('import')) {
                            return;
                        }

                        // Skip lines that are using proper named routes
                        if (
                            line.includes("name: '") ||
                            line.includes('name: "') ||
                            line.includes('router.resolve({') ||
                            line.includes("{ name:")
                        ) {
                            return;
                        }

                        const matches = line.match(pattern);

                        if (matches) {
                            violations.push({
                                file: fullPath.replace(dir, ''),
                                line: index + 1,
                                content: line.trim(),
                                matches,
                            });
                        }
                    });
                } catch {
                    // Skip files that can't be read
                }
            }
        }
    } catch {
        // Silently skip directories that don't exist
    }

    return violations;
}

describe('Issue #26733: Use named routes instead of hardcoded path strings', () => {
    NAVIGATION_MODULES.forEach((moduleName) => {
        test(`${moduleName} module should not contain hardcoded path strings in navigation`, () => {
            const modulePath = join(modulesPath, moduleName);
            const violations: FileViolation[] = [];

            for (const pattern of HARDCODED_PATH_PATTERNS) {
                violations.push(...scanDirectory(modulePath, pattern));
            }

            if (violations.length > 0) {
                const violationDetails = violations
                    .map(
                        (v) =>
                            `${v.file}:${v.line}\n    Content: ${v.content}\n    Matches: ${v.matches.join(', ')}`,
                    )
                    .join('\n');

                expect.fail(
                    `Found ${violations.length} hardcoded path(s) in ${moduleName} module:\n${violationDetails}`,
                );
            }
        });
    });

    test('all hardcoded path violations should be fixed', () => {
        const allViolations: FileViolation[] = [];

        for (const moduleName of NAVIGATION_MODULES) {
            const modulePath = join(modulesPath, moduleName);

            for (const pattern of HARDCODED_PATH_PATTERNS) {
                allViolations.push(...scanDirectory(modulePath, pattern));
            }
        }

        if (allViolations.length > 0) {
            const summary = allViolations
                .map((v) => `${v.file}:${v.line} - ${v.matches.join(', ')}`)
                .join('\n');

            expect.fail(`Found ${allViolations.length} violation(s):\n${summary}`);
        }

        // If we get here, all violations are fixed
        expect(allViolations).toHaveLength(0);
    });
});
