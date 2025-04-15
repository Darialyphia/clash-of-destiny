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
import type { AnyCard } from '../../card/entities/card.entity';
import type { Player } from '../../player/player.entity';
import { System } from '../../system';
import { match } from 'ts-pattern';
import {
  IllegalTargetError,
  InvalidInteractionStateError,
  TooManyTargetsError
} from '../../input/input-errors';
import {
  TypedSerializableEvent,
  TypedSerializableEventEmitter
} from '../../utils/typed-emitter';
import { GAME_EVENTS, GameInputRequiredEvent } from '../game.events';

export type EffectTarget = {
  type: 'cell';
  isElligible: (point: Point, selectedTargets: SelectedTarget[]) => boolean;
};

export type SelectedTarget = {
  type: 'cell';
  cell: Point;
};

export const INTERACTION_STATES = {
  IDLE: 'idle',
  SELECTING_TARGETS: 'selecting_targets',
  SELECTING_CARDS: 'selecting_cards'
} as const;
export type InteractionState = Values<typeof INTERACTION_STATES>;

export const INTERACTION_STATE_TRANSITIONS = {
  START_SELECTING_TARGETS: 'start_selecting_targets',
  CANCEL_SELECTING_TARGETS: 'cancel_selecting_targets',
  COMMIT_SELECTING_TARGETS: 'commit_selecting_targets',
  START_SELECTING_CARD: 'start_selecting_card',
  COMMIT_CARD_SELECTION: 'commit_card_selection'
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
        nextTargetIntent: SelectedTarget | null;
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
        choices: string[];
        minChoices: number;
        maxChoices: number;
      };
    };

export class RequirePlayerInputEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize(): EmptyObject {
    return {};
  }
}
export const INTERACTION_EVENTS = {
  REQUIRE_PLAYER_INPUT: 'require_player_input'
} as const;
export type InteractionEvent = Values<typeof INTERACTION_EVENTS>;

export type InteractionEventMap = {
  [INTERACTION_EVENTS.REQUIRE_PLAYER_INPUT]: RequirePlayerInputEvent;
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
      )
    ]
  );

  private _context: InteractionStateContext = {
    state: 'idle',
    ctx: {}
  };

  private emitter = new TypedSerializableEventEmitter<InteractionEventMap>();

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  get off() {
    return this.emitter.off.bind(this.emitter);
  }

  initialize(): void {
    this.on(INTERACTION_EVENTS.REQUIRE_PLAYER_INPUT, () => {
      this.game.emit(GAME_EVENTS.INPUT_REQUIRED, new GameInputRequiredEvent({}));
    });
  }

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

  private requireInputIfNeeded() {
    if (this.stateMachine.getState() !== INTERACTION_STATES.IDLE) {
      this.game.snapshotSystem.takeSnapshot();
      this.emitter.emit(
        INTERACTION_EVENTS.REQUIRE_PLAYER_INPUT,
        new RequirePlayerInputEvent({})
      );
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
        nextTargetIntent: null,
        selectedTargets: firstTarget ? [firstTarget] : [],
        canCommit: canCommit as (targets: SelectedTarget[]) => boolean,
        onComplete: onComplete as (targets: SelectedTarget[]) => void
      }
    };
    this.stateMachine.dispatch(INTERACTION_STATE_TRANSITIONS.START_SELECTING_TARGETS);
    this.commitTargetsIfAble();
    this.requireInputIfNeeded();
  }

  private validateTarget(target: SelectedTarget) {
    assert(
      this._context.state === INTERACTION_STATES.SELECTING_TARGETS,
      new InvalidInteractionStateError()
    );
    const nextTarget = this._context.ctx.getNextTarget(this._context.ctx.selectedTargets);
    const selected = this._context.ctx.selectedTargets;
    assert(isDefined(nextTarget), new TooManyTargetsError());
    assert(nextTarget.type === target.type, new IllegalTargetError());

    match(target)
      .with({ type: 'cell' }, ({ cell }) => {
        assert(nextTarget.isElligible(cell as any, selected), new IllegalTargetError());
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
    this._context.ctx.nextTargetIntent = null;
    this.commitTargetsIfAble();
    this.requireInputIfNeeded();
  }

  addNextTargetIntent(target: SelectedTarget) {
    assert(
      this._context.state === INTERACTION_STATES.SELECTING_TARGETS,
      'Cannot add card target'
    );
    this.validateTarget(target);
    this._context.ctx.nextTargetIntent = target;
  }

  cancelSelectingTargets() {
    assert(
      this.stateMachine.can(INTERACTION_STATE_TRANSITIONS.CANCEL_SELECTING_TARGETS),
      'Cannot cancel playing card'
    );
    this._context = {
      state: INTERACTION_STATES.IDLE,
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
      state: INTERACTION_STATES.IDLE,
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
    this.requireInputIfNeeded();
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
    const onComplete = this._context.ctx.onComplete;
    this._context = {
      state: INTERACTION_STATES.IDLE,
      ctx: {}
    };
    onComplete(selectedCards);
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
            .filter(cell =>
              ctx
                .getNextTarget(ctx.selectedTargets)
                ?.isElligible(cell, ctx.selectedTargets)
            )
            .map(cell => ({ type: 'cell', cell: cell.position.serialize() })),
          canSkip: ctx.canCommit(ctx.selectedTargets)
        }))
        .with({ state: 'selecting_cards' }, ({ ctx }) => ({
          playerId: ctx.player.id,
          choices: ctx.choices.map(card => card.id),
          minChoices: ctx.minChoices,
          maxChoices: ctx.maxChoices
        }))

        .exhaustive()
    };
  }

  getEntities() {
    return match(this._context)
      .with({ state: 'selecting_targets' }, { state: 'idle' }, () => [])
      .with({ state: 'selecting_cards' }, ({ ctx }) => {
        return ctx.choices;
      })
      .exhaustive();
  }
}
