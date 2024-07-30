<template>
  <div class="about">
    <h1>This is an home page</h1>
    <RouterLink to="/about">
      <span>about</span>
    </RouterLink>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
