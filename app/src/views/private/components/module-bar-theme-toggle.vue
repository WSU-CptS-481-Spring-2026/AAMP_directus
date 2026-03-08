<script setup lang="ts">
import { computed, ref } from 'vue';
import api from '@/api';
import VButton from '@/components/v-button.vue';
import VIcon from '@/components/v-icon/v-icon.vue';
import { useUserStore } from '@/stores/user';
import { getAppearance } from '@/utils/get-appearance';

const userStore = useUserStore();
const isHovering = ref(false);
const isUpdating = ref(false);

const currentAppearance = computed(() => {
	return getAppearance();
});

const displayIcon = computed(() => {
	const current = currentAppearance.value;
	
	// When hovering, show the opposite icon
	if (isHovering.value) {
		return current === 'light' ? 'dark_mode' : 'light_mode';
	}
	
	// Otherwise show current theme icon
	return current === 'light' ? 'light_mode' : 'dark_mode';
});

const tooltipText = computed(() => {
	const current = currentAppearance.value;
	return current === 'light' ? 'Dark Mode' : 'Light Mode';
});

async function toggleTheme() {
	if (isUpdating.value) return;
	
	const current = currentAppearance.value;
	const newAppearance = current === 'light' ? 'dark' : 'light';
	
	isUpdating.value = true;
	
	try {
		await api.patch('/users/me', { appearance: newAppearance });
		
		// Update the local user store
		if (userStore.currentUser && 'appearance' in userStore.currentUser) {
			userStore.currentUser.appearance = newAppearance;
		}
	} catch {
		// Fail silently - theme will remain unchanged
	} finally {
		isUpdating.value = false;
	}
}
</script>

<template>
	<VButton
		v-tooltip.right="tooltipText"
		tile
		icon
		x-large
		class="theme-toggle"
		:disabled="isUpdating"
		@mouseenter="isHovering = true"
		@mouseleave="isHovering = false"
		@click="toggleTheme"
	>
		<VIcon :name="displayIcon" />
	</VButton>
</template>

<style lang="scss" scoped>
.theme-toggle {
	--v-button-color: var(--theme--navigation--modules--button--foreground);
	--v-button-color-hover: var(--theme--navigation--modules--button--foreground-hover);
	--v-button-background-color: var(--theme--navigation--modules--background);
	--v-button-background-color-hover: var(--theme--navigation--modules--background);
}
</style>
