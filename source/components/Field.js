import {
  createElement,
  forwardRef,
  useContext,
  memo,
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useStore } from 'react-redux';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import { ReformReduxContext } from './Form';
import { getValidateFunctionsArray, validateField } from '../utils/Field';
import { filterReactDomProps } from '../utils/common';
import { usePrevious } from '../hooks/usePrevious';

/**
 * @typedef {string} FieldName
 */

/**
 * @typedef {object} FieldData
 * @property {object} FieldData
 * @property {*} FieldData.value
 * @property {boolean} FieldData.changed
 * @property {string[]} FieldData.errors
 * @property {boolean} FieldData.valid
 * @property {boolean} FieldData.touched
 * @property {boolean} FieldData.disabled
 */

/**
 * @typedef {object.<FieldName, FieldData>} FieldsData
 */

/**
 * @callback Validate
 * @param {*} value
 * @returns {undefined|string} error or nothing
 */

/**
 * @typedef {(Validate|Validate[])} ValidateFunctions
 * @param {FieldsData} fields
 * @param {Event} event
 */

/**
 * onChange | onBlur | onFocus | onInit
 * @typedef {string} NormalizeWhen
 */

/**
 * @callback Normalize
 * @param {*} value
 * @param {*} previousValue
 * @param {FieldsData} allFields
 * @param {NormalizeWhen} when
 * @param {FieldName} name
 * @returns {*} normalized value
 */

/**
 * @callback OnEvent
 * @param {event} event
 * @param {FieldData} fieldData
 */

/**
 * @callback OnChange
 * @param {*} data
 * @param {*} value
 */

/**
 * @callback FieldOnChange
 * @param {*} data
 * @param {string} [normalizeWhen=onChange]
 * @returns {*} new value
 */

/**
 * @class FieldComponent
 * @param {FieldOnChange} onChange Execute this function when you need to change value in the store.
 * @param {OnEvent} onBlur This function will trigger function or functions which validate your field.
 * @param {OnEvent} onFocus This function will trigger normalize function.
 * @param {*} value Field value.
 * @param {boolean} disabled Field disabled or not.
 * @param {boolean} changed Field changed or not.
 * @param {string} formName Form name.
 * @param {boolean} touched Field touched or not.
 * @param {boolean} checked This prop will avaible in the component if your component is checkbox or radio button.
 * @param {string[]} errors Array of errors.
 */

const useFieldState = (contexts, props) => {
  let initialFieldData = useRef({});
  useMemo(
    () => {
      const { reformReduxContext, reactReduxStore } = contexts;
      const formPath = reformReduxContext.form.path;

      if (
        props.multiple &&
        props.component === 'select' &&
        props.value &&
        !Array.isArray(props.value)
      ) {
        throw new Error(
          'The `value` prop supplied to Field with type "select" must be an array if `multiple` is true.',
        );
      }

      // Normalize value on component onInit

      let value = props.value || '';

      if (props.normalize) {
        const { normalize } = props;
        value = normalize(props.value, '', {}, 'onInit', props.name);
      }

      if (['radio', 'checkbox'].indexOf(props.type) > -1) {
        value = props.value || props.checked || false;
      }

      initialFieldData.current = {
        value,
        errors: [],
        hidden: props.hidden,
        valid: true,
        touched: props.touched || false,
        changed: props.changed || false,
        disabled: props.disabled || false,
      };

      if (['radio', 'checkbox'].indexOf(props.type) > -1 && !props.checked) {
        initialFieldData.current.value = props.value ? '' : false;
      }

      if (reformReduxContext.field.getFieldCount(props.name) === 0) {
        // Get default value from store if it exists

        const state = reactReduxStore.getState();
        const currentFormData = get(state, formPath);
        const initialFieldDataFromStore = get(currentFormData, ['fields', props.name]);

        if (initialFieldDataFromStore) {
          initialFieldData.current = initialFieldDataFromStore;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // field state
  const [fieldState, setFieldState] = useState(initialFieldData.current);
  return { fieldState, setFieldState };
};

const useContexts = () => {
  const reactReduxStore = useStore();
  const reformReduxContext = useContext(ReformReduxContext);

  if (!reformReduxContext) {
    throw new Error('Component `Field` must be in `Form` component.');
  }

  return { reactReduxStore, reformReduxContext };
};

const useHandlers = (contexts, { fieldState, setFieldState }, props) => {
  const { reformReduxContext, reactReduxStore } = contexts;
  const formPath = reformReduxContext.form.path;
  const unsubscribeFromStore = useRef(null);
  const fieldStateRef = useRef(fieldState);

  // magic for react state https://overreacted.io/making-setinterval-declarative-with-react-hooks/
  useEffect(
    () => {
      fieldStateRef.current = fieldState;
    },
    [fieldState],
  );

  const registerField = useCallback(
    () => {
      unsubscribeFromStore.current = reactReduxStore.subscribe(() => {
        const state = reactReduxStore.getState();
        const nextFieldData = get(
          state,
          [...formPath, 'fields', props.name],
          fieldStateRef.current,
        );

        if (!isEqual(get(fieldStateRef.current, ['value']), get(nextFieldData, ['value']))) {
          reformReduxContext._core.updateStackFieldValue(props.name, get(nextFieldData, ['value']));
        }

        if (!isEqual(fieldStateRef.current, nextFieldData)) {
          setFieldState({ ...nextFieldData });
        }
      });

      // Register

      const initialFieldData = { ...fieldStateRef.current };
      const { type, checked, multiple, component } = props;

      const validate = getValidateFunctionsArray(props.validate);

      reformReduxContext.form.registerField(props.name, initialFieldData, validate, {
        type,
        checked,
        multiple,
        component,
      });
    },
    [
      formPath,
      props,
      reactReduxStore,
      reformReduxContext._core,
      reformReduxContext.form,
      setFieldState,
    ],
  );

  const setFieldErrors = useCallback(
    errors => {
      if (!isEqual(get(fieldState, ['errors']), errors)) {
        reformReduxContext.field.setFieldErrors(props.name, errors);
      }
    },
    [fieldState, props.name, reformReduxContext.field],
  );

  const changeFieldValue = useCallback(
    value => {
      (async () => {
        reformReduxContext.field.changeFieldValue(props.name, value);

        if (get(fieldState, ['touched']) && props.validate) {
          const validate = getValidateFunctionsArray(props.validate);

          const errors = await validateField(value, validate);

          setFieldErrors(errors);
        }
      })();
    },
    [fieldState, props.name, props.validate, reformReduxContext.field, setFieldErrors],
  );

  const isCheckbox = useCallback(
    () => {
      const { type } = props;
      return type && type === 'checkbox';
    },
    [props],
  );

  const isRadio = useCallback(
    () => {
      const { type } = props;
      return type && type === 'radio';
    },
    [props],
  );

  const isRadioOrCheckbox = useCallback(
    () => {
      return isRadio() || isCheckbox();
    },
    [isCheckbox, isRadio],
  );

  const getFieldValue = useCallback(
    data => {
      const isEvent = data && data.nativeEvent && data.nativeEvent instanceof Event;

      if (isRadio()) {
        const checked = isEvent ? data.target.checked : data;
        return checked ? props.value || checked : '';
      }

      if (isCheckbox()) {
        const checked = isEvent ? data.target.checked : data;
        if (reformReduxContext.field.getFieldCount(props.name) > 1) {
          return checked
            ? [...get(fieldState, ['value']), props.value]
            : get(fieldState, ['value']).filter(value => value !== props.value);
        }

        return checked ? props.value || checked : '';
      }

      if (props.component === 'select' && props.multiple) {
        const selectedOptions = isEvent ? data.target.selectedOptions : data;
        return [].slice.call(selectedOptions).map(option => {
          return option.value;
        });
      }

      return isEvent ? data.target.value : data;
    },
    [
      fieldState,
      isCheckbox,
      isRadio,
      props.component,
      props.multiple,
      props.name,
      props.value,
      reformReduxContext.field,
    ],
  );

  const changeFieldValueHandler = useCallback(
    (data, normalizeWhen = 'onChange') => {
      let value = getFieldValue(data);
      const { normalize, name } = props;

      if (normalize) {
        const state = reactReduxStore.getState();
        const currentFormData = get(state, formPath);
        const fields = get(currentFormData, ['fields']);

        value = normalize(value, get(fieldState, ['value']), fields, normalizeWhen, name);
      }

      changeFieldValue(value);

      if (props.onChange) {
        const { onChange } = props;
        onChange(data, value, get(fieldState, ['value']));
      }
    },
    [changeFieldValue, fieldState, formPath, getFieldValue, props, reactReduxStore],
  );

  const onBlurFieldHandler = useCallback(
    async event => {
      if (props.onBlur) {
        const fieldData = fieldState;
        props.onBlur(event, fieldData);
      }

      const fieldValue = getFieldValue(event);

      if (props.normalize) {
        changeFieldValueHandler(event, 'onBlur');
      }

      // If the field was touched don't validate him.

      if (get(fieldState, ['touched'])) return;
      reformReduxContext.field.setFieldTouched(props.name, true);

      if (props.validate) {
        const validate = getValidateFunctionsArray(props.validate);

        const errors = await validateField(fieldValue, validate);
        setFieldErrors(errors);
      }
    },
    [
      changeFieldValueHandler,
      fieldState,
      getFieldValue,
      props,
      reformReduxContext.field,
      setFieldErrors,
    ],
  );

  const onFocusFieldHandler = useCallback(
    event => {
      if (props.normalize) {
        changeFieldValueHandler(get(fieldState, ['value']), 'onFocus');
      }

      if (props.onFocus) {
        const fieldData = fieldState;
        props.onFocus(event, fieldData);
      }
    },
    [changeFieldValueHandler, fieldState, props],
  );

  return {
    unsubscribeFromStore: unsubscribeFromStore.current,
    registerField,
    setFieldErrors,
    changeFieldValue,
    getFieldValue,
    changeFieldValueHandler,
    onBlurFieldHandler,
    onFocusFieldHandler,
    isRadioOrCheckbox,
    isCheckbox,
    isRadio,
  };
};

const useRegistration = (
  { reformReduxContext },
  { registerField, unsubscribeFromStore },
  props,
) => {
  // register and unrefister field
  useEffect(() => {
    registerField();

    return () => {
      unsubscribeFromStore?.();
      reformReduxContext.form.unregisterField(props.name, props.removeOnUnmount);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const useDataUpdater = (contexts, { changeFieldValue, getFieldValue }, { fieldState }, props) => {
  const { reformReduxContext } = contexts;

  const prevProps = usePrevious(props);

  useEffect(
    () => {
      if (prevProps) {
        // Update touched property
        if (props.touched !== prevProps.touched) {
          reformReduxContext.field.setFieldTouched(props.name, props.touched);
        }

        // Update changed property
        if (props.changed !== prevProps.changed) {
          reformReduxContext.field.setFieldChanged(props.name, props.changed);
        }

        if (
          ['radio', 'checkbox'].indexOf(props.type) !== -1 &&
          reformReduxContext.field.getFieldCount(props.name) > 1 &&
          props.checked !== prevProps.checked
        ) {
          // Dont change field value if it's was changed (checkboxes)
          if (
            props.checked &&
            props.type === 'checkbox' &&
            get(fieldState, ['value']).indexOf(props.value) > -1
          ) {
            return;
          }

          // Dont change field value if it's was changed (radio)
          if (
            props.checked &&
            props.type === 'radio' &&
            isEqual(get(fieldState, ['value']), props.value)
          ) {
            return;
          }

          return changeFieldValue(getFieldValue(props.checked));
        }

        // Update value only for single fields
        if (reformReduxContext.field.getFieldCount(props.name) > 1) {
          return;
        }

        if (props.value !== undefined && !isEqual(props.value, prevProps.value)) {
          return changeFieldValue(props.value);
        }

        if (
          ['radio', 'checkbox'].indexOf(props.type) !== -1 &&
          props.checked !== prevProps.checked
        ) {
          return changeFieldValue(props.checked ? props.value || props.checked : '');
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      changeFieldValue,
      fieldState,
      getFieldValue,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      prevProps?.changed,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      prevProps?.checked,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      prevProps?.touched,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      prevProps?.value,
      props.changed,
      props.checked,
      props.name,
      props.touched,
      props.type,
      props.value,
      reformReduxContext.field,
    ],
  );
};

/**
 * The Field component creates new field in store and provide all data of this field to your component.
 *
 * @class Field
 * @example
 * import { Field, Form } from 'reform-redux';
 *
 * const FormWrapper = () => (
 *  <Form path="path.to.form">
 *    <Field name="test" component="input" />
 *  </Form>
 * );
 *
 * @param {string} name Name of your field. This name will appear in fields object in redux store.
 * @param {FieldComponent} component Function or Class or String which be passed to React.createElement.
 * @param {ValidateFunctions} [validate] Validate functions.
 * @param {boolean} [disabled] Field disabled or not.
 * @param {boolean} [hidden] Field hidden or not.
 * @param {boolean} [changed] Field changed or not.
 * @param {boolean} [touched] Field touched or not.
 * @param {*} [value] Value of your field.
 * @param {Normalize} [normalize] Normalize value function. If you normalize your data on onInit then allFields will empty object.
 * @param {OnEvent} [onFocus] onFocus handler.
 * @param {OnEvent} [onBlur] onBlur handler.
 * @param {OnChange} [onChange] onChange handler.
 * @param {boolean} [checked] Checked or not your radio button or checkbox.
 * @param {boolean} [removeOnUnmount] Remove field data from store on unmount
 */
const Field = props => {
  const { reactReduxStore, reformReduxContext } = useContexts();
  const { fieldState, setFieldState } = useFieldState(
    { reactReduxStore, reformReduxContext },
    props,
  );
  const {
    unsubscribeFromStore,
    registerField,
    changeFieldValue,
    getFieldValue,
    changeFieldValueHandler,
    onBlurFieldHandler,
    onFocusFieldHandler,
    isRadioOrCheckbox,
    isCheckbox,
  } = useHandlers({ reactReduxStore, reformReduxContext }, { fieldState, setFieldState }, props);

  useRegistration(
    { reactReduxStore, reformReduxContext },
    { registerField, unsubscribeFromStore },
    props,
  );

  useDataUpdater(
    { reactReduxStore, reformReduxContext },
    {
      changeFieldValue,
      getFieldValue,
    },
    { fieldState },
    props,
  );

  // render

  const {
    normalize, // eslint-disable-line no-unused-vars
    component,
    name, // eslint-disable-line no-unused-vars
    validate, // eslint-disable-line no-unused-vars
    disabled, // eslint-disable-line no-unused-vars
    innerRef,
    ...restProps
  } = props;
  let fieldProps = {
    ...restProps,
    onChange: changeFieldValueHandler,
    onBlur: onBlurFieldHandler,
    onFocus: onFocusFieldHandler,
    hidden: get(fieldState, ['hidden']),
    value: get(fieldState, ['value']),
    disabled: get(fieldState, ['disabled']),
  };

  const fieldValue = get(fieldState, ['value']);
  const fieldHidden = get(fieldState, ['hidden']);

  if (isRadioOrCheckbox()) {
    fieldProps = {
      ...fieldProps,
      checked: restProps.value ? isEqual(restProps.value, fieldValue) : fieldValue,
      value: restProps.value,
    };
  }

  if (isCheckbox() && Array.isArray(fieldValue)) {
    fieldProps = {
      ...fieldProps,
      checked: fieldValue.indexOf(restProps.value) > -1,
    };
  }

  if (typeof component !== 'string') {
    fieldProps = {
      ...fieldProps,
      ref: innerRef,
      formName: props.reformReduxContextFormName,
      errors: get(fieldState, ['errors']),
      changed: get(fieldState, ['changed']),
      touched: get(fieldState, ['touched']),
    };
  } else {
    fieldProps = {
      ...filterReactDomProps(fieldProps),
      ref: innerRef,
      value: fieldValue,
    };
  }

  if (component === 'select' && restProps.multiple && !fieldValue) {
    fieldProps = {
      ...fieldProps,
      value: [],
    };
  }

  return !fieldHidden && createElement(props.component, fieldProps);
};

Field.propTypes = {
  name: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]).isRequired,
  normalize: PropTypes.func,
  type: PropTypes.string,
  multiple: PropTypes.bool,
  checked: PropTypes.bool,
  value: PropTypes.any,
  validate: PropTypes.func,
  disabled: PropTypes.bool,
  changed: PropTypes.bool,
  touched: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  removeOnUnmount: PropTypes.bool,
  hidden: PropTypes.bool,
};

Field.defaultProps = {
  value: '',
  hidden: false,
  disabled: false,
};

export default memo(forwardRef((props, ref) => createElement(Field, { ...props, innerRef: ref })));
