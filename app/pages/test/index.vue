<template>
  <ClientOnly>
    <draggable
      v-model="list"
      tag="transition-group"
      :component-data="{
        tag: 'div',
        type: 'transition',
        name: 'fade',
      }"
      :animation="200"
    >
      <div v-for="item in list" :key="item.id" class="fade-item">
        {{ item.text }}
      </div>
    </draggable>
  </ClientOnly>
</template>

<script setup>
import { ref } from "vue";
import { VueDraggableNext as draggable } from "vue-draggable-next";

const list = ref([
  { id: 1, text: "Smooth transition" },
  { id: 2, text: "On drag and drop" },
]);
</script>

<style scoped>
.fade-item {
  padding: 15px;
  margin: 8px 0;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
