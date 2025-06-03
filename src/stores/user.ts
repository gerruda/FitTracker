import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface UserProfile {
  gender: 'male' | 'female';
  age: number;
  activityLevel: {
    value: number;
    label: string;
  };
}

export const activityLevels = [
  { value: 1.2, label: 'Сидячий образ жизни (мало или совсем нет упражнений)' },
  { value: 1.375, label: 'Легкая активность (легкие упражнения 1-3 дня в неделю)' },
  { value: 1.55, label: 'Умеренная активность (умеренные упражнения 3-5 дней в неделю)' },
  { value: 1.725, label: 'Высокая активность (интенсивные упражнения 6-7 дней в неделю)' },
  { value: 1.9, label: 'Очень высокая активность (спортсмен, физическая работа)' }
];

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile>({
    gender: 'male',
    age: 30,
    activityLevel: activityLevels[2] // По умолчанию умеренная активность
  });

  // Загрузка профиля из localStorage
  const loadProfile = () => {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      profile.value = JSON.parse(stored);
    }
  };

  // Сохранение профиля в localStorage
  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile.value));
  };

  // Обновление профиля
  const updateProfile = (newProfile: Partial<UserProfile>) => {
    profile.value = { ...profile.value, ...newProfile };
    saveProfile();
  };

  // Загружаем профиль при создании store
  loadProfile();

  return {
    profile,
    updateProfile
  };
}); 