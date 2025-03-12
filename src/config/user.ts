import { ref, computed } from 'vue';

export const username = ref('@mkl63285');
export const userInitial = computed(() => username.value.charAt(1).toUpperCase());

export const updateUsername = (newUsername: string) => {
  username.value = newUsername;
}; 