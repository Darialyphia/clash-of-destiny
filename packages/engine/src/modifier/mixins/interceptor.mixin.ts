import type { Modifier, ModifierTarget } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type { UnitInterceptor, Unit } from '../../unit/entities/unit.entity';
import type {
  inferInterceptorValue,
  inferInterceptorCtx,
  Interceptable
} from '../../utils/interceptable';
import type { UnitCard, UnitCardInterceptor } from '../../card/entities/unit-card.entity';
import type {
  SpellCard,
  SpellCardInterceptor
} from '../../card/entities/spell-card.entity';
import type {
  ArtifactCard,
  ArtifactCardInterceptor
} from '../../card/entities/artifact-card.entity';
import type {
  PlayerArtifact,
  PlayerArtifactInterceptor
} from '../../player/player-artifact.entity';

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
  TKey extends keyof UnitInterceptor
> extends InterceptorModifierMixin<UnitInterceptor, TKey, Unit> {}

export class UnitCardInterceptorModifierMixin<
  TKey extends keyof UnitCardInterceptor
> extends InterceptorModifierMixin<UnitCardInterceptor, TKey, UnitCard> {}

export class SpellCardInterceptorModifierMixin<
  TKey extends keyof SpellCardInterceptor
> extends InterceptorModifierMixin<SpellCardInterceptor, TKey, SpellCard> {}

export class ArtifactCardInterceptorModifierMixin<
  TKey extends keyof ArtifactCardInterceptor
> extends InterceptorModifierMixin<ArtifactCardInterceptor, TKey, ArtifactCard> {}

export class PlayerArtifactInterceptorModifierMixin<
  TKey extends keyof PlayerArtifactInterceptor
> extends InterceptorModifierMixin<PlayerArtifactInterceptor, TKey, PlayerArtifact> {}
