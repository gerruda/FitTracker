import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AnalyticsView from '../../src/components/AnalyticsView.vue'
import { useFitnessStore } from '../../src/stores/fitness'

describe('AnalyticsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders properly with no data', () => {
    const wrapper = mount(AnalyticsView)
    expect(wrapper.find('.analytics').exists()).toBe(true)
    // Проверяем наличие всех трех графиков
    const chartCards = wrapper.findAll('.chart-card')
    expect(chartCards).toHaveLength(3)
    // Проверяем сообщения об отсутствии данных
    const noDataMessages = wrapper.findAll('.no-data')
    expect(noDataMessages).toHaveLength(3)
    expect(noDataMessages[0].text()).toBe('Нет данных о весе')
    expect(noDataMessages[1].text()).toBe('Нет данных о составе тела')
    expect(noDataMessages[2].text()).toBe('Нет данных об измерениях')
  })

  it('displays weight chart and stats when weight data is available', async () => {
    const store = useFitnessStore()
    store.measurements = [
      {
        date: '2024-03-01',
        weight: 70
      }
    ]

    const wrapper = mount(AnalyticsView)
    
    // Проверяем отображение графика веса
    const weightChart = wrapper.findAll('.chart-card')[0]
    expect(weightChart.find('h3').text()).toBe('Динамика веса')
    expect(weightChart.find('.no-data').exists()).toBe(false)
    
    // Проверяем статистику веса
    const weightStats = wrapper.find('.stat-card')
    expect(weightStats.exists()).toBe(true)
    expect(weightStats.find('h4').text()).toBe('Вес')
    expect(weightStats.find('.current').text()).toBe('Текущий: 70кг')
    expect(weightStats.find('.change').text()).toBe('Изменение: 0кг')
  })

  it('displays body composition data when available', async () => {
    const store = useFitnessStore()
    store.measurements = [
      {
        date: '2024-03-01',
        bodyFatPercentage: 20,
        musclePercentage: 40,
        bonePercentage: 10,
        waterPercentage: 30,
        bodyFatMass: 14,
        muscleMass: 28,
        boneMass: 7,
        waterMass: 21
      }
    ]

    const wrapper = mount(AnalyticsView)
    
    // Проверяем отображение графика состава тела
    const bodyCompositionChart = wrapper.findAll('.chart-card')[1]
    expect(bodyCompositionChart.find('h3').text()).toBe('Состав тела')
    expect(bodyCompositionChart.find('.no-data').exists()).toBe(false)

    // Проверяем статистику жира и мышц
    const statsCards = wrapper.findAll('.stat-card')
    const bodyFatStats = statsCards.find(card => card.find('h4').text() === 'Процент жира')
    const muscleStats = statsCards.find(card => card.find('h4').text() === 'Мышечная масса')
    
    expect(bodyFatStats?.find('.current').text()).toBe('Текущий: 20%')
    expect(muscleStats?.find('.current').text()).toBe('Текущая: 40%')
  })

  it('filters measurements by time range', async () => {
    const store = useFitnessStore()
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    store.measurements = [
      {
        date: today.toISOString().split('T')[0],
        weight: 70
      },
      {
        date: thirtyDaysAgo.toISOString().split('T')[0],
        weight: 71
      }
    ]

    const wrapper = mount(AnalyticsView)
    
    // По умолчанию выбран период 30 дней
    expect(wrapper.vm.filteredMeasurements.length).toBe(2)
    
    // Меняем на 7 дней
    await wrapper.find('#timeRange').setValue('7')
    expect(wrapper.vm.filteredMeasurements.length).toBe(1)
    
    // Меняем на все время
    await wrapper.find('#timeRange').setValue('all')
    expect(wrapper.vm.filteredMeasurements.length).toBe(2)
  })

  it('calculates change in measurements correctly', async () => {
    const store = useFitnessStore()
    store.measurements = [
      {
        date: '2024-03-01',
        weight: 70,
        bodyFatPercentage: 20,
        musclePercentage: 40,
        tdee: 2500
      },
      {
        date: '2024-02-01',
        weight: 71,
        bodyFatPercentage: 21,
        musclePercentage: 39,
        tdee: 2400
      }
    ]

    const wrapper = mount(AnalyticsView)
    
    // Проверяем расчет изменений
    const statsCards = wrapper.findAll('.stat-card')
    
    statsCards.forEach(card => {
      const change = card.find('.change')
      if (change) {
        const changeText = change.text()
        expect(changeText.startsWith('Изменение:')).toBe(true)
        
        // Проверяем правильность классов для положительных/отрицательных изменений
        if (changeText.includes('+')) {
          expect(change.classes()).toContain('positive')
        } else if (changeText.includes('-')) {
          expect(change.classes()).toContain('negative')
        }
      }
    })
  })
}) 