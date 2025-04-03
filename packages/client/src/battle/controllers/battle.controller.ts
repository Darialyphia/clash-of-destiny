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
  type SerializedInteractionContext
} from '@game/engine/src/game/systems/interaction.system';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { CardViewModel } from '@/card/card.model';
import type { PlayerViewModel } from '@/player/player.model';

export type BattleControllerOptions = {
  cardPlayIntent: Ref<Nullable<CardViewModel>>;
  hoveredCell: ComputedRef<Nullable<CellViewModel>>;
  selectedUnit: Ref<Nullable<UnitViewModel>>;
  selectedCard: Ref<Nullable<CardViewModel>>;
  firstTargetIntent: Ref<Nullable<CellViewModel>>;
  turnPlayer: Ref<PlayerViewModel>;
  state: Ref<GameState>;
  dispatcher: InputDispatcher;
};

export class BattleController implements UiController {
  constructor(private options: BattleControllerOptions) {}

  get turnPlayer() {
    return this.options.turnPlayer.value;
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

  private handleIdleState(cell: CellViewModel) {
    if (this.selectedCard) {
      return;
      // return this.handleQuickCast(cell);
    }

    const isMoveIntent =
      this.selectedUnit?.moveIntent &&
      pointToCellId(this.selectedUnit.moveIntent.point) === cell.id;
    if (isMoveIntent) {
      this.selectedUnit.commitMove();
      return;
    }

    if (this.selectedUnit?.canMoveTo(cell)) {
      this.selectedUnit.moveTowards({
        x: cell.position.x,
        y: cell.position.y
      });
      this.unselectUnit();
      return;
    }

    const unit = cell.getUnit();
    const canAttack = this.selectedUnit?.canAttackAt(cell);

    if (canAttack) {
      this.selectedUnit!.attackAt(cell);
      return;
    }

    if (unit && (!this.selectedUnit || !unit.equals(this.selectedUnit))) {
      if (this.selectedUnit) {
        this.selectedUnit.moveIntent = null;
      }
      this.selectUnit(unit);
      return;
    }

    if (this.selectedUnit) {
      this.selectedUnit.moveIntent = null;
    }
    this.options.selectedUnit.value = null;
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
          playerId: this.turnPlayer.id,
          ...cell.position
        }
      });
      return;
    }

    if (!isElligible) {
      this.options.dispatcher({
        type: 'cancelPlayCard',
        payload: {
          playerId: this.turnPlayer.id
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
        if (this.selectedUnit?.canMoveTo(cell)) {
          return 'movement';
        }
        if (this.selectedUnit?.canAttackAt(cell)) {
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
          const card = this.turnPlayer.getCurrentlyPlayedCard();
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
