import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { AuraModifierMixin } from '../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { SwiftModifier } from '../../../modifier/modifiers/swift.modifier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { UnitBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  UNIT_KINDS
} from '../../card.enums';
import { NoFollowup } from '../../followups/no-followup';
import { wrathOfTheSkies } from './wrath-of-the-skies';

export const aidenLv3: UnitBlueprint = {
  id: 'aiden-thunder-incarnate',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.HERO,
  affinity: AFFINITIES.GENESIS,
  name: 'Aiden, Thunder Incarnate',
  getDescription: () => {
    return `@Aiden Lineage@\nAll your units have @Swift@.\n @On Enter@: Equip a @Wrath of the Skies@`;
  },
  staticDescription: `@Aiden Lineage@\nAll your units have @Swift@.\nOn Enter@: Equip a @Wrath of the Skies@`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-aiden-lv3',
  spriteId: 'aiden-lv3',
  spriteParts: {},
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  destinyCost: 3,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  atk: 3,
  maxHp: 21,
  spellpower: 1,
  level: 3,
  job: CARD_JOBS.AVENGER,
  lineage: 'Aiden',
  getFollowup: () => {
    return new NoFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(
      new Modifier('aiden-lv3-aura', game, card, {
        stackable: true,
        initialStacks: 1,
        mixins: [
          new AuraModifierMixin(game, {
            canSelfApply: true,
            isElligible(unit) {
              return unit.player.equals(card.player);
            },
            onGainAura(unit) {
              unit.addModifier(new SwiftModifier(game, card));
            },
            onLoseAura(unit) {
              unit.removeModifier(SwiftModifier);
            }
          })
        ]
      })
    );

    const artifact = card.player.generateCard(wrathOfTheSkies.id);
    artifact.play();
  }
};
