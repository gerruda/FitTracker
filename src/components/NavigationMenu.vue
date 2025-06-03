<template>
  <nav class="navigation-menu">
    <router-link to="/about" class="nav-item" active-class="active">
      <span>📝</span>
      О приложении
    </router-link>

    <router-link to="/measurements/weight" class="nav-item" active-class="active">
      <span>⚖️</span>
      Вес
    </router-link>
    
    <router-link to="/measurements/body" class="nav-item" active-class="active">
      <span>📏</span>
      Обхваты
    </router-link>
    
    <router-link to="/measurements/composition" class="nav-item" active-class="active">
      <span>🧬</span>
      Состав тела
    </router-link>

    <router-link to="/exercises" class="nav-item" active-class="active">
      <span>💪</span>
      Упражнения
    </router-link>

    <router-link to="/calculations" class="nav-item" active-class="active">
      <span>🧮</span>
      Расчеты
    </router-link>
    
    <router-link to="/analytics" class="nav-item" active-class="active">
      <span>📊</span>
      Аналитика
    </router-link>
  </nav>
</template>

<style scoped>
.navigation-menu {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--hover-bg);
}

.nav-item.active {
  color: var(--primary-color);
  background: var(--primary-color-light);
}

@media (max-width: 768px) {
  .navigation-menu {
    flex-direction: column;
    padding: 0.5rem;
  }
  
  .nav-item {
    width: 100%;
    justify-content: center;
  }
}
</style> 