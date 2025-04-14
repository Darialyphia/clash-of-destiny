# Comprehensive Rules

## What is this game about ?

Clashes of destiny is a turn based game where two players control a hero, summon creatures, cast spells and equip artifacts to defeat the opponent hero.

## Start of the game

Both player prepare 2 decks: a **Main deck** and a **Destiny deck**.

When the game starts they draw 4 cards from their main deck.

## Win Condition

The goal of the game is to reduce the Health of the opponent's **Shrine** OR **Hero** to zero.

## Board

The board is of 9 X 5 dimensions with square tiles. The player's Shrines are placed on the middle row on both extremity of the board.

## Resources

The game uses 3 types or resources used to play cards and activate abilities: Mana, Destiny and Affinities

### Mana

Mana is a resource that is used to play cards from the Main Deck. It is earned at a rate of a flat 4 mana per turn, but can be banked for use in the following turn, up to a maximum of 4 mana. This means a player can have up to 8 mana in a turn.

#### Overdrive Mode

At the start of player 2's sixth turn, the game enters Overdrive Mode. In this mode, players gain 6 mana per turn instead of 4.

### Destiny

Destiny is a resource that is used to play cards from the Destiny Deck. Unlike mana, Players do not gain Destiny automatically at the start of their turn. Instead, once per turn, they may chose to banish up to 2 cards from their han in order to gain that much destiny.

### Affinities

Affinities that a player unlocks determines which cards they are able to play. They start the game with the affinity associated with their Shrine (lvl 0 hero). However, as their Hero gets to max level (level 3), they will be able to unlock a affinities based on the hero.
The 4 basic affinities are: Fire, Water, Air and Earth.
The 5 advanced affinities are : Genesis, Wrath, Harmony, Void and Arcane.
There is also a Normal affinities that can be used regardless of which affinities are unlocked.

## Decks

### Main deck

The Main deck is made of 40 cards. A maximum of 4 copies of the same crd can be put into the main deck. At the beginning of their turn, player draw one card from the main deck.

The Main deck can contain cards of the following type:

- Minion
- Spell
- Artifact
- Secret

### Destiny Deck

The destiny deck is made of 10 unique cards. At the beginning of their turn, after they have drawn from their main deck, a player may spend destiny points to play one and only one card from the Destiny Deck by paying its Destiny cost. If they choose to do so, they must do it before any other action.

The Destiny Deck **MUST** contain one and only one Shrine card. The other cards can be of the following types:

- Minion
- Spell
- Artifact
- Secret
- Hero
- Shrine

Note that only a card that has a Destiny cost can be put in the destiny deck : if a card has a mana cost instead, it must go into the Main deck.

When a card from the Destiny deck leaves the field it is banished instead of being sent to its owner's discard pile.

Players are able to play one (and only one) destiny card during the Destiny Phase; however, some card effects could allow playing additional cards from the destiny deck at other points during the course of the game, for exemple "On Enter: play an artifact card from your destiny deck with a destiny cost of 0."

## Cards

There are 6 types of cards: Minions, Heroes, Spells, Artifacts and Secrets.

### Shrines

Shrines are what a player starts the game with. They start in the Destiny Deck and players must only have one Shrine.

At the start of the game, the Shrine is automatically played from the destiny deck, and the players draw their starting hand (shrines have different way of drawing your starting hand, for example "On Enter: draw 6 cards" vs "On Enter: Scry(6), then draw 6 cards").

Shrines have a fixed starting position: {x: 0, y: 2} for player 1, ans {x: 8, y: 2} for player 2.

A shrine behaves like a hero, except it cannot move, attack, or counterattack.

For all intents and purposes, Shrines are considered level 0 heroes.

### Heroes

Heroes are the main pieces on the board. the goal of the game is to reduce their Health Points to 0.

A hero starts in the Destiny deck.

When a hero is played, it will either, depending on the state of the game, replace the player's Shrine or its current Hero.

To be able to play a hero, a player must meet its Destiny cost requirement, as wel las its base level requirement. There are three base level: 1, 2 and 3. Only a hero level 1 can be placed on a Shrine, then a level 2 hero placed on a level 1 hero, and so on.

Note that a card effect may increase a hero's level. This does not affect the hero's base level. For instance, a base level 1 hero with +1 level can not be used to play a base level 3 hero from your destiny deck.

For all intents and purposes, the Shrine a player starts the game with is considered a base level 0 hero that cannot move, attack or use abilities.

#### Level up

When playing a base level 2 or 3 hero, the previous level card are not destroyed or banished. Instead, they are placed on top of each other, to make it easier to track lineage and unlocked affinities.

Leveling up a hero will not change its **exhaustion status** nor will it remove the damage they have suffered so far.

#### Lineage

In addition, most heroes follow a lineage: only heroes that share the same lineage can be played. The lineage is indicated on the card.

For example, you can only play _Aiden, Caller of Storms_, hat has the Aiden lineage, if your current hero also posess the Aiden lineage.

Note that not all heroes have a lineage requirement. However, playing a hero without a lineage breaks the "lineage chain". For example, playing the base level 2 hero _Ohm, the Forgotten_ on top of a base level 1 _Aiden, Child of the Storm_, breaks the Aiden Lineage. Its player will then not be able to play a level 3 hero with the Aiden lineage, such as _Aiden, Thunder Incarnate_.

If the player has a Shrine on the board instead of a Hero, they can play any level 1 Hero on top of it.

### Deckbuilding restrictions

There are no deckbuilding restrictions regarding which, or how many, heroes a player can put in their Destiny Deck. However, once they played a base level hero, they might lock themselves out from using other heroes due to lineage / level restrictions.

#### Affinities

Most heroes of base level 3 will unlock one of the five advanced affinities for its player.

#### Stats

A Hero has the following stats:

- Health Points (HP): how much damage they can take before being defeated.
- Attack Points (ATK): how much damage they deal through combat.
- Spellpower (SP): influences the effects of some other cards.
- Level (LV): represents the level of the hero. It can influence the effects of some other cards.

### Minions

Minions represent creatures that are summoned on the board and can fight other minions and heroes. They can start either in the Main deck or the Destiny deck.

Unless specified otherwise on the card, a minion must be summoned on a tile adjacent to its owner's Hero or Shrine (diagonals are allowed).

#### Summoning sickness

There is not "summoning sickness" in this game: minions can move attack or use abilties the turn they are summoned.

#### Stats

A Minion has the following stats:

- Health Points (HP): how much damage they can take before being defeated.
- Attack Points (ATK): how much damage they deal through combat.

### Spells

Spells one time effect cards: once they are resolved, they go to it's owner discard pile.

Some spell's effects may be affected by its owner's Heros Spellpower in various ways. They may also be affected by it owner's Hero's level.

Example: Deal 2 + SP damage, draw LV cards, etc...

### Artifacts

Artifacts are equipements that are attached to its owner's Hero. Note that a Shrine cannot equip artifacts.

Artifacts grant various effects or abilities to its wielder while they are equipped.

When a hero changes by playing another one from the Destiny deck, artifacts stay in place, without any change.

#### Stats

An artifact has the following stats:

- Durability: an artifact starts at full durability. Whenever its hero takes damage, the artifact loses 1 durability. When it reaches zero, the artifact is destroyed. The durability loss does not scale with the damage taken: it will always lose one and only one durability.

### Secrets

Secrets are cards that are played face down on the board and cannot be activated manually. They trigger when some specific conditions are met, such as the opponent using a spell, or attacking the enemy hero. Once triggered, the secret is destroyed.

### Card Classes and Class Bonus

Each card may have a **Class**, which represents its combat or magical specialization. The available classes are:

- **Fighter** – Close-range martial combatants.
- **Spellcaster** – Masters of destructive or utility magic.
- **Avenger** – Agile skirmishers, assassins, and archers.
- **Guardian** – Defensive stalwarts who protect allies.
- **Wanderer** – Versatile adventurers and rogues.
- **Summoner** – Masters of conjuring minions or spirits.

Cards of any type (Minion, Spell, Artifact, etc.) may have a class.

Your **Hero also has a class**, indicated on their card.

Some card effects include a **Class Bonus**: this is an additional effect that is only applied if the card's class matches your Hero’s class.

#### Example:

> **Arcane Bolt** _(Spell – Spellcaster)_  
> Deal 2 damage.  
> **Class Bonus – Draw a card.**  
> (This effect only triggers if your Hero is a Spellcaster.)

Class Bonuses allow you to create synergies between your Hero and your deck, rewarding themed builds while still allowing off-class flexibility.

### Card replacement

Once per turn, a player can put one card from their hand at the bottom of their deck, then draw one card.

## Units

A **Unit** represents either a Creature, Shrine or Hero on the board. During its owner's turn, a unit can

- Move 1 tile. Units cannot move diagonally.
- Attack another unit.
- Use an ability.

### Exhaustion

An _exhausted_ unit cannot move, attack, counterattack or use an ability. A unit becomes exhausted when

- it attacks.
- it uses an ability (note: not all abilities exhaust the unit).
- it counterattacks.

A unit loses its exhausted status at the end of any player's turn. Losing the exhausted status is referred as _activating_.

## Combat

When attacking, a unit deals damage to it equals to its attack, then, if able, the defender will counter attack, doing the same.

An exhausted unit will not counterattack. (Keep in mind units activate at the start of **every** player turn, so attacking on your turn does not prevent you from counterattacking).

A unit will counterattack even if the attacked reduced it's HP to 0.

## Discard Pile and Banish Pile

Once a card leaves the board, it will go to its owner's discard pile if it is a main deck card, or its banish pile if it is a destiny deck cards. Some cards effect may also require a player to banish some cards.
From a gameplay perspective, the banish pile is way harder to interact with, while the discard pile may be used for resurrection or recursion effects, etc...

## First player advantage

To counterbalance first player advantage, the player going second:

- starts with an additional card in their hand at the start of the game, that allows them to gain one additional mana for this turn only.
- will draw 2 cards on their first turn's Draw phase.
- will have access to Overdrive Mode one turn sooner.
