import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly with provided message', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })

  it('renders links correctly', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Test' } })
    const links = wrapper.findAll('a')
    
    expect(links).toHaveLength(2)
    expect(links[0].attributes('href')).toBe('https://vite.dev/')
    expect(links[1].attributes('href')).toBe('https://vuejs.org/')
  })

  it('has correct styling classes', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Test' } })
    
    expect(wrapper.find('.greetings').exists()).toBe(true)
    expect(wrapper.find('h1').classes()).toContain('green')
  })

  it('renders heading with correct content', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Test' } })
    const h3Text = wrapper.find('h3').text()
    expect(h3Text).toContain('successfully created a project with')
    expect(h3Text).toContain('Vite')
    expect(h3Text).toContain('Vue 3')
  })
})
