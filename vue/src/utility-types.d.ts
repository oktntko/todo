/* eslint-disable @typescript-eslint/no-explicit-any */
import { AllowedComponentProps, Component, VNodeProps } from 'vue';

type ComponentProps<C extends Component> = C extends new (...args: any) => any
  ? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
  : never;
