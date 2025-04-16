import {
  CARD_KINDS,
  UNIT_KINDS,
  CARD_DECK_SOURCES,
  type Affinity
} from '@game/engine/src/card/card.enums';
import { type CardSet, CARD_SET_DICTIONARY } from '@game/engine/src/card/sets';

export const useCardList = () => {
  const authorizedSets: CardSet[] = [CARD_SET_DICTIONARY.CORE];

  const KIND_ORDER = {
    [CARD_KINDS.UNIT]: 1,
    [CARD_KINDS.SPELL]: 2,
    [CARD_KINDS.ARTIFACT]: 3,
    [CARD_KINDS.SECRET]: 4
  };

  const UNIT_KIND_ORDER = {
    [UNIT_KINDS.SHRINE]: 1,
    [UNIT_KINDS.HERO]: 2,
    [UNIT_KINDS.MINION]: 3
  };

  const affinityFilter = ref(new Set<Affinity>());

  const cards = computed(() => {
    return authorizedSets
      .map(set => set.cards)
      .flat()
      .filter(card => {
        if (
          affinityFilter.value.size > 0 &&
          !affinityFilter.value.has(card.affinity)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.deckSource !== b.deckSource) {
          return a.deckSource === CARD_DECK_SOURCES.MAIN_DECK ? 1 : -1;
        }

        if (a.kind === b.kind) {
          if (a.kind === CARD_KINDS.UNIT && b.kind === CARD_KINDS.UNIT) {
            if (a.unitKind !== b.unitKind) {
              return UNIT_KIND_ORDER[a.unitKind] - UNIT_KIND_ORDER[b.unitKind];
            }
          }

          if (
            a.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
            b.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
            a.manaCost !== b.manaCost
          ) {
            return a.manaCost - b.manaCost;
          }

          if (
            a.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
            b.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
            a.destinyCost !== b.destinyCost
          ) {
            return a.destinyCost - b.destinyCost;
          }
          return a.name
            .toLocaleLowerCase()
            .localeCompare(b.name.toLocaleLowerCase());
        }
        return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
      });
  });

  return {
    cards,
    hasAffinityFilter(affinity: Affinity) {
      return affinityFilter.value.has(affinity);
    },
    toggleAffinityFilter(affinity: Affinity) {
      if (affinityFilter.value.has(affinity)) {
        affinityFilter.value.delete(affinity);
      } else {
        affinityFilter.value.add(affinity);
      }
    }
  };
};
