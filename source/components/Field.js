import { Component, createElement, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { getValidateFunctionsArray, validateField } from '../utils/Field';
import { filterReactDomProps } from '../utils/common';
import type { ReFormRedux } from '../types/Form';
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

  class Field extends Component<ComponentProps, ComponentState> {
    initialFieldData: FieldData;
    unsubscribeFromStore: Function = () => {};

    static propTypes = {
      name: PropTypes.string.isRequired,
      component: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func])
        .isRequired,
      removeOnUnmount: PropTypes.bool,
      normalize: PropTypes.func,
    };

    static defaultProps: {
      disabled: $PropertyType<ComponentProps, 'disabled'>,
      value: $PropertyType<ComponentProps, 'value'>,
    } = {
      value: '',
      disabled: false,
    };

    static contextTypes = {
      _reformRedux: PropTypes.object,
      store: PropTypes.object,
    };

    constructor(props: ComponentProps, context: ReFormRedux) {
      super(props, context);

      if (!context._reformRedux) {
        throw new Error('Component `Field` must be in `Form` component.');
      }

      if (props.multiple && props.component === 'select' && props.value && !isList(props.value)) {
        throw new Error(
          'The `value` prop supplied to Field with type "select" must be an array if `multiple` is true.',
        );
      }

      // Normalize value on component onInit

      let value = props.value || '';

      if (props.normalize) {
        const { normalize } = props;
        value = normalize(props.value, '', map({}), 'onInit');
      }

      this.initialFieldData = map({
        value,
        errors: list([]),
        valid: true,
        touched: props.touched || false,
        changed: props.changed || false,
        disabled: props.disabled || false,
      });

      if (['radio', 'checkbox'].indexOf(props.type) > -1 && !props.checked) {
        this.initialFieldData = setIn(this.initialFieldData, ['value'], '');
      }

      // Get default value from store if it exists

      const state: State = this.context.store.getState();
      const currentFormData: State = getIn(state, this.context._reformRedux.form.path);
      const initialFieldData: FieldData = getIn(currentFormData, ['fields', props.name]);

      if (initialFieldData) {
        this.initialFieldData = initialFieldData;
      }

      // Write initial data to store
      this.state = {
        field: map(this.initialFieldData),
      };

      this.registerField();
    }

    registerField = () => {
      this.unsubscribeFromStore = this.context.store.subscribe(() => {
        const state: State = this.context.store.getState();
        const currentFormData: State = getIn(state, this.context._reformRedux.form.path);
        const currentFieldData: FieldData = this.state.field;
        const nextFieldData: FieldData = getIn(
          state,
          [...this.context._reformRedux.form.path, 'fields', this.props.name],
          this.state.field,
        );

        if (currentFormData.submitted && !getIn(nextFieldData, ['touched'])) {
          this.context._reformRedux.field.setFieldTouched(this.props.name, true);
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

      this.context._reformRedux.form.registerField(this.props.name, initialFieldData, validate, {
        type,
        checked,
        multiple,
        component,
      });

      if (this.context._reformRedux.form.initialized) {
        this.context._reformRedux.form.updateForm();
      }
    };

    componentWillUnmount() {
      this.unsubscribeFromStore();
      this.context._reformRedux.form.unregisterField(this.props.name, this.props.removeOnUnmount);
    }

    componentDidUpdate(prevProps: ComponentProps) {
      // Update value only for single fields
      if (this.context._reformRedux.form.fieldsCount[this.props.name] > 1) {
        return;
      }

      if (this.props.value !== undefined && !is(this.props.value, prevProps.value)) {
        return this.changeFieldValue(this.props.value);
      }

      if (
        ['radio', 'checkbox'].indexOf(this.props.type) !== -1 &&
        this.props.checked !== prevProps.checked
      ) {
        return this.changeFieldValue(this.props.checked ? this.props.value : '');
      }
    }

    setFieldErrors = (errors: Array<string>) => {
      if (!is(getIn(this.state.field, ['errors']), errors)) {
        this.context._reformRedux.field.setFieldErrors(this.props.name, errors);
      }
    };

    changeFieldValue = async (value: any) => {
      this.context._reformRedux.field.changeFieldValue(this.props.name, value);

      if (getIn(this.state.field, ['touched']) && this.props.validate) {
        const validate: Array<Function> = getValidateFunctionsArray(dataFunctions)(
          this.props.validate,
        );

        const errors: Array<string> = await validateField(value, validate, dataFunctions);

        this.setFieldErrors(errors);
      }
    };

    getFieldValue = (data: any): any => {
      const isEvent = data.nativeEvent && data.nativeEvent instanceof Event;
      if (this.isRadio()) {
        const checked = isEvent ? data.target.checked : data;
        return checked ? this.props.value : '';
      }

      if (this.isCheckbox()) {
        const checked = isEvent ? data.target.checked : data;
        if (this.context._reformRedux.form.fieldsCount[this.props.name] > 1) {
          return list(
            checked
              ? [...toJS(getIn(this.state.field, ['value'])), toJS(this.props.value)]
              : toJS(getIn(this.state.field, ['value'])).filter(
                  value => value !== this.props.value,
                ),
          );
        }

        return checked ? this.props.value : '';
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
      const { normalize } = this.props;

      if (normalize) {
        const state: State = this.context.store.getState();
        const currentFormData: State = getIn(state, this.context._reformRedux.form.path);
        const fields: FieldsData = getIn(currentFormData, ['fields']);

        value = normalize(value, getIn(this.state.field, ['value']), map(fields), normalizeWhen);
      }

      this.changeFieldValue(value);

      if (this.props.onChange) {
        this.props.onChange(data, value);
      }
    };

    onBlurFieldHandler = async (event: Event) => {
      if (this.props.onBlur) {
        const fieldData: FieldData = this.state.field;
        this.props.onBlur(event, fieldData);
      }

      const fieldValue: any = getIn(this.state.field, ['value']);

      if (this.props.normalize) {
        this.changeFieldValueHandler(fieldValue, 'onBlur');
      }

      // If the field was touched don't validate him.

      if (getIn(this.state.field, ['touched'])) return;
      this.context._reformRedux.field.setFieldTouched(this.props.name, true);

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
      // eslint-disable-next-line no-unused-vars
      const { normalize, component, name, validate, disabled, innerRef, ...restProps } = this.props;
      let fieldProps: {
        onChange: Function,
        onBlur: Function,
        onFocus: Function,
        value: any,
        disabled: boolean,
      } = {
        ...restProps,
        onChange: this.changeFieldValueHandler,
        onBlur: this.onBlurFieldHandler,
        onFocus: this.onFocusFieldHandler,
        value: getIn(this.state.field, ['value']),
        disabled: getIn(this.state.field, ['disabled']),
      };

      const fieldValue: any = getIn(this.state.field, ['value']);

      if (this.isRadioOrCheckbox()) {
        fieldProps = {
          ...fieldProps,
          checked: is(restProps.value, fieldValue),
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
          innerRef,
          formName: this.context._reformRedux.form.name,
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

      return createElement(this.props.component, fieldProps);
    }
  }

  return forwardRef((props, ref) => createElement(Field, { ...props, innerRef: ref }));
};
