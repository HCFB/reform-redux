import { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { resetForm } from '../actions/Form';
import { filterReactDomProps } from '../utils/common';
import type { Element } from 'react';
import type { State } from '../types/formReducer';
import type { ReFormRedux } from '../types/Form';
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

    static contextTypes = {
      _reformRedux: PropTypes.object,
      store: PropTypes.object,
    };

    constructor(props: ComponentProps, context: ReFormRedux) {
      super(props, context);

      if (!context._reformRedux) {
        throw new Error('Component `Button` must be in `Form` component.');
      }
    }

    componentWillMount() {
      this.unsubscribeFromStore = this.context.store.subscribe(() => {
        const state: State = this.context.store.getState();
        const currentFormData: State = getIn(state, this.context._reformRedux.form.path);
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
      const { type, onClick } = this.props;
      const { store, _reformRedux } = this.context;

      if (type === 'reset') store.dispatch(resetForm(_reformRedux.form.name));

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

  return Button;
};
