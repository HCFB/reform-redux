import { ReactReduxContext } from 'react-redux';
import get from 'lodash/get';
import {
  createElement,
  forwardRef,
  useEffect,
  useState,
  useContext,
  useCallback,
  memo,
  useRef,
} from 'react';
import { resetForm } from '../actions/Form';
import { filterReactDomProps } from '../utils/common';
import { ReformReduxContext } from './Form';

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
const Button = props => {
  const { type, onClick, component, disabled, children, innerRef } = props;
  const reactReduxContext = useContext(ReactReduxContext);
  const reformReduxContext = useContext(ReformReduxContext);
  const [submitting, setSubmitting] = useState(false);

  const submittingStateRef = useRef(submitting);

  // magic for react state https://overreacted.io/making-setinterval-declarative-with-react-hooks/
  useEffect(
    () => {
      submittingStateRef.current = submitting;
    },
    [submitting],
  );

  useEffect(() => {
    if (!reformReduxContext) {
      throw new Error('Component `Button` must be in `Form` component.');
    }

    const unsubscribe = reactReduxContext.store.subscribe(() => {
      const state = reactReduxContext.store.getState();
      const currentFormData = get(state, reformReduxContext.form.path);
      const formSubmitting = get(currentFormData, ['submitting']);

      if (submittingStateRef.current !== formSubmitting) {
        setSubmitting(formSubmitting);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickHandler = useCallback(event => {
    if (type === 'reset') reactReduxContext.store.dispatch(resetForm(reformReduxContext.form.name));

    if (onClick) onClick(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customComponent = component || 'button';
  const commonProps = {
    disabled: disabled !== undefined ? disabled : submitting,
    onClick: onClickHandler,
    children,
    ref: innerRef,
  };

  const componentProps =
    typeof customComponent === 'string'
      ? {
          ...filterReactDomProps(props),
          ...commonProps,
        }
      : {
          ...props,
          ...commonProps,
          isLoading: submitting,
        };

  return createElement(customComponent, componentProps);
};

export default memo(forwardRef((props, ref) => createElement(Button, { ...props, innerRef: ref })));
