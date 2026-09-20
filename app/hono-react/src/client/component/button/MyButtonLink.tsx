import { createLink } from '@tanstack/react-router';
import React from 'react';

import { MyButton, type WrapperMyButtonProps } from './MyButton';

export const MyButtonLink = createLink(
  React.forwardRef<HTMLAnchorElement, WrapperMyButtonProps<'a'>>((props, ref) => {
    return <MyButton tag="a" ref={ref} {...props} />;
  }),
);
