<script lang="ts" setup>
import BattleSceneProj from '@/battle/scenes/BattleSceneProj.vue';
import { useBattleStore } from '@/battle/stores/battle.store';

definePage({
  name: 'Sandbox'
});
const battleStore = useBattleStore();
</script>

<template>
  <BattleSceneProj v-if="battleStore.isReady" />
</template>
