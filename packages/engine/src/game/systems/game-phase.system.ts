import {
  assert,
  StateMachine,
  stateTransition,
  type EmptyObject,
  type Values
} from '@game/shared';
import { GAME_EVENTS } from '../game.events';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import {
  TypedSerializableEvent,
  TypedSerializableEventEmitter
} from '../../utils/typed-emitter';
import { GAME_PHASES, GAME_PHASE_EVENTS, type GamePhase } from '../game.enums';

export const GAME_PHASE_TRANSITIONS = {
  END_TURN: 'end_turn',
  DRAW: 'draw',
  SKIP_DESTINY: 'skip_destiny',
  PLAY_DESTINY_CARD: 'play_destiny_card',
  PLAYER_WON: 'player_won'
} as const;
export type GamePhaseTransition = Values<typeof GAME_PHASE_TRANSITIONS>;

export class GameTurnEvent extends TypedSerializableEvent<
  { turnCount: number },
  { turnCount: number }
> {
  serialize(): { turnCount: number } {
    return {
      turnCount: this.data.turnCount
    };
  }
}

export class OverdriveModeEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize(): EmptyObject {
    return {};
  }
}

export class GamePhaseChangeEvent extends TypedSerializableEvent<
  { from: GamePhase; to: GamePhase },
  { from: GamePhase; to: GamePhase }
> {
  serialize() {
    return {
      from: this.data.from,
      to: this.data.to
    };
  }
}

export type GamePhaseEventMap = {
  [GAME_PHASE_EVENTS.TURN_START]: GameTurnEvent;
  [GAME_PHASE_EVENTS.TURN_END]: GameTurnEvent;
  [GAME_PHASE_EVENTS.OVERDRIVE_MODE]: OverdriveModeEvent;
  [GAME_PHASE_EVENTS.BEFORE_CHANGE_PHASE]: GamePhaseChangeEvent;
  [GAME_PHASE_EVENTS.AFTER_CHANGE_PHASE]: GamePhaseChangeEvent;
};

export class WrongGamePhaseError extends Error {
  constructor() {
    super('Wrong game phase');
  }
}

export type GamePhaseCallback = {
  player_won: (winner: Player) => void;
  end_turn: () => void;
  draw: undefined;
  skip_destiny: undefined;
  play_destiny_card: undefined;
};

export class GamePhaseSystem extends StateMachine<
  GamePhase,
  GamePhaseTransition,
  GamePhaseCallback
> {
  private _winner: Player | null = null;

  private _elapsedTurns = 0;

  private _turnPlayer!: Player;

  private firstPlayer!: Player;

  private emitter = new TypedSerializableEventEmitter<GamePhaseEventMap>();

  private _isOverdriveMode = false;

  constructor(private game: Game) {
    super(GAME_PHASES.DRAW);

    this.addTransitions([
      stateTransition(
        GAME_PHASES.DESTINY,
        GAME_PHASE_TRANSITIONS.SKIP_DESTINY,
        GAME_PHASES.MAIN
      ),
      stateTransition(
        GAME_PHASES.MAIN,
        GAME_PHASE_TRANSITIONS.END_TURN,
        GAME_PHASES.DRAW,
        this.onPlayerTurnEnd.bind(this)
      ),
      stateTransition(GAME_PHASES.DRAW, GAME_PHASE_TRANSITIONS.DRAW, GAME_PHASES.DESTINY),
      stateTransition(
        GAME_PHASES.DESTINY,
        GAME_PHASE_TRANSITIONS.PLAY_DESTINY_CARD,
        GAME_PHASES.MAIN
      ),
      stateTransition(
        GAME_PHASES.MAIN,
        GAME_PHASE_TRANSITIONS.PLAYER_WON,
        GAME_PHASES.GAME_END,
        this.onGameEnd.bind(this)
      ),
      stateTransition(
        GAME_PHASES.DRAW,
        GAME_PHASE_TRANSITIONS.PLAYER_WON,
        GAME_PHASES.GAME_END,
        this.onGameEnd.bind(this)
      ),
      stateTransition(
        GAME_PHASES.DESTINY,
        GAME_PHASE_TRANSITIONS.PLAYER_WON,
        GAME_PHASES.GAME_END,
        this.onGameEnd.bind(this)
      )
    ]);
  }

  get winner() {
    return this._winner;
  }

  get elapsedTurns() {
    return this._elapsedTurns;
  }

  get turnPlayer() {
    return this._turnPlayer;
  }

  get isOverdriveMode() {
    return this._isOverdriveMode;
  }

  private startGameTurn() {
    this.emitter.emit(
      GAME_PHASE_EVENTS.TURN_START,
      new GameTurnEvent({ turnCount: this.elapsedTurns })
    );
  }

  private endGameTurn() {
    this._elapsedTurns++;
    this.emitter.emit(
      GAME_PHASE_EVENTS.TURN_END,
      new GameTurnEvent({ turnCount: this.elapsedTurns })
    );
  }

  private checkOverdrive() {
    if (
      !this._turnPlayer.isPlayer1 &&
      this.elapsedTurns === this.game.config.ELAPSED_TURNS_TO_ACTIVATE_OVERDRIVE_MODE
    ) {
      this._isOverdriveMode = true;
      this.game.emit(GAME_PHASE_EVENTS.OVERDRIVE_MODE, new OverdriveModeEvent({}));
    }
  }

  private onPlayerTurnEnd() {
    this.turnPlayer.endTurn();

    const nextPlayer = this._turnPlayer.opponent;
    if (nextPlayer.equals(this.firstPlayer)) {
      this.endGameTurn();
      this._turnPlayer = nextPlayer;
      this.startGameTurn();
    } else {
      this._turnPlayer = nextPlayer;
    }
    this.checkOverdrive();

    this.game.inputSystem.schedule(() => {
      this._turnPlayer.startTurn();
    });
  }

  private onGameEnd(winner: Player) {
    this._winner = winner;
  }

  initialize() {
    // const idx = this.game.rngSystem.nextInt(this.game.playerSystem.players.length);
    this._turnPlayer = this.game.playerSystem.players[0];
    this.firstPlayer = this._turnPlayer;

    this.on(GAME_PHASE_EVENTS.TURN_START, e => {
      this.game.emit(GAME_EVENTS.TURN_START, e);
    });
    this.on(GAME_PHASE_EVENTS.TURN_END, e => {
      this.game.emit(GAME_EVENTS.TURN_END, e);
    });
    this.on(GAME_PHASE_EVENTS.OVERDRIVE_MODE, e => {
      this.game.emit(GAME_EVENTS.OVERDRIVE_MODE, e);
    });
    this.on(GAME_PHASE_EVENTS.BEFORE_CHANGE_PHASE, e => {
      this.game.emit(GAME_EVENTS.BEFORE_GAME_PHASE_CHANGE, e);
    });
    this.on(GAME_PHASE_EVENTS.AFTER_CHANGE_PHASE, e => {
      this.game.emit(GAME_EVENTS.AFTER_GAME_PHASE_CHANGE, e);
    });
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  get off() {
    return this.emitter.off.bind(this.emitter);
  }

  private sendTransition(...args: Parameters<typeof this.dispatch>) {
    const previousPhase = this.getState();
    const nextPhase = this.getNextState(args[0]);
    this.game.emit(
      GAME_PHASE_EVENTS.BEFORE_CHANGE_PHASE,
      new GamePhaseChangeEvent({
        from: previousPhase,
        to: nextPhase!
      })
    );
    this.dispatch(...args);
    this.game.emit(
      GAME_PHASE_EVENTS.AFTER_CHANGE_PHASE,
      new GamePhaseChangeEvent({
        from: previousPhase,
        to: nextPhase!
      })
    );
  }

  endTurn() {
    assert(this.can(GAME_PHASE_TRANSITIONS.END_TURN), new WrongGamePhaseError());
    this.sendTransition(GAME_PHASE_TRANSITIONS.END_TURN);
  }

  draw() {
    assert(this.can(GAME_PHASE_TRANSITIONS.DRAW), new WrongGamePhaseError());

    const drawCount =
      this.game.gamePhaseSystem.elapsedTurns === 0
        ? this.turnPlayer.isPlayer1
          ? this.game.config.PLAYER_1_CARDS_DRAWN_ON_FIRST_TURN
          : this.game.config.PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN
        : this.game.config.CARDS_DRAWN_PER_TURN;
    this.turnPlayer.draw(drawCount);
    this.sendTransition(GAME_PHASE_TRANSITIONS.DRAW);
    if (this.elapsedTurns === 0) {
      this.skipDestiny();
    }
  }

  skipDestiny() {
    assert(this.can(GAME_PHASE_TRANSITIONS.SKIP_DESTINY), new WrongGamePhaseError());
    this.sendTransition(GAME_PHASE_TRANSITIONS.SKIP_DESTINY);
  }

  playDestinyCard(index: number) {
    assert(this.can(GAME_PHASE_TRANSITIONS.PLAY_DESTINY_CARD), new WrongGamePhaseError());

    this.turnPlayer.playDestinyDeckCardAtIndex(index, () => {
      this.sendTransition(GAME_PHASE_TRANSITIONS.PLAY_DESTINY_CARD);
    });
  }

  declareWinner(player: Player) {
    assert(this.can(GAME_PHASE_TRANSITIONS.PLAYER_WON), new WrongGamePhaseError());
    // @ts-expect-error
    this.sendTransition(GAME_PHASE_TRANSITIONS.PLAYER_WON, player);
  }

  shutdown() {}

  get phase() {
    return this.getState();
  }
}
