// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/mypage`
  | `/mypage/account`
  | `/mypage/change-password`
  | `/mypage/notification`
  | `/mypage/security`
  | `/signin`
  | `/signup`
  | `/space`
  | `/space/:space_id`
  | `/space/:space_id/list`
  | `/space/:space_id/table`
  | `/space/:space_id/table/:todo_id`
  | `/space/:space_id/table/add`

export type Params = {
  '/space/:space_id': { space_id: string }
  '/space/:space_id/list': { space_id: string }
  '/space/:space_id/table': { space_id: string }
  '/space/:space_id/table/:todo_id': { space_id: string; todo_id: string }
  '/space/:space_id/table/add': { space_id: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
