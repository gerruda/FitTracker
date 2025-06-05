import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ExerciseTracker from '../ExerciseTracker.vue'
import { useFitnessStore } from '../../stores/fitness'
import type { ExerciseData } from '../../types'
import '@testing-library/jest-dom'

describe('ExerciseTracker', () => {
  const mockExercise: ExerciseData = {
    id: '1',
    name: 'Приседания',
    weight: 100,
    reps: 5,
    date: '2024-03-20',
    calculatedOneRepMax: 115
  }

  const renderComponent = () => {
    return mount(ExerciseTracker, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            fitness: {
              exercises: []
            }
          }
        })]
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the component correctly', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#newExercise').exists()).toBe(true)
    expect(wrapper.find('#weight').exists()).toBe(true)
    expect(wrapper.find('#reps').exists()).toBe(true)
  })

  it('handles form submission with valid data', async () => {
    const wrapper = renderComponent()
    const store = useFitnessStore()

    await wrapper.find('#newExercise').setValue(mockExercise.name)
    await wrapper.find('#weight').setValue(mockExercise.weight)
    await wrapper.find('#reps').setValue(mockExercise.reps)
    await wrapper.find('form').trigger('submit.prevent')

    expect(store.addExercise).toHaveBeenCalledWith(expect.objectContaining({
      name: mockExercise.name,
      weight: mockExercise.weight,
      reps: mockExercise.reps
    }))
  })

  it('validates required fields', async () => {
    const wrapper = renderComponent()
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('#newExercise').attributes('required')).toBeDefined()
    expect(wrapper.find('#weight').attributes('required')).toBeDefined()
    expect(wrapper.find('#reps').attributes('required')).toBeDefined()
  })

  it('edits existing exercise', async () => {
    const wrapper = renderComponent()
    const store = useFitnessStore()
    store.exercises = [mockExercise]

    // Click edit button
    await wrapper.find('[title="Редактировать"]').trigger('click')

    // Verify form is populated with exercise data
    const exerciseInput = wrapper.find('#newExercise').element as HTMLInputElement
    const weightInput = wrapper.find('#weight').element as HTMLInputElement
    const repsInput = wrapper.find('#reps').element as HTMLInputElement

    expect(exerciseInput.value).toBe(mockExercise.name)
    expect(weightInput.value).toBe(String(mockExercise.weight))
    expect(repsInput.value).toBe(String(mockExercise.reps))

    // Edit the exercise
    const updatedWeight = 105
    await wrapper.find('#weight').setValue(updatedWeight)
    await wrapper.find('form').trigger('submit.prevent')

    expect(store.updateExercise).toHaveBeenCalledWith(expect.objectContaining({
      id: mockExercise.id,
      name: mockExercise.name,
      weight: updatedWeight,
      reps: mockExercise.reps
    }))
  })

  it('clears form after submission', async () => {
    const wrapper = renderComponent()

    await wrapper.find('#newExercise').setValue(mockExercise.name)
    await wrapper.find('#weight').setValue(mockExercise.weight)
    await wrapper.find('#reps').setValue(mockExercise.reps)
    await wrapper.find('form').trigger('submit.prevent')

    // Check if form is cleared
    const exerciseInput = wrapper.find('#newExercise').element as HTMLInputElement
    const weightInput = wrapper.find('#weight').element as HTMLInputElement
    const repsInput = wrapper.find('#reps').element as HTMLInputElement

    expect(exerciseInput.value).toBe('')
    expect(weightInput.value).toBe('0')
    expect(repsInput.value).toBe('0')
  })
})
