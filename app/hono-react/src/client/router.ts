// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/signin`
  | `/signup`
  | `/space`
  | `/space/:space_id`
  | `/space/:space_id/list`

export type Params = {
  '/space/:space_id': { space_id: string }
  '/space/:space_id/list': { space_id: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
