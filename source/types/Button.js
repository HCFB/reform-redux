import type { ComponentType } from 'react';

export type ComponentProps = {
  type: string,
  reactReduxContext: any,
  reformReduxContext: any,
  disabled: boolean,
  children: any,
  onClick?: Function,
  component?: ComponentType<*>,
};

export type ComponentState = {
  submitting: boolean,
};
