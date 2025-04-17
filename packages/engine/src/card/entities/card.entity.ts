import { assert, isDefined, type JSONObject } from '@game/shared';
import { Entity } from '../../entity';
import type { Game } from '../../game/game';
import type { Ability, CardBlueprint } from '../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_EVENTS,
  type Affinity,
  type CardDeckSource,
  type CardKind,
  type Rarity
} from '../card.enums';
import { CardAddtoHandEvent, type CardEventMap } from '../card.events';
import { KeywordManagerComponent } from '../components/keyword-manager.component';
import type { Modifier } from '../../modifier/modifier.entity';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import { AbilityNotFoundError } from '../card-errors';
import type { SelectedTarget } from '../../game/systems/interaction.system';

export type CardOptions<T extends CardBlueprint = CardBlueprint> = {
  id: string;
  blueprint: T;
};

export type AnyCard = Card<any, any, any, any>;
export type CardInterceptors = {
  manaCost: Interceptable<number | null>;
  destinyCost: Interceptable<number | null>;
  abilities: Interceptable<Ability<AnyCard>[]>;
  canBeBanishedForDestiny: Interceptable<boolean>;
};

export const makeCardInterceptors = (): CardInterceptors => ({
  manaCost: new Interceptable(),
  destinyCost: new Interceptable(),
  abilities: new Interceptable(),
  canBeBanishedForDestiny: new Interceptable()
});

export type SerializedCard = {
  id: string;
  entityType: 'card';
  player: string;
  iconId: string;
  blueprintId: string;
  description: string;
  name: string;
  kind: CardKind;
  setId: string;
  rarity: Rarity;
  canPlay: boolean;
  deckSource: CardDeckSource;
  manaCost: number | null;
  destinyCost: number | null;
  affinity: Affinity;
  modifiers: string[];
  canBeBanishedForDestiny: boolean;
  abilities: Array<{
    id: string;
    manaCost: number;
    label: string;
    text: string;
    canUse: boolean;
    isCardAbility: boolean;
  }>;
};

export abstract class Card<
  TSerialized extends JSONObject,
  TEventMap extends CardEventMap,
  TInterceptors extends CardInterceptors = CardInterceptors,
  TBlueprint extends CardBlueprint = CardBlueprint
> extends Entity<TEventMap, TInterceptors> {
  protected game: Game;

  blueprint: TBlueprint;

  player: Player;

  protected keywordManager = new KeywordManagerComponent();

  protected modifierManager: ModifierManager<AnyCard>;

  constructor(
    game: Game,
    player: Player,
    interceptors: TInterceptors,
    options: CardOptions
  ) {
    super(options.id, interceptors);
    this.game = game;
    this.player = player;
    // @ts-expect-error
    this.blueprint = options.blueprint;
    this.modifierManager = new ModifierManager(this);
  }

  get manaCost() {
    return this.interceptors.manaCost.getValue(
      this.blueprint.deckSource === CARD_DECK_SOURCES.MAIN_DECK
        ? this.blueprint.manaCost
        : null,
      {}
    );
  }

  get destinyCost() {
    return this.interceptors.destinyCost.getValue(
      this.blueprint.deckSource === CARD_DECK_SOURCES.DESTINY_DECK
        ? this.blueprint.destinyCost
        : null,
      {}
    );
  }

  get fulfillsResourceCost() {
    if (this.blueprint.deckSource === CARD_DECK_SOURCES.MAIN_DECK) {
      return this.player.mana.canSpend(this.manaCost ?? 0);
    }
    if (this.blueprint.deckSource === CARD_DECK_SOURCES.DESTINY_DECK) {
      return this.player.destiny.canSpend(this.destinyCost ?? 0);
    }
    return false;
  }

  get fulfillsAffinity() {
    return this.player.unlockedAffinities.has(this.blueprint.affinity);
  }

  get deckSource() {
    return this.blueprint.deckSource;
  }

  get blueprintId() {
    return this.blueprint.id;
  }

  get kind() {
    return this.blueprint.kind;
  }

  get affinity() {
    return this.blueprint.affinity;
  }

  get name() {
    return this.blueprint.name;
  }

  get rarity() {
    return this.blueprint.rarity;
  }

  get canBeBanishedForDestiny() {
    return this.interceptors.canBeBanishedForDestiny.getValue(true, {});
  }

  get abilities() {
    return this.interceptors.abilities.getValue(
      this.blueprint.abilities as Ability<AnyCard>[],
      {}
    );
  }

  get hasClassBonus() {
    if ('job' in this.blueprint) {
      return this.player.hero.card.job === this.blueprint.job;
    }

    return false;
  }

  get keywords() {
    return this.keywordManager.keywords;
  }

  get addKeyword() {
    return this.keywordManager.add.bind(this.keywordManager);
  }

  get removeKeyword() {
    return this.keywordManager.remove.bind(this.keywordManager);
  }

  get removeModifier() {
    return this.modifierManager.remove.bind(this.modifierManager);
  }

  get hasModifier() {
    return this.modifierManager.has.bind(this.modifierManager);
  }

  get getModifier() {
    return this.modifierManager.get.bind(this.modifierManager);
  }

  get modifiers() {
    return this.modifierManager.modifiers;
  }

  addModifier(modifier: Modifier<AnyCard>) {
    this.modifierManager.add(modifier);

    return () => this.removeModifier(modifier);
  }

  addToHand() {
    this.emitter.emit(CARD_EVENTS.ADD_TO_HAND, new CardAddtoHandEvent({}));
  }

  discard() {
    this.emitter.emit(CARD_EVENTS.DISCARD, new CardAddtoHandEvent({}));
  }

  replace() {
    this.emitter.emit(CARD_EVENTS.REPLACE, new CardAddtoHandEvent({}));
  }

  canUseAbiliy(id: string) {
    const ability = this.abilities.find(ability => ability.id === id);
    assert(isDefined(ability), new AbilityNotFoundError());

    return (
      this.player.mana.current >= ability.manaCost && ability.canUse(this.game, this)
    );
  }

  useAbility(
    id: string,
    options: {
      onBeforeUse?: (ability: Ability<AnyCard>) => void;
      onAfterUse?: (ability: Ability<AnyCard>) => void;
    } = {}
  ) {
    const ability = this.abilities.find(ability => ability.id === id);
    assert(isDefined(ability), new AbilityNotFoundError());

    const followup = ability.getFollowup(this.game, this);
    this.game.interaction.startSelectingTargets({
      player: this.player,
      getNextTarget: targets => {
        return followup.getTargets(this.game, this as any)[targets.length] ?? null;
      },
      canCommit: followup.canCommit,
      onComplete: (targets: SelectedTarget[]) => {
        options.onBeforeUse?.(ability);
        this.player.mana.remove(ability.manaCost);
        ability.onResolve(this.game, this, targets);
        options.onAfterUse?.(ability);
      }
    });
  }

  abstract canPlay(): boolean;

  abstract play(): void;

  abstract serialize(): TSerialized;

  shutdown() {
    this.emitter.removeAllListeners();
  }
}
