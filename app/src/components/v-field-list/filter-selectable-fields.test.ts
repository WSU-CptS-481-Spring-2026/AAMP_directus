import { describe, expect, test } from 'vitest';
import { filterSelectableFields } from './filter-selectable-fields';
import type { FieldNode } from '@/composables/use-field-tree';

describe('filterSelectableFields', () => {
    test('should exclude disabled fields', () => {
        const fields: (FieldNode & { disabled?: boolean })[] = [
            {
                key: 'field1',
                field: 'field1',
                name: 'Field 1',
                collection: 'test',
                type: 'string',
                disabled: false,
            },
            {
                key: 'field2',
                field: 'field2',
                name: 'Field 2',
                collection: 'test',
                type: 'string',
                disabled: true,
            },
        ];

        const result = filterSelectableFields(fields);

        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('field1');
    });

    test('should exclude alias fields that are not groups', () => {
        const fields: (FieldNode & { disabled?: boolean })[] = [
            {
                key: 'field1',
                field: 'field1',
                name: 'Field 1',
                collection: 'test',
                type: 'string',
                disabled: false,
            },
            {
                key: 'accordion1',
                field: 'accordion1',
                name: 'Accordion 1',
                collection: 'test',
                type: 'alias',
                disabled: false,
                group: false,
            },
        ];

        const result = filterSelectableFields(fields);

        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('field1');
    });

    test('should include alias fields that ARE groups', () => {
        const fields: (FieldNode & { disabled?: boolean })[] = [
            {
                key: 'field1',
                field: 'field1',
                name: 'Field 1',
                collection: 'test',
                type: 'string',
                disabled: false,
            },
            {
                key: 'group1',
                field: 'group1',
                name: 'Group 1',
                collection: 'test',
                type: 'alias',
                disabled: false,
                group: true,
            },
        ];

        const result = filterSelectableFields(fields);

        expect(result).toHaveLength(2);
        expect(result[1].key).toBe('group1');
    });

    test('should include normal fields', () => {
        const fields: (FieldNode & { disabled?: boolean })[] = [
            {
                key: 'name',
                field: 'name',
                name: 'Name',
                collection: 'test',
                type: 'string',
                disabled: false,
            },
            {
                key: 'age',
                field: 'age',
                name: 'Age',
                collection: 'test',
                type: 'integer',
                disabled: false,
            },
        ];

        const result = filterSelectableFields(fields);

        expect(result).toHaveLength(2);
    });

    test('should handle empty array', () => {
        const result = filterSelectableFields([]);
        expect(result).toHaveLength(0);
    });

    test('should handle mix of all field types', () => {
        const fields: (FieldNode & { disabled?: boolean })[] = [
            {
                key: 'field1',
                field: 'field1',
                name: 'Field 1',
                collection: 'test',
                type: 'string',
                disabled: false,
            },
            {
                key: 'disabled_field',
                field: 'disabled_field',
                name: 'Disabled Field',
                collection: 'test',
                type: 'string',
                disabled: true,
            },
            {
                key: 'accordion_alias',
                field: 'accordion_alias',
                name: 'Accordion Alias',
                collection: 'test',
                type: 'alias',
                disabled: false,
                group: false,
            },
            {
                key: 'group_alias',
                field: 'group_alias',
                name: 'Group Alias',
                collection: 'test',
                type: 'alias',
                disabled: false,
                group: true,
            },
            {
                key: 'field2',
                field: 'field2',
                name: 'Field 2',
                collection: 'test',
                type: 'integer',
                disabled: false,
            },
        ];

        const result = filterSelectableFields(fields);

        // Should have 3: field1, group_alias, and field2
        expect(result).toHaveLength(3);
        expect(result.map((f) => f.key)).toEqual(['field1', 'group_alias', 'field2']);
    });

    test('should handle fields with disabled property undefined', () => {
        const fields: (FieldNode & { disabled?: boolean })[] = [
            {
                key: 'field1',
                field: 'field1',
                name: 'Field 1',
                collection: 'test',
                type: 'string',
            },
        ];

        const result = filterSelectableFields(fields);

        expect(result).toHaveLength(1);
    });

    test('Integration test: filters out accordion fields from CSV export (issue #26766)', () => {
        // Simulate a real export scenario with CSV_Test collection
        const fields: (FieldNode & { disabled?: boolean })[] = [
            {
                key: 'id',
                field: 'id',
                name: 'ID',
                collection: 'CSV_Test',
                type: 'string',
                disabled: false,
            },
            {
                key: 'name',
                field: 'name',
                name: 'Name',
                collection: 'CSV_Test',
                type: 'string',
                disabled: false,
            },
            {
                key: 'accordion-ufmju_',
                field: 'accordion-ufmju_',
                name: 'Accordion Field',
                collection: 'CSV_Test',
                type: 'alias',
                disabled: false,
                group: false,
            },
            {
                key: 'description',
                field: 'description',
                name: 'Description',
                collection: 'CSV_Test',
                type: 'text',
                disabled: false,
            },
        ];

        const result = filterSelectableFields(fields);

        // Should exclude the accordion alias field (accordion-ufmju_)
        expect(result).toHaveLength(3);
        expect(result.map((f) => f.key)).toEqual(['id', 'name', 'description']);
        // Verify the problematic field was excluded
        expect(result.map((f) => f.key)).not.toContain('accordion-ufmju_');
    });
});
