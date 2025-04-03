export type Config = {
  MAX_MAIN_DECK_SIZE: number;
  MAX_MAIN_DECK_CARD_COPIES: number;

  MAX_DESTINY_DECK_SIZE: number;
  MAX_DESTINY_DECK_CARD_COPIES: number;

  INITIAL_MANA: number;
  MAX_MANA: number;
  MAX_MANA_INCREASE_PER_TURN: number;

  INITIAL_DESTINY: number;
  MAX_DESTINY: number;
  DESTINY_EARNED_PER_TURN: number;

  INITIAL_HAND_SIZE: number;
  MAX_HAND_SIZE: number;
  CARDS_DRAWN_PER_TURN: number;
  PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN: number;
  SHUFFLE_DECK_ON_GAME_START: boolean;

  MAX_MOVEMENT_PER_TURN: number;
  MAX_ATTACKS_PER_TURN: number;
  MAX_COUNTERATTACKS_PER_TURN: number;

  MAX_RESOURCE_ACTIONS_PER_TURN: number;

  UNIT_MOVEMENT_REACH: number;

  DRAW_RESOURCE_ACTION_COST: number;

  DESTINY_RESOURCE_ACTION_MIN_BANISHED_CARDS: number;
  DESTINY_RESOURCE_ACTION_MAX_BANISHED_CARDS: number;
};

export const defaultConfig: Config = {
  MAX_MAIN_DECK_SIZE: 40,
  MAX_MAIN_DECK_CARD_COPIES: 4,

  MAX_DESTINY_DECK_SIZE: 10,
  MAX_DESTINY_DECK_CARD_COPIES: 1,

  INITIAL_MANA: 0,
  MAX_MANA: 5,
  MAX_MANA_INCREASE_PER_TURN: 2,

  INITIAL_HAND_SIZE: 5,
  MAX_HAND_SIZE: 999,
  SHUFFLE_DECK_ON_GAME_START: true,
  CARDS_DRAWN_PER_TURN: 1,
  PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN: 2,

  MAX_MOVEMENT_PER_TURN: 1,
  MAX_ATTACKS_PER_TURN: 1,
  MAX_COUNTERATTACKS_PER_TURN: 1,

  INITIAL_DESTINY: 0,
  MAX_DESTINY: 10,
  DESTINY_EARNED_PER_TURN: 0,

  MAX_RESOURCE_ACTIONS_PER_TURN: 1,

  UNIT_MOVEMENT_REACH: 2,

  DRAW_RESOURCE_ACTION_COST: 1,

  DESTINY_RESOURCE_ACTION_MIN_BANISHED_CARDS: 1,
  DESTINY_RESOURCE_ACTION_MAX_BANISHED_CARDS: 3
};
