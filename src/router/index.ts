import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/measurements/weight',
      name: 'weight',
      component: () => import('@/components/WeightInput.vue')
    },
    {
      path: '/measurements/body',
      name: 'body',
      component: () => import('@/components/BodyMeasurements.vue')
    },
    {
      path: '/measurements/composition',
      name: 'composition',
      component: () => import('@/components/BodyComposition.vue')
    },
    {
      path: '/exercises',
      name: 'exercises',
      component: () => import('@/components/ExerciseTracker.vue')
    },
    {
      path: '/calculations',
      name: 'calculations',
      component: () => import('@/components/CalculationsView.vue')
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/views/AnalyticsView.vue')
    }
  ]
})

export default router
