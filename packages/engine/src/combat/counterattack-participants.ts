import type { Unit } from '../unit/entities/unit.entity';

export abstract class CounterAttackParticipantStrategy {
  abstract getCounterattackParticipants(opts: {
    attacker: Unit;
    initialTarget: Unit;
    affectedUnits: Unit[];
  }): Unit[];
}

export class SingleCounterAttackParticipantStrategy extends CounterAttackParticipantStrategy {
  getCounterattackParticipants(opts: {
    attacker: Unit;
    initialTarget: Unit;
    affectedUnits: Unit[];
  }): Unit[] {
    return [opts.initialTarget];
  }
}

export class EveryCounterAttackParticipantStrategy extends CounterAttackParticipantStrategy {
  getCounterattackParticipants(opts: {
    attacker: Unit;
    initialTarget: Unit;
    affectedUnits: Unit[];
  }): Unit[] {
    return opts.affectedUnits;
  }
}
