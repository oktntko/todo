import { defineConfig } from "vitest/config";
import path from "path";
import { VitePluginNode } from "vite-plugin-node";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "@": path.resolve(__dirname, "tests"),
    },
  },
  test: {
    environment: "node",
  },
  plugins: [
    ...VitePluginNode({
      // Nodejs native Request adapter
      // currently this plugin support 'express', 'nest', 'koa' and 'fastify' out of box,
      // you can also pass a function if you are using other frameworks, see Custom Adapter section
      adapter: "express",

      // tell the plugin where is your project entry
      appPath: "./src/app.ts",

      // Optional, default: 'viteNodeApp'
      // the name of named export of you app from the appPath file
      exportName: "viteNodeApp",

      // Optional, default: 'esbuild'
      // The TypeScript compiler you want to use
      // by default this plugin is using vite default ts compiler which is esbuild
      // 'swc' compiler is supported to use as well for frameworks
      // like Nestjs (esbuild dont support 'emitDecoratorMetadata' yet)
      // you need to INSTALL `@swc/core` as dev dependency if you want to use swc
      tsCompiler: "swc",

      // Optional, default: {
      // jsc: {
      //   target: 'es2019',
      //   parser: {
      //     syntax: 'typescript',
      //     decorators: true
      //   },
      //  transform: {
      //     legacyDecorator: true,
      //     decoratorMetadata: true
      //   }
      // }
      //}
      // swc configs, see [swc doc](https://swc.rs/docs/configuration/swcrc)
      swcOptions: {},
    }),
  ],
});
