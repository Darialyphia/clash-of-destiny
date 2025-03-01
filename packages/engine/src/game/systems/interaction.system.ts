import {
  type EmptyObject,
  type Point,
  type Serializable,
  type Values,
  assert,
  isDefined,
  StateMachine,
  stateTransition
} from '@game/shared';
import type { AnyCard, SerializedCard } from '../../card/entities/card.entity';
import type { Player } from '../../player/player.entity';
import { System } from '../../system';
import { match } from 'ts-pattern';
import type { DeckCard } from '../../card/entities/deck.entity';
import {
  IllegalTargetError,
  InvalidInteractionStateError,
  TooManyTargetsError
} from '../../input/input-errors';

export type EffectTarget = {
  type: 'cell';
  isElligible: (cell: Point) => boolean;
};

export type SelectedTarget = {
  type: 'cell';
  cell: Point;
};

export const INTERACTION_STATES = {
  IDLE: 'idle',
  SELECTING_TARGETS: 'selecting_targets',
  SELECTING_CARDS: 'selecting_cards',
  SEARCHING_DECK: 'searching_deck'
} as const;
export type InteractionState = Values<typeof INTERACTION_STATES>;

export const INTERACTION_STATE_TRANSITIONS = {
  START_SELECTING_TARGETS: 'start_selecting_targets',
  CANCEL_SELECTING_TARGETS: 'cancel_selecting_targets',
  COMMIT_SELECTING_TARGETS: 'commit_selecting_targets',
  START_SELECTING_CARD: 'start_selecting_card',
  COMMIT_CARD_SELECTION: 'commit_card_selection',
  START_SEARCHING_DECK: 'start_searching_deck',
  COMMIT_SEARCHING_DECK: 'commit_searching-deck'
} as const;
export type InteractionStateTransition = Values<typeof INTERACTION_STATE_TRANSITIONS>;

export type InteractionStateContext =
  | {
      state: 'idle';
      ctx: EmptyObject;
    }
  | {
      state: 'selecting_targets';
      ctx: {
        player: Player;
        canCommit: (targets: SelectedTarget[]) => boolean;
        getNextTarget: (targets: SelectedTarget[]) => EffectTarget | null;
        selectedTargets: SelectedTarget[];
        onComplete: (targets: SelectedTarget[]) => void;
      };
    }
  | {
      state: 'selecting_cards';
      ctx: {
        player: Player;
        choices: AnyCard[];
        minChoices: number;
        maxChoices: number;
        onComplete: (selectedCards: AnyCard[]) => void;
      };
    }
  | {
      state: 'searching_deck';
      ctx: {
        player: Player;
        minChoices: number;
        maxChoices: number;
        isElligible: (card: DeckCard) => boolean;
        onComplete: (selectedCards: AnyCard[], player: Player) => void;
      };
    };

export type SerializedInteractionContext =
  | {
      state: 'idle';
      ctx: EmptyObject;
    }
  | {
      state: 'selecting_targets';
      ctx: {
        playerId: string;
        selectedTargets: SelectedTarget[];
        elligibleTargets: SelectedTarget[];
        canSkip: boolean;
      };
    }
  | {
      state: 'selecting_cards';
      ctx: {
        playerId: string;
        choices: SerializedCard[];
        minChoices: number;
        maxChoices: number;
      };
    }
  | {
      state: 'searching_deck';
      ctx: {
        player: string;
        minChoices: number;
        maxChoices: number;
        elligibleCards: SerializedCard[];
        inelligibleCards: SerializedCard[];
      };
    };

export class InteractionSystem
  extends System<never>
  implements Serializable<SerializedInteractionContext>
{
  private stateMachine = new StateMachine<InteractionState, InteractionStateTransition>(
    INTERACTION_STATES.IDLE,
    [
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_SELECTING_TARGETS,
        INTERACTION_STATES.SELECTING_TARGETS
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_TARGETS,
        INTERACTION_STATE_TRANSITIONS.CANCEL_SELECTING_TARGETS,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_TARGETS,
        INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_TARGETS,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_SELECTING_CARD,
        INTERACTION_STATES.SELECTING_CARDS
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_CARDS,
        INTERACTION_STATE_TRANSITIONS.COMMIT_CARD_SELECTION,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_SEARCHING_DECK,
        INTERACTION_STATES.SEARCHING_DECK
      ),
      stateTransition(
        INTERACTION_STATES.SEARCHING_DECK,
        INTERACTION_STATE_TRANSITIONS.COMMIT_SEARCHING_DECK,
        INTERACTION_STATES.IDLE
      )
    ]
  );

  private _context: InteractionStateContext = {
    state: 'idle',
    ctx: {}
  };

  initialize(): void {}

  shutdown(): void {}

  get context() {
    return this._context;
  }

  private commitTargetsIfAble() {
    assert(this._context.state === INTERACTION_STATES.SELECTING_TARGETS, 'Invalid state');
    const nextTarget = this._context.ctx.getNextTarget(this._context.ctx.selectedTargets);
    if (!isDefined(nextTarget)) {
      this.commitTargets();
    }
  }

  get can() {
    return this.stateMachine.can.bind(this.stateMachine);
  }

  startSelectingTargets<T extends EffectTarget['type'] = EffectTarget['type']>({
    player,
    firstTarget,
    getNextTarget,
    canCommit,
    onComplete
  }: {
    player: Player;
    firstTarget?: SelectedTarget;
    getNextTarget: (targets: Array<SelectedTarget & { type: T }>) => EffectTarget | null;
    canCommit: (targets: Array<SelectedTarget & { type: T }>) => boolean;
    onComplete: (targets: Array<SelectedTarget & { type: T }>) => void;
  }) {
    assert(
      this.stateMachine.can(INTERACTION_STATE_TRANSITIONS.START_SELECTING_TARGETS),
      'Cannot play card'
    );
    this._context = {
      state: INTERACTION_STATES.SELECTING_TARGETS,
      ctx: {
        player,
        getNextTarget: getNextTarget as (
          targets: SelectedTarget[]
        ) => EffectTarget | null,
        selectedTargets: firstTarget ? [firstTarget] : [],
        canCommit: canCommit as (targets: SelectedTarget[]) => boolean,
        onComplete: onComplete as (targets: SelectedTarget[]) => void
      }
    };
    this.stateMachine.dispatch(INTERACTION_STATE_TRANSITIONS.START_SELECTING_TARGETS);
    this.commitTargetsIfAble();
  }

  private validateTarget(target: SelectedTarget) {
    assert(
      this._context.state === INTERACTION_STATES.SELECTING_TARGETS,
      new InvalidInteractionStateError()
    );
    const nextTarget = this._context.ctx.getNextTarget(this._context.ctx.selectedTargets);
    assert(isDefined(nextTarget), new TooManyTargetsError());
    assert(nextTarget.type === target.type, new IllegalTargetError());

    match(target)
      .with({ type: 'cell' }, ({ cell }) => {
        assert(nextTarget.isElligible(cell as any), new IllegalTargetError());
      })
      .exhaustive();
  }

  addTarget(target: SelectedTarget) {
    assert(
      this._context.state === INTERACTION_STATES.SELECTING_TARGETS,
      'Cannot add card target'
    );
    this.validateTarget(target);
    this._context.ctx.selectedTargets.push(target);
    this.commitTargetsIfAble();
  }

  cancelSelectingTargets() {
    assert(
      this.stateMachine.can(INTERACTION_STATE_TRANSITIONS.CANCEL_SELECTING_TARGETS),
      'Cannot cancel playing card'
    );
    this._context = {
      state: 'idle',
      ctx: {}
    };
    this.stateMachine.dispatch(INTERACTION_STATE_TRANSITIONS.CANCEL_SELECTING_TARGETS);
  }

  commitTargets() {
    assert(
      this.stateMachine.can(INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_TARGETS),
      'Cannot commit playing card'
    );
    assert(
      this._context.state === INTERACTION_STATES.SELECTING_TARGETS,
      'Invalid interaction state context'
    );
    assert(
      this._context.ctx.canCommit(this._context.ctx.selectedTargets),
      new IllegalTargetError()
    );

    const { selectedTargets, onComplete } = this._context.ctx;
    this.stateMachine.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_TARGETS);
    this._context = {
      state: 'idle',
      ctx: {}
    };
    onComplete(selectedTargets);
  }

  startSelectingCards({
    choices,
    player,
    onComplete,
    minChoices,
    maxChoices
  }: {
    choices: AnyCard[];
    player: Player;
    onComplete: (selectedCards: AnyCard[]) => void;
    minChoices: number;
    maxChoices: number;
  }) {
    assert(
      this.stateMachine.can(INTERACTION_STATE_TRANSITIONS.START_SELECTING_CARD),
      'Cannot start selecting cards'
    );
    this._context = {
      state: INTERACTION_STATES.SELECTING_CARDS,
      ctx: { choices, player, onComplete, minChoices, maxChoices }
    };
    this.stateMachine.dispatch(INTERACTION_STATE_TRANSITIONS.START_SELECTING_CARD);
  }

  commitCardSelection(selectedCardIds: string[]) {
    assert(
      this.stateMachine.can(INTERACTION_STATE_TRANSITIONS.COMMIT_CARD_SELECTION),
      'Cannot commit card selection'
    );

    assert(
      this._context.state === INTERACTION_STATES.SELECTING_CARDS,
      'Invalid interaction state context'
    );

    assert(
      selectedCardIds.length >= this._context.ctx.minChoices,
      'Not enough cards selected'
    );
    assert(
      selectedCardIds.length <= this._context.ctx.maxChoices,
      'Too many cards selected'
    );

    const selectedCards = this._context.ctx.choices.filter(card =>
      selectedCardIds.includes(card.id)
    );
    this.stateMachine.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_CARD_SELECTION);
    this._context.ctx.onComplete(selectedCards);
    this._context = {
      state: 'idle',
      ctx: {}
    };
  }

  startSearchingDeck({
    player,
    minChoices,
    maxChoices,
    onComplete,
    isElligible
  }: {
    player: Player;
    minChoices: number;
    maxChoices: number;
    onComplete: (selectedCards: AnyCard[], player: Player) => void;
    isElligible?: (card: DeckCard) => boolean;
  }) {
    assert(
      this.stateMachine.can(INTERACTION_STATE_TRANSITIONS.START_SEARCHING_DECK),
      'Cannot start searching deck'
    );
    this._context = {
      state: 'searching_deck',
      ctx: {
        player,
        minChoices,
        maxChoices,
        onComplete,
        isElligible: isElligible ?? (() => true)
      }
    };

    this.stateMachine.dispatch(INTERACTION_STATE_TRANSITIONS.START_SEARCHING_DECK);
  }

  commitSearchingDeck(selectedCardIds: string[]) {
    assert(
      this.stateMachine.can(INTERACTION_STATE_TRANSITIONS.COMMIT_SEARCHING_DECK),
      'Cannot commit searching deck'
    );

    assert(
      this._context.state === INTERACTION_STATES.SEARCHING_DECK,
      'Invalid interaction state context'
    );

    assert(
      selectedCardIds.length >= this._context.ctx.minChoices,
      'Not enough cards selected'
    );

    assert(
      selectedCardIds.length <= this._context.ctx.maxChoices,
      'Too many cards selected'
    );

    const selectedCards = this._context.ctx.player.deck.cards.filter(card =>
      selectedCardIds.includes(card.id)
    );
    this._context.ctx.onComplete(selectedCards, this._context.ctx.player);
    this.stateMachine.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_SEARCHING_DECK);
    this._context = {
      state: 'idle',
      ctx: {}
    };
  }

  serialize() {
    return {
      state: this._context.state as any,
      ctx: match(this._context)
        .with({ state: 'idle' }, () => ({}))
        .with({ state: 'selecting_targets' }, ({ ctx }) => ({
          playerId: ctx.player.id,
          selectedTargets: ctx.selectedTargets,
          elligibleTargets: this.game.boardSystem.cells
            .filter(cell => ctx.getNextTarget(ctx.selectedTargets)?.isElligible(cell))
            .map(cell => ({ type: 'cell', cell: cell.position.serialize() })),
          canSkip: ctx.canCommit(ctx.selectedTargets)
        }))
        .with({ state: 'selecting_cards' }, ({ ctx }) => ({
          playerId: ctx.player.id,
          choices: ctx.choices.map(card => card.serialize()),
          minChoices: ctx.minChoices,
          maxChoices: ctx.maxChoices
        }))
        .with({ state: 'searching_deck' }, ({ ctx }) => ({
          player: ctx.player.id,
          minChoices: ctx.minChoices,
          maxChoices: ctx.maxChoices,
          elligibleCards: ctx.player.deck.cards
            .filter(card => ctx.isElligible(card))
            .map(card => card.serialize()),
          inelligibleCards: ctx.player.deck.cards
            .filter(card => !ctx.isElligible(card))
            .map(card => card.serialize())
        }))
        .exhaustive()
    };
  }
}
