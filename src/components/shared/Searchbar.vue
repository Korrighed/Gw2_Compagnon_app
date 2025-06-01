<template>
  <div class="search-container mb-3">
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-control glassmorphism text-white"
      placeholder="Rechercher un objet..."
      @click.stop
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>
.search-container {
  padding: 0 1rem;
}

.search-container input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.search-container input:focus {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.1);
  color: white;
}

.search-container input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
</style>
