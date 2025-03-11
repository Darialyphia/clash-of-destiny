<script setup lang="ts">
import Fps from '@/shared/components/Fps.vue';
import BattleUi from '@/battle/components/BattleUi.vue';

definePage({
  name: 'Sandbox'
});
</script>

<template>
  <Fps />

  <BattleUi />
</template>
