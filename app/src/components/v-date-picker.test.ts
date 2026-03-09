import { mount } from '@vue/test-utils';
import Flatpickr from 'flatpickr';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import VDatePicker from './v-date-picker.vue';

vi.mock('flatpickr');
vi.mock('@/utils/get-flatpickr-locale', () => ({ getFlatpickrLocale: vi.fn().mockReturnValue('en') }));
vi.mock('vue-i18n', () => ({
	useI18n: vi.fn().mockReturnValue({ t: (key: string) => key }),
}));

const mockFlatpickrInstance = {
	setDate: vi.fn(),
	clear: vi.fn(),
	close: vi.fn(),
	calendarContainer: document.createElement('div'),
	minuteElement: document.createElement('input'),
	secondElement: document.createElement('input'),
	amPM: document.createElement('span'),
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(Flatpickr).mockReturnValue(mockFlatpickrInstance as any);
});

describe('v-date-picker dynamic variable handling', () => {
	describe('isDynamicValue', () => {
		test('treats $NOW as a dynamic value', async () => {
			mount(VDatePicker, { props: { type: 'dateTime', modelValue: '$NOW' } });

			// setDate should never be called with a dynamic variable
			expect(mockFlatpickrInstance.setDate).not.toHaveBeenCalled();
		});

		test('treats $CURRENT_USER as a dynamic value', async () => {
			mount(VDatePicker, { props: { type: 'dateTime', modelValue: '$CURRENT_USER' } });

			expect(mockFlatpickrInstance.setDate).not.toHaveBeenCalled();
		});

		test('treats a real date string as a non-dynamic value', async () => {
			mount(VDatePicker, { props: { type: 'dateTime', modelValue: '2024-01-15T10:30:00' } });

			expect(mockFlatpickrInstance.setDate).toHaveBeenCalledWith('2024-01-15T10:30:00', false);
		});
	});

	describe('watcher behaviour', () => {
		test('calls clear() when modelValue is a dynamic variable', async () => {
			mount(VDatePicker, { props: { type: 'dateTime', modelValue: '$NOW' } });

			expect(mockFlatpickrInstance.clear).toHaveBeenCalled();
			expect(mockFlatpickrInstance.setDate).not.toHaveBeenCalled();
		});


		test('calls clear() when modelValue changes from a date to a dynamic variable', async () => {
			const wrapper = mount(VDatePicker, { props: { type: 'dateTime', modelValue: '2024-01-15T10:30:00' } });

			vi.clearAllMocks();

			await wrapper.setProps({ modelValue: '$NOW' });

			expect(mockFlatpickrInstance.clear).toHaveBeenCalled();
			expect(mockFlatpickrInstance.setDate).not.toHaveBeenCalled();
		});

	});
});
