<script setup lang="ts">
// Пустой скрипт, так как route не используется
</script>

<template>
  <div class="app">
    <header>
      <nav>
        <router-link to="/" class="nav-link">📝 О приложении</router-link>
        <router-link to="/measurements/weight" class="nav-link">⚖️ Вес</router-link>
        <router-link to="/measurements/body" class="nav-link">📏 Замеры тела</router-link>
        <router-link to="/measurements/composition" class="nav-link">🧬 Состав тела</router-link>
        <router-link to="/exercises" class="nav-link">💪 Упражнения</router-link>
        <router-link to="/calculations" class="nav-link">🧮 Расчеты</router-link>
        <router-link to="/analytics" class="nav-link">📊 Аналитика</router-link>
      </nav>
    </header>

    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
:root {
  --primary-color: #4CAF50;
  --primary-color-dark: #388E3C;
  --primary-color-light: #C8E6C9;
  --secondary-color: #2196F3;
  --danger-color: #F44336;
  --danger-color-dark: #D32F2F;
  --danger-color-light: #FFCDD2;
  --text-color: #212121;
  --text-muted: #757575;
  --border-color: #E0E0E0;
  --bg-light: #F5F5F5;
  --card-bg: #FFFFFF;
  --border-radius: 8px;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--bg-light);
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  background: var(--primary-color);
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.app-main {
  padding: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
}

.btn-secondary {
  background: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  opacity: 0.9;
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: var(--danger-color-dark);
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

@media (max-width: 768px) {
  nav {
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
