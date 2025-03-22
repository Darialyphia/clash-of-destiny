import type { CellViewModel } from '@/board/cell.model';
import type { HighlightTag, UiController } from './ui-controller';
import type { UnitViewModel } from '@/unit/unit.model';
import type { Nullable } from '@game/shared';
import type { Ref, ComputedRef } from 'vue';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { GameState } from '../stores/battle.store';
import { match } from 'ts-pattern';
import {
  INTERACTION_STATES,
  type InteractionState,
  type SerializedInteractionContext
} from '@game/engine/src/game/systems/interaction.system';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { CardViewModel } from '@/card/card.model';

export type BattleControllerOptions = {
  cardPlayIntent: Ref<Nullable<CardViewModel>>;
  hoveredCell: ComputedRef<Nullable<CellViewModel>>;
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

  get selectedUnit() {
    return this.options.selectedUnit.value;
  }

  get selectedCard() {
    return this.options.selectedCard.value;
  }

  get cardPlayIntent() {
    return this.options.cardPlayIntent.value;
  }

  get hoveredCell() {
    return this.options.hoveredCell.value;
  }

  get gameState() {
    return this.options.state.value;
  }

  private selectUnit(unit: UnitViewModel) {
    this.options.selectedUnit.value = unit;
  }

  unselectUnit() {
    this.options.selectedUnit.value = null;
  }

  private handleQuickCast(cell: CellViewModel) {
    if (!this.selectedCard) return;
    this.options.cardPlayIntent.value = this.selectedCard;
    this.selectedCard.play();
    if (this.selectedCard.canPlayAt(cell)) {
      // const hand = this.selectedCard.getUnit().getHand();
      // const index = hand.findIndex(c => c.id === this.selectedCard!.id);
      // if (this.selectedCard.needsTargets) {
      //   this.options.firstTargetIntent.value = cell;
      // }
      // this.options.cardPlayIntent.value = this.selectedCard;
      // this.selectedCard.getUnit().playCard(index);
    } else {
      this.options.selectedCard.value = null;
    }
  }

  private handleIdleState(cell: CellViewModel) {
    if (this.selectedCard) {
      return;
      // return this.handleQuickCast(cell);
    }

    const isMoveIntent =
      this.activeUnit.moveIntent &&
      pointToCellId(this.activeUnit.moveIntent.point) === cell.id;
    if (isMoveIntent) {
      this.activeUnit.commitMove();
      return;
    }

    if (this.activeUnit.canMoveTo(cell)) {
      this.activeUnit.moveTowards({
        x: cell.position.x,
        y: cell.position.y
      });
      this.unselectUnit();
      return;
    }

    const unit = cell.getUnit();
    const canAttack =
      this.activeUnit.canAttackAt(cell) &&
      unit &&
      this.selectedUnit?.equals(unit);

    if (canAttack) {
      this.activeUnit.attackAt(cell);
      return;
    }

    if (unit && !unit.equals(this.activeUnit)) {
      this.selectUnit(unit);
      this.activeUnit.moveIntent = null;
      return;
    }

    this.options.selectedUnit.value = null;
    this.activeUnit.moveIntent = null;
  }

  handleTargetingState(
    cell: CellViewModel,
    interactionState: SerializedInteractionContext & {
      state: typeof INTERACTION_STATES.SELECTING_TARGETS;
    }
  ) {
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

  onCellClick(cell: CellViewModel): void {
    match(this.options.state.value.interactionState)
      .with({ state: INTERACTION_STATES.IDLE }, () => {
        this.handleIdleState(cell);
      })
      .with({ state: INTERACTION_STATES.SELECTING_CARDS }, () => {})
      .with(
        { state: INTERACTION_STATES.SELECTING_TARGETS },
        interactionState => {
          this.handleTargetingState(cell, interactionState);
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
    return match(this.options.state.value.interactionState)
      .with({ state: INTERACTION_STATES.IDLE }, () => {
        if (isPlayingFx) {
          return null;
        }

        if (this.selectedCard) {
          // if (this.selectedCard?.canPlayAt(cell)) {
          //   return isHovered ? 'targeting-range' : 'targeting-valid';
          // }
          return null;
        }

        // if (
        //   this.activeUnit.moveIntent?.path.some(
        //     c => pointToCellId(c) === cell.id
        //   )
        // ) {
        //   return 'movement-path';
        // }
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
          const card = this.activeUnit.getCurrentlyPlayedCard();
          const aoe = card?.getAoe();
          if (aoe) {
            const isInAOE = aoe.cells.some(c => c.equals(cell));
            const canPlayAt =
              this.gameState.interactionState.state ===
                INTERACTION_STATES.SELECTING_TARGETS &&
              this.gameState.interactionState.ctx.elligibleTargets.some(
                c => pointToCellId(c.cell) === this.hoveredCell?.id
              );

            if (canPlayAt && isInAOE) {
              return 'danger';
            }
          }

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

          const isWithinRange = card?.getRange().some(c => c.equals(cell));

          if (isWithinRange) {
            return 'normal';
          }

          return null;
        }
      )
      .exhaustive();
  }
}
