import { fileURLToPath, URL } from 'node:url';

import { defineConfig, Plugin, ResolvedConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import vueDevTools from 'vite-plugin-vue-devtools';
import autoImport from 'unplugin-auto-import/vite';
import vueRouter from 'unplugin-vue-router/vite';
import { VueRouterAutoImports } from 'unplugin-vue-router';
import unoCSS from 'unocss/vite';
import icons from 'unplugin-icons/vite';
import markdown, { Mode } from 'vite-plugin-markdown';
import { isCustomElement, transformAssetUrls } from 'vue3-pixi/compiler';
//@ts-expect-error no types for this package
import assetpackConfig from '@game/assetpack';

const customElements = [
  'viewport',
  'layer',
  'outline-filter',
  'adjustment-filter',
  'camera-3d',
  'container-2d',
  'container-3d',
  'mesh-2d',
  'mesh-3d-2d',
  'simple-mesh-2d',
  'simple-mesh-3d-2d',
  'sprite-2d',
  'sprite-2s',
  'sprite-3d',
  'text-2d',
  'text-2s',
  'text-3d'
];
const prefix = 'pixi-';

import { AssetPack } from '@assetpack/core';

function assetpackPlugin(): Plugin {
  const apConfig = assetpackConfig('./src/assets/', './public/assets/');

  let mode: ResolvedConfig['command'];
  let ap: AssetPack | undefined;

  return {
    name: 'vite-plugin-assetpack',
    configResolved(resolvedConfig) {
      mode = resolvedConfig.command;
    },
    buildStart: async () => {
      if (mode === 'serve') {
        if (ap) return;
        ap = new AssetPack(apConfig);
        void ap.watch();
      } else {
        await new AssetPack(apConfig).run();
      }
    },
    buildEnd: async () => {
      if (ap) {
        await ap.stop();
        ap = undefined;
      }
    }
  };
}

export default defineConfig({
  plugins: [
    vueRouter({
      extensions: ['.page.vue']
    }),
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      },
      template: {
        compilerOptions: {
          isCustomElement(name) {
            let normalizedName = name.replace(
              /[A-Z]/g,
              m => `-${m.toLowerCase()}`
            );
            if (normalizedName.startsWith('-'))
              normalizedName = normalizedName.slice(1);

            const isPixiElement = customElements.includes(normalizedName);
            const isPrefixElement =
              normalizedName.startsWith(prefix) &&
              customElements.includes(normalizedName.slice(prefix.length));

            return isCustomElement(name) || isPixiElement || isPrefixElement;
          }
        },
        transformAssetUrls
      }
    }),
    vueDevTools(),
    autoImport({
      imports: ['vue', VueRouterAutoImports],
      dts: true,
      eslintrc: {
        enabled: true
      }
    }),
    unoCSS(),
    icons({}),
    assetpackPlugin(),
    // @ts-expect-error
    markdown.default({
      mode: [Mode.VUE]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000
  }
});
