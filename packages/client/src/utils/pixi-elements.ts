import { Viewport, type IViewportOptions } from 'pixi-viewport';
import { patchProp, renderer } from 'vue3-pixi';
import { Layer } from '@pixi/layers';
import { OutlineFilter } from '@pixi/filter-outline';
import {
  AdjustmentFilter,
  type AdjustmentFilterOptions
} from '@pixi/filter-adjustment';

import ProjectionRenderer from 'vue3-pixi-projection';

renderer.use(ProjectionRenderer);

renderer.use({
  name: 'Viewport',
  createElement: props => new Viewport(props as IViewportOptions),
  patchProp(el, key, prevValue, nextValue) {
    return patchProp(el, key, prevValue, nextValue);
  }
});

renderer.use({
  name: 'Layer',
  createElement: props => new Layer(props.group),
  patchProp(el, key, prevValue, nextValue) {
    return patchProp(el, key, prevValue, nextValue);
  }
});

renderer.use({
  name: 'OutlineFilter',
  createElement: props => new OutlineFilter(props.thickness, props.color),
  patchProp(el, key, prevValue, nextValue) {
    return patchProp(el, key, prevValue, nextValue);
  }
});
interface OutlineFilterProps {
  thickness: number;
  color: number;
}
interface OutlineFilterComponent {
  (props: OutlineFilterProps): any;
}

renderer.use({
  name: 'AdjustmentFilter',
  createElement: props => new AdjustmentFilter(props as any),
  patchProp(el, key, prevValue, nextValue) {
    return patchProp(el, key, prevValue, nextValue);
  }
});
type AdjustmentFilterProps = Partial<AdjustmentFilterOptions>;
interface AdjustmentFilterComponent {
  (props: AdjustmentFilterProps): any;
}

declare module '@vue/runtime-core' {
  interface GlobalComponents {
    OutlineFilter: OutlineFilterComponent;
    AdustmentFilter: AdjustmentFilterComponent;
  }
}

// renderer.use({
//   name: 'PointLight',
//   createElement: props => {
//     return new PointLight(props.color, props.brightness, props.radius);
//   },
//   patchProp(el, key, prevValue, nextValue) {
//     patchProp(el, key, prevValue, nextValue);
//   }
// });

// renderer.use({
//   name: 'AmbientLight',
//   createElement: props => new AmbientLight(props.color, props.brightness),
//   patchProp(el, key, prevValue, nextValue) {
//     patchProp(el, key, prevValue, nextValue);
//   }
// });
