/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by unplugin-vue-router. ‼️ DO NOT MODIFY THIS FILE ‼️
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

declare module 'vue-router/auto-routes' {
  import type {
    RouteRecordInfo,
    ParamValue,
    ParamValueOneOrMore,
    ParamValueZeroOrMore,
    ParamValueZeroOrOne,
  } from 'vue-router'

  /**
   * Route name map generated by unplugin-vue-router
   */
  export interface RouteNamedMap {
    '/': RouteRecordInfo<'/', '/', Record<never, never>, Record<never, never>>,
    '/[...404]': RouteRecordInfo<'/[...404]', '/:404(.*)', { 404: ParamValue<true> }, { 404: ParamValue<false> }>,
    '/chat': RouteRecordInfo<'/chat', '/chat', Record<never, never>, Record<never, never>>,
    '/drive/': RouteRecordInfo<'/drive/', '/drive', Record<never, never>, Record<never, never>>,
    '/login': RouteRecordInfo<'/login', '/login', Record<never, never>, Record<never, never>>,
    '/signup': RouteRecordInfo<'/signup', '/signup', Record<never, never>, Record<never, never>>,
    '/todo/board': RouteRecordInfo<'/todo/board', '/todo/board', Record<never, never>, Record<never, never>>,
    '/todo/calendar': RouteRecordInfo<'/todo/calendar', '/todo/calendar', Record<never, never>, Record<never, never>>,
    '/todo/list': RouteRecordInfo<'/todo/list', '/todo/list', Record<never, never>, Record<never, never>>,
    '/todo/table/': RouteRecordInfo<'/todo/table/', '/todo/table', Record<never, never>, Record<never, never>>,
    '/todo/table/[todo_id]': RouteRecordInfo<'/todo/table/[todo_id]', '/todo/table/:todo_id', { todo_id: ParamValue<true> }, { todo_id: ParamValue<false> }>,
    '/todo/table/add': RouteRecordInfo<'/todo/table/add', '/todo/table/add', Record<never, never>, Record<never, never>>,
  }
}
