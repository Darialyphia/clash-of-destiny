import type { Modifier, ModifierTarget } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import type {
  inferInterceptorValue,
  inferInterceptorCtx,
  Interceptable
} from '../../utils/interceptable';
import type {
  SpellCard,
  AbilityCardInterceptors
} from '../../card/entities/spell-card.entity';
import type {
  ArtifactCard,
  ArtifactCardInterceptors
} from '../../card/entities/artifact-card.entity';
import type { Artifact, ArtifactInterceptor } from '../../player/artifact.entity';
import type { UnitInterceptors } from '../../unit/unit-interceptors';
import type {
  AnyUnitCard,
  UnitCard,
  UnitCardInterceptors
} from '../../card/entities/unit-card.entity';
import type {
  HeroCard,
  HeroCardInterceptors
} from '../../card/entities/hero-card.entity';
import type {
  ShrineCard,
  ShrineCardInterceptors
} from '../../card/entities/shrine-card.entity';
import type {
  MinionCard,
  MinionCardInterceptors
} from '../../card/entities/minion-card.entity';

type InterceptorMap = Record<string, Interceptable<any, any>>;
export class InterceptorModifierMixin<
  TInterceptorMap extends InterceptorMap,
  TKey extends keyof TInterceptorMap,
  TTarget extends ModifierTarget
> extends ModifierMixin<TTarget> {
  private modifier!: Modifier<TTarget>;

  constructor(
    game: Game,
    private options: {
      key: TKey;
      prioriry?: number;
      interceptor: (
        value: inferInterceptorValue<TInterceptorMap[TKey]>,
        ctx: inferInterceptorCtx<TInterceptorMap[TKey]>,
        modifier: Modifier<Unit>
      ) => inferInterceptorValue<TInterceptorMap[TKey]>;
    }
  ) {
    super(game);
    this.interceptor = this.interceptor.bind(this);
  }

  interceptor(
    value: inferInterceptorValue<TInterceptorMap[TKey]>,
    ctx: inferInterceptorCtx<TInterceptorMap[TKey]>
  ) {
    //@ts-expect-error
    return this.options.interceptor(value, ctx, this.modifier);
  }

  onApplied(target: TTarget, modifier: Modifier<TTarget>): void {
    this.modifier = modifier;
    //@ts-expect-error
    target.addInterceptor(
      this.options.key,
      this.interceptor as any,
      this.options.prioriry
    );
  }

  onRemoved(target: TTarget): void {
    //@ts-expect-error
    target.removeInterceptor(
      this.options.key,
      this.interceptor as any,
      this.options.prioriry
    );
  }

  onReapplied() {}
}

export class UnitInterceptorModifierMixin<
  TKey extends keyof UnitInterceptors
> extends InterceptorModifierMixin<UnitInterceptors, TKey, Unit> {}

export class UnitCardInterceptorModifierMixin<
  TKey extends keyof UnitCardInterceptors
> extends InterceptorModifierMixin<UnitCardInterceptors, TKey, AnyUnitCard> {}

export class HeroCardInterceptorModifierMixin<
  TKey extends keyof HeroCardInterceptors
> extends InterceptorModifierMixin<HeroCardInterceptors, TKey, HeroCard> {}

export class ShrineCardInterceptorModifierMixin<
  TKey extends keyof ShrineCardInterceptors
> extends InterceptorModifierMixin<ShrineCardInterceptors, TKey, ShrineCard> {}

export class MinionCardInterceptorModifierMixin<
  TKey extends keyof MinionCardInterceptors
> extends InterceptorModifierMixin<MinionCardInterceptors, TKey, MinionCard> {}

export class SpellCardInterceptorModifierMixin<
  TKey extends keyof AbilityCardInterceptors
> extends InterceptorModifierMixin<AbilityCardInterceptors, TKey, SpellCard> {}

export class ArtifactCardInterceptorModifierMixin<
  TKey extends keyof ArtifactCardInterceptors
> extends InterceptorModifierMixin<ArtifactCardInterceptors, TKey, ArtifactCard> {}

export class ArtifactInterceptorModifierMixin<
  TKey extends keyof ArtifactInterceptor
> extends InterceptorModifierMixin<ArtifactInterceptor, TKey, Artifact> {}
