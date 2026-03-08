import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ModuleBarThemeToggle from './module-bar-theme-toggle.vue';
import api from '@/api';
import { useUserStore } from '@/stores/user';
import * as getAppearanceModule from '@/utils/get-appearance';

vi.mock('@/api');
vi.mock('@/stores/user');
vi.mock('@/utils/get-appearance');

describe('ModuleBarThemeToggle', () => {
    let mockUserStore: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create fresh mock for each test
        mockUserStore = {
            currentUser: {
                appearance: 'light',
            },
        };

        vi.mocked(useUserStore).mockReturnValue(mockUserStore);
    });

    test('should display light mode icon when theme is light', () => {
        vi.mocked(getAppearanceModule.getAppearance).mockReturnValue('light');

        const wrapper = mount(ModuleBarThemeToggle, {
            global: {
                stubs: {
                    VButton: {
                        template: '<button @click="$emit(\'click\')" @mouseenter="$emit(\'mouseenter\')" @mouseleave="$emit(\'mouseleave\')"><slot /></button>',
                    },
                    VIcon: {
                        template: '<span>{{ name }}</span>',
                        props: ['name'],
                    },
                },
                directives: {
                    tooltip: () => { },
                },
            },
        });

        expect(wrapper.text()).toContain('light_mode');
    });

    test('should display dark mode icon when theme is dark', () => {
        vi.mocked(getAppearanceModule.getAppearance).mockReturnValue('dark');

        const wrapper = mount(ModuleBarThemeToggle, {
            global: {
                stubs: {
                    VButton: {
                        template: '<button @click="$emit(\'click\')" @mouseenter="$emit(\'mouseenter\')" @mouseleave="$emit(\'mouseleave\')"><slot /></button>',
                    },
                    VIcon: {
                        template: '<span>{{ name }}</span>',
                        props: ['name'],
                    },
                },
                directives: {
                    tooltip: () => { },
                },
            },
        });

        expect(wrapper.text()).toContain('dark_mode');
    });

    test('should swap icon on hover', async () => {
        vi.mocked(getAppearanceModule.getAppearance).mockReturnValue('light');

        const wrapper = mount(ModuleBarThemeToggle, {
            global: {
                stubs: {
                    VButton: {
                        template: '<button @click="$emit(\'click\')" @mouseenter="$emit(\'mouseenter\')" @mouseleave="$emit(\'mouseleave\')"><slot /></button>',
                    },
                    VIcon: {
                        template: '<span>{{ name }}</span>',
                        props: ['name'],
                    },
                },
                directives: {
                    tooltip: () => { },
                },
            },
        });

        // Initial state - light mode shows light_mode icon
        expect(wrapper.text()).toContain('light_mode');

        // Hover - should show dark_mode icon
        await wrapper.find('button').trigger('mouseenter');
        expect(wrapper.text()).toContain('dark_mode');

        // Mouse leave - should return to light_mode icon
        await wrapper.find('button').trigger('mouseleave');
        expect(wrapper.text()).toContain('light_mode');
    });

    test('should call API and update user store when clicked (light to dark)', async () => {
        vi.mocked(getAppearanceModule.getAppearance).mockReturnValue('light');
        vi.mocked(api.patch).mockResolvedValue({ data: {} });

        const wrapper = mount(ModuleBarThemeToggle, {
            global: {
                stubs: {
                    VButton: {
                        template: '<button @click="$emit(\'click\')" @mouseenter="$emit(\'mouseenter\')" @mouseleave="$emit(\'mouseleave\')"><slot /></button>',
                    },
                    VIcon: {
                        template: '<span>{{ name }}</span>',
                        props: ['name'],
                    },
                },
                directives: {
                    tooltip: () => { },
                },
            },
        });

        await wrapper.find('button').trigger('click');

        // Verify API was called with correct parameters
        expect(api.patch).toHaveBeenCalledWith('/users/me', { appearance: 'dark' });

        // Wait for async operations
        await wrapper.vm.$nextTick();

        // Verify user store was updated
        expect(mockUserStore.currentUser.appearance).toBe('dark');
    });

    test('should call API and update user store when clicked (dark to light)', async () => {
        // Reset mock for dark mode scenario
        mockUserStore.currentUser.appearance = 'dark';
        vi.mocked(getAppearanceModule.getAppearance).mockReturnValue('dark');
        vi.mocked(api.patch).mockResolvedValue({ data: {} });

        const wrapper = mount(ModuleBarThemeToggle, {
            global: {
                stubs: {
                    VButton: {
                        template: '<button @click="$emit(\'click\')" @mouseenter="$emit(\'mouseenter\')" @mouseleave="$emit(\'mouseleave\')"><slot /></button>',
                    },
                    VIcon: {
                        template: '<span>{{ name }}</span>',
                        props: ['name'],
                    },
                },
                directives: {
                    tooltip: () => { },
                },
            },
        });

        await wrapper.find('button').trigger('click');

        // Verify API was called with correct parameters
        expect(api.patch).toHaveBeenCalledWith('/users/me', { appearance: 'light' });

        // Wait for async operations
        await wrapper.vm.$nextTick();

        // Verify user store was updated
        expect(mockUserStore.currentUser.appearance).toBe('light');
    });
});
