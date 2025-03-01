import { keyBy } from 'lodash-es';
import { map1v1 } from './1v1.map';
import type { IndexedRecord } from '@game/shared';
import type { MapBlueprint } from '../map-blueprint';

export const MAPS_DICTIONARY: IndexedRecord<MapBlueprint, 'id'> = keyBy([map1v1], 'id');
