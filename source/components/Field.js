import { PureComponent, createElement, forwardRef } from 'react';
import { ReactReduxContext } from 'react-redux';
import PropTypes from 'prop-types';
import { ReformReduxContext } from './Form';
import { getValidateFunctionsArray, validateField } from '../utils/Field';
import { filterReactDomProps } from '../utils/common';
import type { FieldData, FieldsData, ComponentProps, ComponentState } from '../types/Field';
import type { State } from '../types/formReducer';
import type { DataFunctions } from '../types/dataFunctions';
import type { ComponentCreator } from '../types/common';

export const createFieldComponent: ComponentCreator = (dataFunctions: DataFunctions) => {
  const {
    getIn,
    map,
    list,
    setIn,
    is,
    isList,
    listIncludes,
    isImmutable,
    toJS,
  }: DataFunctions = dataFunctions;

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
  class Field extends PureComponent<ComponentProps, ComponentState> {
    initialFieldData: FieldData;
    unsubscribeFromStore: Function = () => {};
    formPath: Array<string>;

    static propTypes = {
      name: PropTypes.string.isRequired,
      component: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func])
        .isRequired,
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

    static defaultProps: {
      disabled: $PropertyType<ComponentProps, 'disabled'>,
      value: $PropertyType<ComponentProps, 'value'>,
      hidden: $PropertyType<ComponentProps, 'hidden'>,
    } = {
      value: '',
      hidden: false,
      disabled: false,
    };

    constructor(props: ComponentProps) {
      super(props);

      this.formPath = props.reformReduxContextFormPath.split('.');

      if (props.multiple && props.component === 'select' && props.value && !isList(props.value)) {
        throw new Error(
          'The `value` prop supplied to Field with type "select" must be an array if `multiple` is true.',
        );
      }

      // Normalize value on component onInit

      let value = props.value || '';

      if (props.normalize) {
        const { normalize } = props;
        value = normalize(props.value, '', map({}), 'onInit', props.name);
      }

      if (['radio', 'checkbox'].indexOf(props.type) > -1) {
        value = props.value || props.checked || false;
      }

      this.initialFieldData = map({
        value,
        errors: list([]),
        hidden: props.hidden,
        valid: true,
        touched: props.touched || false,
        changed: props.changed || false,
        disabled: props.disabled || false,
      });

      if (['radio', 'checkbox'].indexOf(props.type) > -1 && !props.checked) {
        this.initialFieldData = setIn(this.initialFieldData, ['value'], props.value ? '' : false);
      }

      if (props.reformReduxContextGetFieldCount(this.props.name) === 0) {
        // Get default value from store if it exists

        const state: State = props.reactReduxContextGetState();
        const currentFormData: State = getIn(state, this.formPath);
        const initialFieldData: FieldData = getIn(currentFormData, ['fields', props.name]);

        if (initialFieldData) {
          this.initialFieldData = initialFieldData;
        }
      }

      // Write initial data to store
      this.state = {
        field: map(this.initialFieldData),
      };
    }

    componentDidMount() {
      this.registerField();
    }

    registerField = () => {
      this.unsubscribeFromStore = this.props.reactReduxContextSubscribe(() => {
        const state: State = this.props.reactReduxContextGetState();
        const currentFieldData: FieldData = this.state.field;
        const nextFieldData: FieldData = getIn(
          state,
          [...this.formPath, 'fields', this.props.name],
          this.state.field,
        );

        if (!is(getIn(currentFieldData, ['value']), getIn(nextFieldData, ['value']))) {
          this.props.reformReduxContextCoreUpdateStackFieldValue(
            this.props.name,
            getIn(nextFieldData, ['value']),
          );
        }

        if (!is(currentFieldData, nextFieldData)) {
          this.setState({
            field: map(nextFieldData),
          });
        }
      });

      // Register

      const initialFieldData = map(this.initialFieldData);
      const { type, checked, multiple, component } = this.props;

      const validate: Array<Function> = getValidateFunctionsArray(dataFunctions)(
        this.props.validate,
      );

      this.props.reformReduxContextFormRegisterField(this.props.name, initialFieldData, validate, {
        type,
        checked,
        multiple,
        component,
      });
    };

    componentWillUnmount() {
      this.unsubscribeFromStore();
      this.props.reformReduxContextFormUnregisterField(this.props.name, this.props.removeOnUnmount);
    }

    componentDidUpdate(prevProps: ComponentProps) {
      // Update touched property
      if (this.props.touched !== prevProps.touched) {
        this.props.reformReduxContextSetFieldTouched(this.props.name, this.props.touched);
      }

      // Update changed property
      if (this.props.changed !== prevProps.changed) {
        this.props.reformReduxContextSetFieldChanged(this.props.name, this.props.changed);
      }

      if (
        ['radio', 'checkbox'].indexOf(this.props.type) !== -1 &&
        this.props.reformReduxContextGetFieldCount(this.props.name) > 1 &&
        this.props.checked !== prevProps.checked
      ) {
        // Dont change field value if it's was changed (checkboxes)
        if (
          this.props.checked &&
          this.props.type === 'checkbox' &&
          listIncludes(getIn(this.state.field, ['value']), this.props.value)
        ) {
          return;
        }

        // Dont change field value if it's was changed (radio)
        if (
          this.props.checked &&
          this.props.type === 'radio' &&
          is(getIn(this.state.field, ['value']), this.props.value)
        ) {
          return;
        }

        return this.changeFieldValue(this.getFieldValue(this.props.checked));
      }

      // Update value only for single fields
      if (this.props.reformReduxContextGetFieldCount(this.props.name) > 1) {
        return;
      }

      if (this.props.value !== undefined && !is(this.props.value, prevProps.value)) {
        return this.changeFieldValue(this.props.value);
      }

      if (
        ['radio', 'checkbox'].indexOf(this.props.type) !== -1 &&
        this.props.checked !== prevProps.checked
      ) {
        return this.changeFieldValue(
          this.props.checked ? this.props.value || this.props.checked : '',
        );
      }
    }

    setFieldErrors = (errors: Array<string>) => {
      if (!is(getIn(this.state.field, ['errors']), errors)) {
        this.props.reformReduxContextSetFieldErrors(this.props.name, errors);
      }
    };

    changeFieldValue = async (value: any) => {
      this.props.reformReduxContextChangeFieldValue(this.props.name, value);

      if (getIn(this.state.field, ['touched']) && this.props.validate) {
        const validate: Array<Function> = getValidateFunctionsArray(dataFunctions)(
          this.props.validate,
        );

        const errors: Array<string> = await validateField(value, validate, dataFunctions);

        this.setFieldErrors(errors);
      }
    };

    getFieldValue = (data: any): any => {
      const isEvent = data && data.nativeEvent && data.nativeEvent instanceof Event;

      if (this.isRadio()) {
        const checked = isEvent ? data.target.checked : data;
        return checked ? this.props.value || checked : '';
      }

      if (this.isCheckbox()) {
        const checked = isEvent ? data.target.checked : data;
        if (this.props.reformReduxContextGetFieldCount(this.props.name) > 1) {
          return list(
            checked
              ? [...toJS(getIn(this.state.field, ['value'])), toJS(this.props.value)]
              : toJS(getIn(this.state.field, ['value'])).filter(
                  value => value !== this.props.value,
                ),
          );
        }

        return checked ? this.props.value || checked : '';
      }

      if (this.props.component === 'select' && this.props.multiple) {
        const selectedOptions = isEvent ? data.target.selectedOptions : data;
        return list(
          [].slice.call(selectedOptions).map(option => {
            return option.value;
          }),
        );
      }

      return isEvent ? data.target.value : data;
    };

    changeFieldValueHandler = (data: any, normalizeWhen: string = 'onChange') => {
      let value: any = this.getFieldValue(data);
      const { normalize, name } = this.props;

      if (normalize) {
        const state: State = this.props.reactReduxContextGetState();
        const currentFormData: State = getIn(state, this.formPath);
        const fields: FieldsData = getIn(currentFormData, ['fields']);

        value = normalize(
          value,
          getIn(this.state.field, ['value']),
          map(fields),
          normalizeWhen,
          name,
        );
      }

      this.changeFieldValue(value);

      if (this.props.onChange) {
        const { onChange } = this.props;
        onChange(data, value, getIn(this.state.field, ['value']));
      }
    };

    onBlurFieldHandler = async (event: Event) => {
      if (this.props.onBlur) {
        const fieldData: FieldData = this.state.field;
        this.props.onBlur(event, fieldData);
      }

      const fieldValue: any = this.getFieldValue(event);

      if (this.props.normalize) {
        this.changeFieldValueHandler(event, 'onBlur');
      }

      // If the field was touched don't validate him.

      if (getIn(this.state.field, ['touched'])) return;
      this.props.reformReduxContextSetFieldTouched(this.props.name, true);

      if (this.props.validate) {
        const validate: Array<Function> = getValidateFunctionsArray(dataFunctions)(
          this.props.validate,
        );

        const errors: Array<string> = await validateField(fieldValue, validate, dataFunctions);

        this.setFieldErrors(errors);
      }
    };

    onFocusFieldHandler = (event: Event) => {
      if (this.props.normalize) {
        this.changeFieldValueHandler(getIn(this.state.field, ['value']), 'onFocus');
      }

      if (this.props.onFocus) {
        const fieldData: FieldData = this.state.field;
        this.props.onFocus(event, fieldData);
      }
    };

    isRadioOrCheckbox = () => {
      return this.isRadio() || this.isCheckbox();
    };

    isCheckbox = () => {
      const { type } = this.props;
      return type && type === 'checkbox';
    };

    isRadio = () => {
      const { type } = this.props;
      return type && type === 'radio';
    };

    render() {
      const {
        normalize, // eslint-disable-line no-unused-vars
        component,
        name, // eslint-disable-line no-unused-vars
        validate, // eslint-disable-line no-unused-vars
        disabled, // eslint-disable-line no-unused-vars
        innerRef,
        ...restProps
      } = this.props;
      let fieldProps: {
        onChange: Function,
        onBlur: Function,
        onFocus: Function,
        hidden: boolean,
        value: any,
        disabled: boolean,
      } = {
        ...restProps,
        onChange: this.changeFieldValueHandler,
        onBlur: this.onBlurFieldHandler,
        onFocus: this.onFocusFieldHandler,
        hidden: getIn(this.state.field, ['hidden']),
        value: getIn(this.state.field, ['value']),
        disabled: getIn(this.state.field, ['disabled']),
      };

      const fieldValue: any = getIn(this.state.field, ['value']);
      const fieldHidden: boolean = getIn(this.state.field, ['hidden']);

      if (this.isRadioOrCheckbox()) {
        fieldProps = {
          ...fieldProps,
          checked: restProps.value ? is(restProps.value, fieldValue) : fieldValue,
          value: restProps.value,
        };
      }

      if (this.isCheckbox() && isList(fieldValue)) {
        fieldProps = {
          ...fieldProps,
          checked: listIncludes(fieldValue, restProps.value),
        };
      }

      if (typeof component !== 'string') {
        fieldProps = {
          ...fieldProps,
          ref: innerRef,
          formName: this.props.reformReduxContextFormName,
          errors: getIn(this.state.field, ['errors']),
          changed: getIn(this.state.field, ['changed']),
          touched: getIn(this.state.field, ['touched']),
        };
      } else {
        fieldProps = {
          ...filterReactDomProps(fieldProps),
          ref: innerRef,
          value: isImmutable(fieldValue) ? toJS(fieldValue) : fieldValue,
        };
      }

      if (component === 'select' && restProps.multiple && !fieldValue) {
        fieldProps = {
          ...fieldProps,
          value: [],
        };
      }

      return !fieldHidden && createElement(this.props.component, fieldProps);
    }
  }

  return forwardRef((props, ref) =>
    createElement(ReactReduxContext.Consumer, {}, reactReduxContextValue =>
      createElement(ReformReduxContext.Consumer, {}, reformReduxContextValue => {
        if (!reformReduxContextValue) {
          throw new Error('Component `Field` must be in `Form` component.');
        }

        return createElement(Field, {
          ...props,

          reactReduxContextGetState: reactReduxContextValue.store.getState,
          reactReduxContextSubscribe: reactReduxContextValue.store.subscribe,

          reformReduxContextGetFieldCount: reformReduxContextValue.field.getFieldCount,
          reformReduxContextSetFieldTouched: reformReduxContextValue.field.setFieldTouched,
          reformReduxContextSetFieldChanged: reformReduxContextValue.field.setFieldChanged,
          reformReduxContextChangeFieldValue: reformReduxContextValue.field.changeFieldValue,
          reformReduxContextSetFieldErrors: reformReduxContextValue.field.setFieldErrors,

          reformReduxContextFormName: reformReduxContextValue.form.name,
          reformReduxContextFormPath: reformReduxContextValue.form.path.join('.'),
          reformReduxContextFormUnregisterField: reformReduxContextValue.form.unregisterField,
          reformReduxContextFormRegisterField: reformReduxContextValue.form.registerField,
          reformReduxContextCoreUpdateStackFieldValue:
            reformReduxContextValue._core.updateStackFieldValue,

          innerRef: ref,
        });
      }),
    ),
  );
};
