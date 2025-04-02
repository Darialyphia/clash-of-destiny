# Clashes of Destiny

## What is this game about ?

Clashes of destiny is a turn based game where two players control a hero, summon creatures, cast spells and equip artifacts to defeat the opponent hero.

Main inspirations: Duelyst, Grand Archive TCG

## Start of the game

Both player prepare 2 decks: a **Main deck** and a **Destiny deck**. They also choose a **Shrine** among the four available ones: Fire, Water, Air or Earth.

When the game starts they draw 4 cards from their main deck.

## Win Condition

The goal of the game is to reduce the Health of the opponent's Shrine OR Hero to zero.

## Board

The board is of 7 X 5 dimensions with square tiles. The player's Shrines are placed on the middle row on both extremity of the board.

## Resources

The game uses 3 types or resources used to play cards and activate abilities: Mana, Destiny and Elements

### Mana

Mana is a resource that is used to play cards from the Main Deck. If a players has unspent mana at the end of their turn, that mana is lost.
Players start at 1 mana, and the amount of mana they gain per turn increases every turn, up to  a maximum of 10.

### Destiny

Destiny is a resource that is used to play cards from the Destiny Deck. Unlike mana, Destiny accumulates between turns, and is gained at the rate of 1 destiny per turn.

### Elements

Elements that a player unlocks determines which cards they are able to play. They start the game with the element associated with their Shrine. However, as their Hero evolves, they will be able to unlock new elements based on the hero evolution.
The 4 basic elements are: Fire, Water, Air and Earth.
The 5 advanced elements are : Life, Death, Order, Chaos and Arcane.
There is also a Normal element that can be used regardless of which elements are unlocked.

### Resource action

In addition to their mana and destiny gain, players have the ability to perform one resource action every turn. Here are the available resource actions:
- Spend 1 mana to draw 1 card.
- Put a card in their hand at the bottom of their deck and draw 1 card.
- Banish a card in their hand to gain 1 destiny.

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

The Destiny deck deck contain cards of the following types:
- Minion
- Spell
- Artifact
- Secret
- Hero

Note that a card that has a Destiny cost can be put in the destiny deck : if a card has a mana cost instead, it must go into the Main deck.

When a card from the Destiny deck leaves the field it is banished instead of being sent to its owner's discard pile.

## Cards

There are 5 types of cards: Minions, Heroes, Spells, Artifacts and Secrets.

### Heroes

Heroes are the main pieces on the board. the goal of the game is to reduce their Health Points to 0.

A hero starts in the Destiny deck.

When a hero is played, it will either, depending on the state of the game, replace the player's Shrine or its current Hero.

To be able to play a hero, a player must meet its Destiny cost requirement, as wel las its base level requirement. There are three base level: 1, 2 and 3. Only a hero level 1 can be placed on a Shrine, then a level 2 hero placed on a level 1 hero, and so on.

Note that a card effect may increase a hero's level. This does not affect the hero's base level. For instance, a base level 1 hero with +1 level can not be used to play a base level 3 hero from your destiny deck.

For all intents and purposes, the Shrine a player starts the game with is considered a base level 0 hero that cannot move, attack or use abilities.

#### Level up

When playing a base level 2 or 3 hero, the previous level card are not destroyed or banished. Instead, they are placed on top of each other, to make it easier to track lineage and unlocked elements.

Leveling up a hero will not change its **exhaustion status** nor will it remove the damage they have suffere so far.

#### Lineage

In addition, most heroes follow a lineage: only heroes that share the same lineage can be played. The lineage is indicated on the card.

For example, you can only play *Aiden, Caller of Storms*, hat has the Aiden lineage, if your current hero also posess the Aiden lineage.

Note that not all heroes have a lineage requirement. However, playing a hero without a lineage breaks the "lineage chains". For example, playing the base level 2 hero *Ohm, the Forgotten* on top of a base level 1 *Aiden, Child of the Storm*, breaks the Aiden Lineage. ITs player will then not be able to play a level 3 hero with the Aiden lineage, such as *Aiden, Thunder Incarnate*.

### Deckbuilding restrictions

There are not deckbuilding restrictions regarding which heroes a player can put in their Destiny Deck. However, once they played a base level hero, they might lock themselves out from using other heroes due to lineage / level restrictions.

#### Elements

Most heroes of base level 3 will unlock one of the five advanced elements for its player.

#### Stats

A Hero has the following stats:
- Health Points (HP): how much damage they can take before being defeated.
- Attack Points (ATK): how much damage they deal through combat.
- Spellpower (SP): influences the effects of some spells and abilties.

### Minions

Minions represent creatures that are summoned on the board and can fight other minions and heroes. They can start either in the Main deck or the Destiny deck.

Unless specified otherwise on the card, a minion must be summoned on a tile adjacent to its owner's Hero or Shrine (diagonals are allowed).

#### Summoning sickness

There is not "summoning sickness" in this game: minions can move attack or use abilties the turn they are summoned. They cannot however, attack the enemy shrine or Hero the turn they are summoned, unless specified otherwise on the card.

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
> **Arcane Bolt** *(Spell – Spellcaster)*  
> Deal 2 damage.  
> **Class Bonus – Draw a card.**  
> (This effect only triggers if your Hero is a Spellcaster.)

Class Bonuses allow you to create synergies between your Hero and your deck, rewarding themed builds while still allowing off-class flexibility.


## Units

A **Unit** represents either a Creature, Shrine or Hero on the board. During its owner's turn, a unit can
- Move up to 2 tiles. Moving diagonally counts as 2 spaces.
- Attack another unit.
- Use an ability.

### Exhaustion

An *exhausted* unit cannot move, attack, counterattack or use an ability. A unit becomes exhausted when
- it attacks.
- it uses an ability (note: not all abilities exhaust the unit).
- it counterattacks.

A unit loses its exhausted status at the end of any player's turn.

## Combat

When attacking, a unit deals damage to it equals to its attack, then, if able, the defender will counter attack, doing the same.

An exhausted unit will not counterattack

A unit will counterattack even if the attacked reduced it's HP to 0.

## Discard Pile and Banish Pile

Once a card leaves the board, it will go to its owner's discard pile if it is a main deck card, or its banish pile if it is a destiny deck cards. Some cards effect may also require a player to banish some cards.
From a gameplay perspective, the banish pile is way harder to interact with, while the discard pile may be used for resurrection or recursion effects, etc...

## First player advantage

To counterbalance first player advantage, the layer going second:
- starts with an additional card in their hand at the start of the game, that allows them to either gain one additional mana, or gain  Destiny
- will draw 2 cards on their first turn's Draw phase.

