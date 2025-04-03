import { assert, StateMachine, stateTransition, type Values } from '@game/shared';
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

export type GamePhaseEventMap = {
  [GAME_PHASE_EVENTS.TURN_START]: GameTurnEvent;
  [GAME_PHASE_EVENTS.TURN_END]: GameTurnEvent;
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

  private onPlayerTurnEnd() {
    const nextPlayer = this._turnPlayer.opponent;
    if (nextPlayer.equals(this.firstPlayer)) {
      this.endGameTurn();
      this._turnPlayer = nextPlayer;
      this.startGameTurn();
    } else {
      this._turnPlayer = nextPlayer;
    }

    this._turnPlayer.startTurn();
  }

  private onGameEnd(winner: Player) {
    this._winner = winner;
  }

  initialize() {
    // const idx = this.game.rngSystem.nextInt(this.game.playerSystem.players.length);
    this._turnPlayer = this.game.playerSystem.players[0];
    this.firstPlayer = this._turnPlayer;

    this.game.on(GAME_EVENTS.PLAYER_END_TURN, this.onPlayerTurnEnd.bind(this));

    this.on(GAME_PHASE_EVENTS.TURN_START, e => {
      this.game.emit(GAME_EVENTS.TURN_START, e);
    });
    this.on(GAME_PHASE_EVENTS.TURN_END, e => {
      this.game.emit(GAME_EVENTS.TURN_END, e);
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

  endTurn() {
    assert(this.can(GAME_PHASE_TRANSITIONS.END_TURN), new WrongGamePhaseError());
    this.dispatch(GAME_PHASE_TRANSITIONS.END_TURN);
  }

  draw() {
    assert(this.can(GAME_PHASE_TRANSITIONS.DRAW), new WrongGamePhaseError());
    this.dispatch(GAME_PHASE_TRANSITIONS.DRAW);
  }

  skipDestiny() {
    assert(this.can(GAME_PHASE_TRANSITIONS.SKIP_DESTINY), new WrongGamePhaseError());
    this.dispatch(GAME_PHASE_TRANSITIONS.SKIP_DESTINY);
  }

  playDestinyCard(index: number) {
    assert(this.can(GAME_PHASE_TRANSITIONS.PLAY_DESTINY_CARD), new WrongGamePhaseError());

    this.turnPlayer.playDestinyDeckCardAtIndex(index, () => {
      this.dispatch(GAME_PHASE_TRANSITIONS.PLAY_DESTINY_CARD);
    });
  }

  declareWinner(player: Player) {
    assert(this.can(GAME_PHASE_TRANSITIONS.PLAYER_WON), new WrongGamePhaseError());
    this.dispatch(GAME_PHASE_TRANSITIONS.PLAYER_WON, player);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  shutdown() {}

  get phase() {
    return this.getState();
  }
}
