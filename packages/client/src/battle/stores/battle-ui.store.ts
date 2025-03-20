import { defineStore } from 'pinia';
import {
  useActiveUnit,
  useBattleStore,
  useCells,
  useDispatcher,
  useGameState,
  useUserPlayer
} from './battle.store';
import { isDefined, type Nullable, type Point } from '@game/shared';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';
import { Layer } from '@pixi/layers';
import type { DisplayObject } from 'pixi.js';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { UnitViewModel } from '@/unit/unit.model';
import type { CellViewModel } from '@/board/cell.model';
import { match } from 'ts-pattern';
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';
import { BattleController } from '../controllers/battle.controller';
import { DeployController } from '../controllers/deploy.controller';
import { EndGameController } from '../controllers/end-game.controller';
import type { UiController } from '../controllers/ui-controller';
import type { CardViewModel } from '@/card/card.model';
import { Flip } from 'gsap/Flip';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';

export const useInternalBattleUiStore = defineStore(
  'internal-battle-ui',
  () => {
    const hoveredCell = shallowRef<Nullable<CellViewModel>>(null);
    const highlightedUnit = ref<Nullable<UnitViewModel>>(null);
    const selectedUnitId = ref<Nullable<string>>(null);
    // The card that the player is trying to play or replace
    const selectedCardId = ref<Nullable<string>>(null);
    // the card the player is inspecting by right clicking
    const inspectedCardId = ref<Nullable<string>>(null);

    watch(hoveredCell, cell => {
      const unit = cell?.getUnit();
      if (unit) {
        highlightedUnit.value = unit;
      }
    });

    return {
      hoveredCell,
      highlightedUnit,
      selectedUnitId,
      selectedCardId,
      inspectedCardId
    };
  }
);

export const useBattleUiStore = defineStore('battle-ui', () => {
  const internals = useInternalBattleUiStore();
  const battle = useBattleStore();
  const { state } = useGameState();
  const dispatch = useDispatcher();
  const activeUnit = useActiveUnit();

  const cells = useCells();

  type LayerName = 'ui' | 'scene' | 'fx';

  const layers: Record<LayerName, Ref<Layer | undefined>> = {
    ui: ref(),
    scene: ref(),
    fx: ref()
  };

  const selectedUnit = computed(() =>
    internals.selectedUnitId
      ? (state.value.entities[internals.selectedUnitId] as UnitViewModel)
      : null
  );

  const selectUnit = (unit: UnitViewModel) => {
    internals.selectedUnitId = unit.id;
  };

  const unselectUnit = () => {
    internals.selectedUnitId = null;
  };

  const selectedCard = computed(() =>
    internals.selectedCardId
      ? (state.value.entities[internals.selectedCardId] as CardViewModel)
      : null
  );

  const selectCard = (element: HTMLElement | null, card: CardViewModel) => {
    internals.selectedCardId = card.id;
    const flipState = Flip.getState(element);
    window.requestAnimationFrame(() => {
      Flip.from(flipState, {
        targets: '#dragged-card .card',
        duration: 0.4,
        absolute: true,
        ease: Power3.easeOut
      });
    });
  };

  const unselectCard = () => {
    internals.selectedCardId = null;
    const el = document.querySelector('#dragged-card .card');
    if (!el) return;

    const flipState = Flip.getState(el);
    window.requestAnimationFrame(() => {
      Flip.from(flipState, {
        targets: '.hand-card__card',
        duration: 0.4,
        absolute: false,
        ease: Power1.easeOut
      });
    });
  };

  const inspectedCard = computed(() =>
    internals.inspectedCardId
      ? (state.value.entities[internals.inspectedCardId] as CardViewModel)
      : null
  );

  const inspectCard = (element: HTMLElement, card: CardViewModel) => {
    internals.inspectedCardId = card.id;

    const flipState = Flip.getState(element);
    window.requestAnimationFrame(() => {
      Flip.from(flipState, {
        targets: '#inspected-card .card',
        duration: 0.4,
        absolute: false,
        ease: Power3.easeOut
      });
    });
  };

  const uninspectCard = () => {
    const card = inspectedCard.value!;
    internals.inspectedCardId = null;

    const el = document.querySelector(`[data-flip-id="card_${card.id}"]`);
    const flipState = Flip.getState(el);
    window.requestAnimationFrame(() => {
      Flip.from(flipState, {
        targets: [`.hand-card__card[data-flip-id="card_${card.id}"]`],
        duration: 0.35,
        absolute: false,
        ease: Back.easeIn
      });
    });
  };

  const firstTargetIntent = shallowRef<Nullable<CellViewModel>>(null);
  battle.on(GAME_EVENTS.INPUT_END, async e => {
    if (e.type !== 'playCard') return;
    if (firstTargetIntent.value) {
      const { x, y } = firstTargetIntent.value.position;

      dispatch({
        type: 'addCardTarget',
        payload: {
          playerId: activeUnit.value.playerId,
          x,
          y
        }
      });
    }
  });

  const _cardPlayIntent = shallowRef<Nullable<CardViewModel>>(null);
  const cardPlayIntent = computed({
    get() {
      return _cardPlayIntent.value;
    },
    set(card) {
      if (!card) {
        if (!_cardPlayIntent.value) return;
        const current = _cardPlayIntent.value;
        const el = document.querySelector(
          `[data-flip-id="card_${current.id}"]`
        );
        const flipState = Flip.getState(el);
        window.requestAnimationFrame(() => {
          Flip.from(flipState, {
            targets: [`.hand-card__card[data-flip-id="card_${current.id}"]`],
            duration: 0.35,
            absolute: false,
            ease: Back.easeIn
          });
        });
        _cardPlayIntent.value = null;
        return;
      }

      _cardPlayIntent.value = card;

      const element = document.querySelector(
        `[data-flip-id="card_${card.id}"]`
      );
      const flipState = Flip.getState(element);
      window.requestAnimationFrame(() => {
        Flip.from(flipState, {
          targets: '.play-intent .card',
          duration: 0.4,
          absolute: false,
          ease: Back.easeIn
        });
      });
    }
  });
  battle.on(GAME_EVENTS.UNIT_BEFORE_PLAY_CARD, async () => {
    cardPlayIntent.value = null;
    firstTargetIntent.value = null;
    internals.selectedCardId = null;
  });
  battle.on(GAME_EVENTS.INPUT_START, async e => {
    if (e.type === 'cancelPlayCard') {
      cardPlayIntent.value = null;
      firstTargetIntent.value = null;
      internals.selectedCardId = null;
    }
  });

  const userPlayer = useUserPlayer();

  const controller = computed<UiController>(() =>
    match(state.value.phase)
      .with(
        GAME_PHASES.DEPLOY,
        () =>
          new DeployController({
            selectedUnit,
            selectUnit,
            unselectUnit,
            player: userPlayer,
            gameState: state
          })
      )
      .with(
        GAME_PHASES.BATTLE,
        () =>
          new BattleController({
            cardPlayIntent,
            firstTargetIntent,
            hoveredCell: computed(() => internals.hoveredCell),
            selectedUnit: computed({
              get() {
                return selectedUnit.value;
              },
              set(unit) {
                if (!unit) {
                  unselectUnit();
                } else {
                  selectUnit(unit);
                }
              }
            }),
            selectedCard: computed({
              get() {
                return selectedCard.value;
              },
              set(card) {
                if (!card) {
                  unselectCard();
                } else {
                  selectCard(null, card);
                }
              }
            }),
            activeUnit: computed(
              () =>
                state.value.entities[state.value.activeUnit] as UnitViewModel
            ),
            state,
            dispatcher: dispatch
          })
      )
      .with(GAME_PHASES.END, () => new EndGameController())
      .exhaustive()
  );

  return {
    controller,

    selectedUnit,
    selectUnit,
    unselectUnit,

    selectedCard,
    selectCard,
    unselectCard,

    inspectedCard,
    inspectCard,
    uninspectCard,

    firstTargetIntent,

    cardPlayIntent,

    registerLayer(layer: Layer, name: LayerName) {
      if (!layer) return;
      layers[name].value = layer;
      layer.group.enableSort = true;
      layer.sortableChildren = true;
    },
    assignLayer(obj: Nullable<DisplayObject>, name: LayerName) {
      if (!isDefined(obj)) return;
      obj.parentLayer = layers[name].value;
    },
    hoveredCell: computed(() => internals.hoveredCell),
    hoverAt(point: Point) {
      internals.hoveredCell = cells.value.find(
        cell => cell.id === pointToCellId(point)
      );
    },
    unHover() {
      internals.hoveredCell = null;
      internals.highlightedUnit = null;
    },

    highlightedUnit: computed(() => internals.highlightedUnit),
    highlightUnit(unit: UnitViewModel) {
      internals.highlightedUnit = unit;
    },
    unhighlightUnit() {
      internals.highlightedUnit = null;
    }
  };
});
