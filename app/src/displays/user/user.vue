<script setup lang="ts">
import { User } from '@directus/types';
import { computed } from 'vue';
import VImage from '@/components/v-image.vue';
import { getAssetUrl } from '@/utils/get-asset-url';
import { userName } from '@/utils/user-name';
import UserPopover from '@/views/private/components/user-popover.vue';
import { ref, watch } from 'vue';

const props = withDefaults(
	defineProps<{
		value: Pick<User, 'id' | 'email' | 'first_name' | 'last_name' | 'avatar'> | null;
		display?: 'avatar' | 'name' | 'both';
		circle?: boolean;
	}>(),
	{
		display: 'both',
	},
);

const src = ref<string | null>(null);

watch(
	() => ({
		hasValue: props.value !== null,
		avatarId: props.value?.avatar?.id ?? null,
		modifiedOn: props.value?.avatar?.modified_on ?? null,
	}),
	({ hasValue, avatarId, modifiedOn }) => {
		if (avatarId) {
			src.value = getAssetUrl(avatarId, {
				imageKey: 'system-small-cover',
				cacheBuster: modifiedOn,
			});
		} else if (hasValue) {
			src.value = null;
		}
	},
	{ immediate: true }
);
</script>

<template>
	<UserPopover v-if="value" :user="value.id">
		<div class="user" :class="display">
	<img
		v-if="display === 'avatar' || display === 'both'"
		:src="src ?? '../assets/avatar-placeholder.svg'"
		role="presentation"
		:alt="value && userName(value)"
		:class="{ circle }"
	/>
			<span v-if="display === 'name' || display === 'both'">{{ userName(value) }}</span>
		</div>
	</UserPopover>
</template>

<style lang="scss" scoped>
.user {
	display: inline-flex;
	align-items: center;
	block-size: 100%;
	vertical-align: middle;

	img {
		display: inline-block;
		inline-size: auto;
		block-size: 100%;
		vertical-align: -67%;
		border-radius: 4px;

		&.circle {
			border-radius: 100%;
		}
	}

	&.both {
		img {
			margin-inline-end: 8px;
		}
	}
}
</style>
