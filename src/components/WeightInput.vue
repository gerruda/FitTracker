<template>
  <div class="weight-input">
    <div class="card">
      <h2>Запись веса</h2>
      
      <div class="guidelines-card">
        <h3>📝 Рекомендации для точного измерения</h3>
        <ul>
          <li>Взвешивайтесь в одно и то же время (идеально - утром)</li>
          <li>После посещения туалета</li>
          <li>До приема пищи и напитков (включая кофе)</li>
          <li>В одинаковой одежде или без одежды</li>
          <li>Накануне избегайте:</li>
          <ul>
            <li>Алкоголя</li>
            <li>Соленой пищи</li>
            <li>Большого количества жидкости</li>
          </ul>
        </ul>
      </div>

      <form @submit.prevent="saveWeight" class="measurement-form">
        <div class="form-group">
          <label for="date">Дата</label>
          <input 
            type="date" 
            id="date" 
            v-model="weightData.date" 
            class="form-control"
            required
          >
        </div>

        <div class="form-group">
          <label for="weight">Вес (кг)</label>
          <input 
            type="number" 
            id="weight" 
            v-model="weightData.weight" 
            class="form-control"
            step="0.1"
            required
          >
        </div>

        <div class="form-group">
          <label for="notes">Примечания</label>
          <textarea 
            id="notes" 
            v-model="weightData.notes" 
            class="form-control"
            placeholder="Например: после тренировки, натощак, etc."
          ></textarea>
        </div>

        <button type="submit" class="btn btn-primary">Сохранить</button>
      </form>
    </div>

    <MeasurementHistoryTable type="weight" @edit="handleEdit" />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useFitnessStore } from '@/stores/fitness';
import MeasurementHistoryTable from './MeasurementHistoryTable.vue';
import type { MeasurementData } from '@/types';

const store = useFitnessStore();

const weightData = reactive({
  date: new Date().toISOString().split('T')[0],
  weight: undefined as number | undefined,
  notes: '',
});

onMounted(() => {
  // Если есть измерение для редактирования, заполняем форму
  if (store.editingMeasurement) {
    const measurement = store.editingMeasurement;
    weightData.date = measurement.date.split('T')[0];
    weightData.weight = measurement.weight;
    weightData.notes = measurement.notes || '';
    // Очищаем редактируемое измерение
    store.setEditingMeasurement(null);
  }
});

const saveWeight = () => {
  if (weightData.weight) {
    const measurement: MeasurementData = {
      date: weightData.date,
      weight: weightData.weight,
      notes: weightData.notes,
    };

    store.addMeasurement(measurement);
    resetForm();
  }
};

const resetForm = () => {
  weightData.weight = 0;
  weightData.notes = '';
  weightData.date = new Date().toISOString().split('T')[0];
};

const handleEdit = (measurement: MeasurementData) => {
  weightData.weight = measurement.weight || 0;
};
</script>

<style scoped>
.weight-input {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.guidelines-card {
  background-color: #f8f9fa;
  border-left: 4px solid var(--primary-color);
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: var(--border-radius);
}

.guidelines-card h3 {
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 1rem;
}

.guidelines-card ul {
  margin: 0;
  padding-left: 1.5rem;
}

.guidelines-card ul ul {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.guidelines-card li {
  margin-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}
</style> 