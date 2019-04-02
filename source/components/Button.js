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
  const { getIn, is }: DataFunctions = dataFunctions;

  /**
   * submit | reset
   * @typedef {string} ButtonType
   */

  /**
   * @class ButtonComponent
   * @param {boolean} isLoading When form submitting
   */

  /**
   * If you need to disable your submit button when form is submitting or reset form use this component.
   *
   * @class Button
   * @example
   * import { Field, Form, Button } from 'reform-redux';
   *
   * const FormWrapper = () => (
   *  <Form path="path.to.form">
   *    <Field name="test" component="input" />
   *    <Button type="submit">submit</Button>
   *  </Form>
   * );
   *
   * @param {ButtonType} type Button type.
   * @param {ButtonComponent} [component] Component.
   * @param {Function} [onClick] onClick handler.
   */
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

    shouldComponentUpdate(
      {
        reformReduxContext: nextReformReduxContext, // eslint-disable-line no-unused-vars
        reactReduxContext: nextReactReduxContext, // eslint-disable-line no-unused-vars
        children: nextChildren, // eslint-disable-line no-unused-vars
        ...nextProps
      },
      nextState,
    ) {
      // eslint-disable-next-line no-unused-vars
      const {
        reformReduxContext: currentReformReduxContext, // eslint-disable-line no-unused-vars
        reactReduxContext: currentReactReduxContext, // eslint-disable-line no-unused-vars
        children: currentChildren, // eslint-disable-line no-unused-vars
        ...currentProps
      } = this.props;
      return !is(currentProps, nextProps) || !is(this.state, nextState);
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

    render(): Element<*> {
      const component = this.props.component || 'button';
      const commonProps = {
        disabled: this.props.disabled !== undefined ? this.props.disabled : this.state.submitting,
        onClick: this.onClickHandler,
        children: this.props.children,
      };
      const componentProps =
        typeof component === 'string'
          ? {
              ...filterReactDomProps(this.props),
              ...commonProps,
            }
          : {
              ...this.props,
              ...commonProps,
              isLoading: this.state.submitting,
            };

      return createElement(component, componentProps);
    }
  }

  return forwardRef((props, ref) =>
    createElement(ReactReduxContext.Consumer, {}, reactReduxContextValue =>
      createElement(ReformReduxContext.Consumer, {}, reformReduxContextValue =>
        createElement(Button, {
          ...props,
          reactReduxContext: reactReduxContextValue,
          reformReduxContext: reformReduxContextValue,
          ref,
        }),
      ),
    ),
  );
};
