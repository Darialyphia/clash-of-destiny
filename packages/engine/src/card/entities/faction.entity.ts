import type { EmptyObject, Serializable } from '@game/shared';
import { Entity } from '../../entity';

export type SerializedFaction = {
  id: string;
  name: string;
};

export class Faction
  extends Entity<EmptyObject, EmptyObject>
  implements Serializable<{ id: string; name: string }>
{
  constructor(
    id: string,
    public readonly name: string
  ) {
    super(id, {});
  }

  serialize(): { id: string; name: string } {
    return {
      id: this.id,
      name: this.name
    };
  }
}
