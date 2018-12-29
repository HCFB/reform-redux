import { ReactReduxContext } from 'react-redux';
import { Component, createElement, forwardRef } from 'react';
import { resetForm } from '../actions/Form';
import { filterReactDomProps } from '../utils/common';
import { ReformReduxContext } from './Form';
import type { Element } from 'react';
import type { State } from '../types/formReducer';
import type { ComponentProps, ComponentState } from '../types/Button';
import type { DataFunctions } from '../types/dataFunctions';
import type { ComponentCreator } from '../types/common';

export const createButtonComponent: ComponentCreator = (dataFunctions: DataFunctions) => {
  const { getIn }: DataFunctions = dataFunctions;

  class Button extends Component<ComponentProps, ComponentState> {
    unsubscribeFromStore: Function = () => {};

    state = {
      submitting: false,
    };

    constructor(props: ComponentProps) {
      super(props);

      if (!props.reformReduxContext) {
        throw new Error('Component `Button` must be in `Form` component.');
      }

      this.unsubscribeFromStore = props.reactReduxContext.store.subscribe(() => {
        const state: State = props.reactReduxContext.store.getState();
        const currentFormData: State = getIn(state, props.reformReduxContext.form.path);
        const formSubmitting: boolean = getIn(currentFormData, ['submitting']);

        if (this.state.submitting !== formSubmitting) {
          this.setState({
            submitting: formSubmitting,
          });
        }
      });
    }

    componentWillUnmount() {
      this.unsubscribeFromStore();
    }

    onClickHandler = (event: Event) => {
      const { type, onClick, reactReduxContext, reformReduxContext } = this.props;

      if (type === 'reset')
        reactReduxContext.store.dispatch(resetForm(reformReduxContext.form.name));

      if (onClick) onClick(event);
    };

    render(): Element<'button'> {
      return createElement('button', {
        ...filterReactDomProps(this.props),
        disabled: this.props.disabled || this.state.submitting,
        onClick: this.onClickHandler,
        children: this.props.children,
      });
    }
  }

  return forwardRef((props, ref) =>
    createElement(ReactReduxContext.Consumer, {}, reactReduxContextValue =>
      createElement(ReformReduxContext.Consumer, {}, reformReduxContextValue =>
        createElement(Button, {
          ...props,
          reactReduxContext: reactReduxContextValue,
          reformReduxContext: reformReduxContextValue,
          innerRef: ref,
        }),
      ),
    ),
  );
};
