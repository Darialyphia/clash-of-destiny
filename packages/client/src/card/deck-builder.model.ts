import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';

export type DeckBuilderCardPool = Array<{
  blueprint: CardBlueprint;
  copiesOwned: number;
}>;

export type Deck = {
  main: Array<{ blueprintId: string; count: number }>;
  destiny: Array<{ blueprintId: string; count: number }>;
};

export class DeckBuildervModel {
  private deck: Deck = {
    main: [],
    destiny: []
  };

  constructor(private cardPool: DeckBuilderCardPool) {
    this.cardPool = cardPool;
  }
}
