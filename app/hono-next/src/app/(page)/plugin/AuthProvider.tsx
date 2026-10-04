'use client';

import { useState } from 'react';

import { OperatorSafe } from '~/middleware/auth';

import { AuthContext } from './AuthContext';

type Props = {
  children: React.ReactNode;
  operator: OperatorSafe;
};

export function AuthProvider({ children, operator: _operator }: Props) {
  const [operator, setOperator] = useState(_operator);

  return <AuthContext.Provider value={{ operator, setOperator }}>{children}</AuthContext.Provider>;
}
