import type { CellViewModel } from '@/board/cell.model';
import type { HighlightTag, UiController } from './ui-controller';
import type { UnitViewModel } from '@/unit/unit.model';
import type { Nullable } from '@game/shared';
import type { Ref } from 'vue';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { GameState } from '../stores/battle.store';
import { match } from 'ts-pattern';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/interaction.system';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { CardViewModel } from '@/card/card.model';

export type BattleControllerOptions = {
  cardPlayIntent: Ref<Nullable<CardViewModel>>;
  selectedUnit: Ref<Nullable<UnitViewModel>>;
  selectedCard: Ref<Nullable<CardViewModel>>;
  firstTargetIntent: Ref<Nullable<CellViewModel>>;
  activeUnit: Ref<UnitViewModel>;
  state: Ref<GameState>;
  dispatcher: InputDispatcher;
};

export class BattleController implements UiController {
  constructor(private options: BattleControllerOptions) {}

  get activeUnit() {
    return this.options.activeUnit.value;
  }

  get selectedCard() {
    return this.options.selectedCard.value;
  }

  onCellClick(cell: CellViewModel): void {
    match(this.options.state.value.interactionState)
      .with({ state: INTERACTION_STATES.IDLE }, () => {
        if (this.selectedCard) {
          if (this.selectedCard.canPlayAt(cell)) {
            const hand = this.selectedCard.getUnit().getHand();
            const index = hand.findIndex(c => c.id === this.selectedCard!.id);
            if (this.selectedCard.needsTargets) {
              this.options.firstTargetIntent.value = cell;
              console.log('declared first target intent');
            }

            this.options.cardPlayIntent.value = this.selectedCard;
            this.selectedCard.getUnit().playCard(index);
          } else {
            this.options.selectedCard.value = null;
          }

          return;
        }

        if (this.activeUnit.moveIntent) {
          if (pointToCellId(this.activeUnit.moveIntent.point) === cell.id) {
            this.activeUnit.commitMove();
            return;
          }
        }

        if (this.activeUnit.canMoveTo(cell)) {
          this.activeUnit.moveTowards({
            x: cell.position.x,
            y: cell.position.y
          });
          return;
        }

        if (this.activeUnit.canAttackAt(cell)) {
          this.activeUnit.attackAt(cell);
          return;
        }

        this.activeUnit.moveIntent = null;
      })
      .with({ state: INTERACTION_STATES.SELECTING_CARDS }, () => {})
      .with(
        { state: INTERACTION_STATES.SELECTING_TARGETS },
        interactionState => {
          const isElligible = interactionState.ctx.elligibleTargets.some(
            c => pointToCellId(c.cell) === cell.id
          );
          const isAlreadySelected = interactionState.ctx.selectedTargets.some(
            c => pointToCellId(c.cell) === cell.id
          );

          if (isElligible && !isAlreadySelected) {
            this.options.dispatcher({
              type: 'addCardTarget',
              payload: {
                playerId: this.activeUnit.playerId,
                ...cell.position
              }
            });
            return;
          }

          if (!isElligible) {
            this.options.dispatcher({
              type: 'cancelPlayCard',
              payload: {
                playerId: this.activeUnit.playerId
              }
            });
          }
        }
      );
  }

  get interactionState() {
    return this.options.state.value.interactionState;
  }

  getCellHighlightTag(
    cell: CellViewModel,
    isHovered: boolean,
    isPlayingFx: boolean
  ): HighlightTag | null {
    if (isPlayingFx) {
      return null;
    }

    return match(this.options.state.value.interactionState)
      .with({ state: INTERACTION_STATES.IDLE }, () => {
        if (this.selectedCard) {
          if (this.selectedCard?.canPlayAt(cell)) {
            return isHovered ? 'targeting-range' : 'targeting-valid';
          }
          return null;
        }

        if (
          this.activeUnit.moveIntent?.path.some(
            c => pointToCellId(c) === cell.id
          )
        ) {
          return 'movement-path';
        }
        if (this.activeUnit.canMoveTo(cell)) {
          return 'movement';
        }
        if (this.activeUnit.canAttackAt(cell)) {
          return 'danger';
        }

        return null;
      })
      .with({ state: INTERACTION_STATES.SELECTING_CARDS }, () => {
        return null;
      })
      .with(
        { state: INTERACTION_STATES.SELECTING_TARGETS },
        interactionState => {
          const isElligible = interactionState.ctx.elligibleTargets.some(
            c => pointToCellId(c.cell) === cell.id
          );

          const isSelected = interactionState.ctx.selectedTargets.some(
            c => pointToCellId(c.cell) === cell.id
          );

          if (isSelected) {
            return 'targeting-range';
          }

          if (isElligible) {
            return isHovered ? 'targeting-range' : 'targeting-valid';
          }

          return null;
        }
      )
      .exhaustive();
  }
}
