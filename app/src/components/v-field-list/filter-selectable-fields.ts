import { FieldNode } from '@/composables/use-field-tree';

/**
 * Filters out non-selectable fields from the given field list.
 * Excludes:
 * - Disabled fields
 * - Alias fields that are not groups (like accordion interface fields)
 *
 * This ensures that only exportable/selectable fields are included,
 * preventing API 403 errors when fields cannot be accessed.
 *
 * Fixes issue #26766: Export to CSV, Select All Fields includes alias fields
 */
export function filterSelectableFields(fields: (FieldNode & { disabled?: boolean })[]): (FieldNode & { disabled?: boolean })[] {
    return fields.filter((field) => {
        // Skip disabled fields
        if (field.disabled) return false;

        // Skip alias fields that are not groups (accordion, etc.)
        if (field.type === 'alias' && !field.group) return false;

        return true;
    });
}
