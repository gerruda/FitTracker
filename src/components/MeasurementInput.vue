<template>
  <div class="measurement-input">
    <div class="card">
      <h2>Добавить новое измерение</h2>
      
      <div class="input-methods">
        <button 
          class="btn" 
          :class="{ 'btn-primary': inputMethod === 'manual', 'btn-secondary': inputMethod !== 'manual' }"
          @click="inputMethod = 'manual'"
        >
          Ручной ввод
        </button>
        <button 
          class="btn" 
          :class="{ 'btn-primary': inputMethod === 'photo', 'btn-secondary': inputMethod !== 'photo' }"
          @click="inputMethod = 'photo'"
        >
          Сканировать фото
        </button>
      </div>

      <div v-if="inputMethod === 'photo'" class="photo-input">
        <input 
          type="file" 
          accept="image/*" 
          @change="handleImageUpload" 
          ref="fileInput"
          class="file-input"
        >
        <div class="preview-container" v-if="previewUrl">
          <img :src="previewUrl" alt="Предпросмотр" class="preview-image">
        </div>
        <button class="btn btn-primary" @click="processImage" :disabled="!previewUrl || processing">
          {{ processing ? 'Обработка...' : 'Обработать изображение' }}
        </button>
        <p v-if="ocrError" class="error-message">{{ ocrError }}</p>
      </div>

      <form @submit.prevent="saveMeasurement" v-else class="measurement-form">
        <div class="form-group">
          <label for="date">Дата</label>
          <input 
            type="datetime-local" 
            id="date" 
            v-model="measurementData.date" 
            class="form-control"
            required
          >
        </div>

        <div class="form-group">
          <label for="weight">Вес (кг)</label>
          <input 
            type="number" 
            id="weight" 
            v-model="measurementData.weight" 
            class="form-control"
            step="0.1"
          >
        </div>

        <div class="form-group">
          <label for="height">Рост (см)</label>
          <input 
            type="number" 
            id="height" 
            v-model="measurementData.height" 
            class="form-control"
          >
        </div>

        <div class="measurements-section">
          <h3>Состав тела</h3>
          
          <div class="form-group">
            <label for="bodyFatPercentage">Процент жира (%)</label>
            <input 
              type="number" 
              id="bodyFatPercentage" 
              v-model="measurementData.bodyFatPercentage" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="musclePercentage">Процент мышц (%)</label>
            <input 
              type="number" 
              id="musclePercentage" 
              v-model="measurementData.musclePercentage" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="boneMass">Костная масса (кг)</label>
            <input 
              type="number" 
              id="boneMass" 
              v-model="measurementData.boneMass" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="waterMass">Масса воды (кг)</label>
            <input 
              type="number" 
              id="waterMass" 
              v-model="measurementData.waterMass" 
              class="form-control"
              step="0.1"
            >
          </div>
        </div>

        <div class="measurements-section">
          <h3>Измерения тела</h3>
          
          <div class="form-group">
            <label for="chest">Грудь (см)</label>
            <input 
              type="number" 
              id="chest" 
              v-model="measurementData.measurements.chest" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="waist">Талия (см)</label>
            <input 
              type="number" 
              id="waist" 
              v-model="measurementData.measurements.waist" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="hips">Бедра (см)</label>
            <input 
              type="number" 
              id="hips" 
              v-model="measurementData.measurements.hips" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="arms">Руки (см)</label>
            <input 
              type="number" 
              id="arms" 
              v-model="measurementData.measurements.arms" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="legs">Ноги (см)</label>
            <input 
              type="number" 
              id="legs" 
              v-model="measurementData.measurements.legs" 
              class="form-control"
              step="0.1"
            >
          </div>
        </div>

        <button type="submit" class="btn btn-primary">Сохранить измерение</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useFitnessStore } from '@/stores/fitness';
import { createWorker } from 'tesseract.js';

const store = useFitnessStore();
const inputMethod = ref('manual');
const processing = ref(false);
const previewUrl = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const ocrError = ref('');

const measurementData = reactive({
  date: new Date().toISOString().slice(0, 16),
  weight: undefined as number | undefined,
  height: undefined as number | undefined,
  bodyFatPercentage: undefined as number | undefined,
  bodyFatMass: undefined as number | undefined,
  muscleMass: undefined as number | undefined,
  musclePercentage: undefined as number | undefined,
  boneMass: undefined as number | undefined,
  waterMass: undefined as number | undefined,
  bmi: undefined as number | undefined,
  overallScore: undefined as number | undefined,
  measurements: {
    chest: undefined as number | undefined,
    waist: undefined as number | undefined,
    hips: undefined as number | undefined,
    arms: undefined as number | undefined,
    legs: undefined as number | undefined,
  }
});

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    previewUrl.value = URL.createObjectURL(file);
    ocrError.value = ''; // Сброс ошибки при загрузке нового файла
  }
};

const processImage = async () => {
  if (!fileInput.value?.files?.length) {
    ocrError.value = 'Пожалуйста, выберите изображение';
    return;
  }

  processing.value = true;
  ocrError.value = '';
  const worker = await createWorker();

  try {
    await worker.loadLanguage('rus+eng');
    await worker.initialize('rus+eng');
    
    const { data: { text } } = await worker.recognize(fileInput.value.files[0]);
    console.log('OCR результат:', text); // Для отладки
    
    // Поиск значений с учетом русского текста
    const weightMatch = text.match(/(?:Weight|Вес):\s*(\d+[.,]?\d*)/i);
    const bodyFatMatch = text.match(/(?:Body Fat|Жир):\s*(\d+[.,]?\d*)/i);
    const muscleMatch = text.match(/(?:Muscle|Мышцы):\s*(\d+[.,]?\d*)/i);
    
    if (weightMatch) measurementData.weight = parseFloat(weightMatch[1].replace(',', '.'));
    if (bodyFatMatch) measurementData.bodyFatPercentage = parseFloat(bodyFatMatch[1].replace(',', '.'));
    if (muscleMatch) measurementData.musclePercentage = parseFloat(muscleMatch[1].replace(',', '.'));
    
    if (!weightMatch && !bodyFatMatch && !muscleMatch) {
      ocrError.value = 'Не удалось распознать данные на изображении';
    } else {
      inputMethod.value = 'manual';
    }
    
    await worker.terminate();
  } catch (error) {
    console.error('Ошибка OCR:', error);
    ocrError.value = 'Произошла ошибка при обработке изображения';
  } finally {
    processing.value = false;
  }
};

const saveMeasurement = () => {
  if (measurementData.weight && measurementData.height) {
    const heightInMeters = measurementData.height / 100;
    measurementData.bmi = Math.round((measurementData.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }

  if (measurementData.weight && measurementData.bodyFatPercentage) {
    measurementData.bodyFatMass = Math.round((measurementData.weight * measurementData.bodyFatPercentage / 100) * 10) / 10;
  }

  if (measurementData.weight && measurementData.musclePercentage) {
    measurementData.muscleMass = Math.round((measurementData.weight * measurementData.musclePercentage / 100) * 10) / 10;
  }

  store.addMeasurement(measurementData);
  
  // Сброс формы
  Object.assign(measurementData, {
    date: new Date().toISOString().slice(0, 16),
    weight: undefined,
    height: undefined,
    bodyFatPercentage: undefined,
    bodyFatMass: undefined,
    muscleMass: undefined,
    musclePercentage: undefined,
    boneMass: undefined,
    waterMass: undefined,
    bmi: undefined,
    overallScore: undefined,
    measurements: {
      chest: undefined,
      waist: undefined,
      hips: undefined,
      arms: undefined,
      legs: undefined,
    }
  });
};
</script>

<style scoped>
.measurement-input {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.input-methods {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.measurements-section {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
}

.measurements-section h3 {
  margin-top: 0;
  color: var(--secondary-color);
}

.photo-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.file-input {
  width: 100%;
  padding: 1rem;
  border: 2px dashed #ddd;
  border-radius: var(--border-radius);
  text-align: center;
}

.preview-container {
  width: 100%;
  max-width: 400px;
  margin: 1rem 0;
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: var(--border-radius);
}

.error-message {
  color: #ff5252;
  margin-top: 1rem;
}

@media (max-width: 600px) {
  .measurement-input {
    padding: 0.5rem;
  }
  
  .measurements-section {
    padding: 0.5rem;
  }
}
</style> 