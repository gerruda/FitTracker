import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ExerciseTracker from '../ExerciseTracker.vue'
import { useFitnessStore } from '@/stores/fitness'
import type { ExerciseData } from '@/types'

describe('ExerciseTracker', () => {
  const mockExercise: ExerciseData = {
    id: '1',
    name: 'Приседания',
    date: '2024-03-14',
    weight: 100,
    reps: 5,
    calculatedOneRepMax: 115
  }

  const mountComponent = () => {
    return mount(ExerciseTracker, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vitest.fn,
          initialState: {
            fitness: {
              exercises: [mockExercise]
            }
          }
        })]
      }
    })
  }

  it('renders properly', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('h2').text()).toBe('Упражнения')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('displays exercise history', () => {
    const wrapper = mountComponent()
    const exerciseItems = wrapper.findAll('.exercise-item')
    expect(exerciseItems).toHaveLength(1)
    expect(exerciseItems[0].find('h4').text()).toBe(mockExercise.name)
  })

  it('allows adding new exercise', async () => {
    const wrapper = mountComponent()
    const store = useFitnessStore()

    // Заполняем форму
    await wrapper.find('#date').setValue('2024-03-15')
    await wrapper.find('#newExercise').setValue('Жим лежа')
    await wrapper.find('#weight').setValue(80)
    await wrapper.find('#reps').setValue(8)

    // Отправляем форму
    await wrapper.find('form').trigger('submit')

    // Проверяем, что store.addExercise был вызван с правильными параметрами
    expect(store.addExercise).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Жим лежа',
      weight: 80,
      reps: 8
    }))
  })

  it('allows editing exercise', async () => {
    const wrapper = mountComponent()
    const store = useFitnessStore()

    // Нажимаем кнопку редактирования
    await wrapper.find('[title="Редактировать"]').trigger('click')

    // Проверяем, что форма заполнена данными упражнения
    expect(wrapper.find('#newExercise').element.value).toBe(mockExercise.name)
    expect(wrapper.find('#weight').element.value).toBe(String(mockExercise.weight))
    expect(wrapper.find('#reps').element.value).toBe(String(mockExercise.reps))

    // Изменяем вес
    await wrapper.find('#weight').setValue(110)

    // Отправляем форму
    await wrapper.find('form').trigger('submit')

    // Проверяем, что store.updateExercise был вызван с правильными параметрами
    expect(store.updateExercise).toHaveBeenCalledWith(expect.objectContaining({
      id: mockExercise.id,
      name: mockExercise.name,
      weight: 110,
      reps: mockExercise.reps
    }))
  })

  it('allows deleting exercise', async () => {
    const wrapper = mountComponent()
    const store = useFitnessStore()

    // Мокаем window.confirm
    const confirmSpy = vitest.spyOn(window, 'confirm')
    confirmSpy.mockImplementation(() => true)

    // Нажимаем кнопку удаления
    await wrapper.find('[title="Удалить"]').trigger('click')

    // Проверяем, что появилось подтверждение
    expect(confirmSpy).toHaveBeenCalled()

    // Проверяем, что store.deleteExercise был вызван с правильным ID
    expect(store.deleteExercise).toHaveBeenCalledWith(mockExercise.id)

    confirmSpy.mockRestore()
  })

  it('cancels editing when cancel button is clicked', async () => {
    const wrapper = mountComponent()

    // Начинаем редактирование
    await wrapper.find('[title="Редактировать"]').trigger('click')
    expect(wrapper.find('h3').text()).toBe('Редактирование упражнения')

    // Нажимаем кнопку отмены
    await wrapper.find('button.btn-secondary').trigger('click')

    // Проверяем, что форма очищена
    expect(wrapper.find('h3').text()).toBe('Новое упражнение')
    expect(wrapper.find('#weight').element.value).toBe('0')
    expect(wrapper.find('#reps').element.value).toBe('0')
  })
})
