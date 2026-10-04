import { createContext, Dispatch, SetStateAction } from 'react';

import { OperatorSafe } from '~/middleware/auth';

type AuthPlugin = {
  operator: OperatorSafe;
  setOperator: Dispatch<SetStateAction<OperatorSafe>>;
};

export const AuthContext = createContext<AuthPlugin | null>(null);
