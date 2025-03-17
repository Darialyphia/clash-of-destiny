# Clashes of Destiny

## What is this game about ?

Clashes of destiny is a turn based game where two players control a squad of heroes and battle against each other. The goal of the game is to acquire Victory Points (VP) by reducing the health of every enemy hero to 0. During battle, heroes can attack and use cards to cast powerful spells, as well as gain experience to evolve into stronger heroes, able to use even better cards.
The first player go accumulate 3 VP wins.

Main inspirations: Dungeon Drafters, Duelyst, Grand Archive TCG

## Start of the game

Both player prepare a squad of 3 heroes, that each have a deck of cards representing abilities they can case, quest they can fulfill to gain experience, as well as items they can equip.

At the beginning of the game, both players enter the Deploy phase, during which they're able to place their heroes wherever they want in their deploy zone.

## Board

There will be a certain number of maps, each with their own layout and specificities, such as traps, teleporters, areas providing various bonuses, etc. The map is selected at random.

Maps have 2 deploy zones, one for each player. These are the board tiles where players are able to deploy their heroes at the start of the game.

## Heroes

Heroes are the main pieces on the board. They have the following stats:

- Health Points (HP): once is reaches 0, the hero is removed from the board.
- Action Points (AP): used to perform any actions. It gets reset to 3 at the start of every game turn.
- Mana Points (MP): used to play cards. A hero can have a maximum of 5 MP, and regenerate 2 MP at the start of every game turn.
- Initiative: dictates how soon a hero get to act during the turn
- Class: determines which card the hero can but it their deck.
- Experience: is gained by performing various actions during the game. Once enough experience is gained, the hero can advance to a new class.

Other stats are not present on a hero by default but can be acquired via card effects:
- Attack Damage: increases the damage done with attacks
- Ability Damage: increases the damage done with abilities
- Shield: When taking damage, loses shield before losing HP

## Class Advancement system

Heroes start with a basic class at Level 1. When they reach enough experience, they can level up and advance to a new class, which makes them able to play the cards of this class that they put into their deck. For exemple, a swordsman can advance to a Knight then a Crusader, at which point they will be able to play their swordsman, knight and crusader cards.
Note that, while a level 1 class can advance to multiple other classes, the chosen advancement is decided at deck building time.
There should be, at most, 3 levels of class advancement.

Heroes gain experience by:

- attacking: one attack grants 1 EXP
- using cards: playing a card grant EXP equal to the EXP stat of the card
- fulfilling quest cards
- picking up Experience Globes

In addition, every hero receives 1 EXP at the beginning of the turn.

### Experience Globes

At the start of each turn, 2 tiles on the map will be marked. At the end of the turn, an experience globe will appear on those tiles. Picking up an experience globe grants some EXP. If a her is standing on the marked tile at the end of the turn, the globe does not appear.
If there are already at least 6 experience globes on the board, new ones will not spawn.

## Cards

There are 3 types of cards: Weapons, Artifacts, and Quests.

Abilities can only be put in to the deck of a hero with the corresponding class. Items and quests do not necessarily have specific class requirement, but they can have class-specific additional effects.

### Abilities

These cards represent skill learned by the hero that they can cast. Once used, an ability is sent to its owner's discard pile.

### Artifacts

Heroes can equip items, granting them increased stats or powerful effects. There are three kinds of items: Weapon, Armor and Relic. A hero can have, at most, one item of each type equiped. Attempting to equip another one will send the previously equipped to its owners discard pile.

Artifacts have a Durability stat. Once it reaches zero, the artifact is destroyed. 
- Weapons loses durability whenever its wielder attack. 
- Armors loses durability whenever its wielder takes damage. 
- Relics don't lose durability by default.

Artifacts will often have effect that are triggered when a specific thing occurs resulting in a loss of durability. For exemple "Whenever this hero plays a card, gain one mana and lose 1 durability".

### Quests

These cards give heroes objectives to fulfill to gain a reward like EXP or a powerful artifact. A hero can only have one ongoing quest.


## Status effects

A lot of the negative status effects cause the afflicted hero to gain cards in their hand eual to the amounts of stacks. The afflicted hero has the opportunity to play those cards to get rid of the status effect. Depending of the effect, these can be do nothing cards, or have negative effects. These cards are then discarded at the end of the hero's turn at a certain rate. Here are some examples:
- Root(1): prevents the hero from moving and give 1 "Rooted" card.
- Disarm(2): prevents the hero from attacking and give 2 "Disarmed" cards.
- Poison(1): the unit takes 1 damage every time they play a card or attack and give 1 "Poisoned" card.

## Structure of a turn

At the beginning of the game turn, all heroes draw one card from their deck, thenare sorted according to their **Initiative** stat. After that, they get to play their turn in descending order: a hero with higher initiative will get to act sooner.
During its turn, a hero can

- move: 1 AP is spent for every cell moved
- attack: deals 1 damage to a nearby enemy. A hero's first attack in a turn costs 1AP, then 2AP, 3AP, etc. There is no counterattack.
- play a card: in addition to its MP cost, playing a card costs 1AP
- meditate: The hero can put 3 cards at random from their discard pile and shuffle them back into their deck. This action consume all AP of the hero and cannot be used if they have already performed other actions this turn.

Once every hero has acted, the turn ends, and a new one begin.

## Victory Points

Victory Points are awarded by reducing a hero's HP to 0. This awards 1 VP. When this happens, the hero is removed from play for the current turn, as well as the following turn. At the start of te turn after that, the hero is redeployed in its player deploy zone. When a hero is redeployed, they keep teir exp and class advancement, but lose the artifact they had equiped as well as other buffs and debuffs tey had on them before being destroyed.

## Additional units

Some heroes may have abilities to summon other units on the board. These units do not award victory point when destroyed: only the heroes matter in this case. 

Some summoned unit can have their own deck of cards that they're able to play, but they do not gain exp.

