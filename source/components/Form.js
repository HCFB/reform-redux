import { Component, createElement, createContext, forwardRef } from 'react';
import { ReactReduxContext } from 'react-redux';
import PropTypes from 'prop-types';
import {
  formInitialisation,
  resetForm,
  setFormSubmitting,
  updateForm,
  setFormSubmitted,
} from '../actions/Form';
import {
  changeFieldValue,
  setFieldErrors,
  setFieldsErrors,
  changeFieldsValues,
  setFieldDisabled,
  setFieldsDisabled,
  resetField,
  resetFields,
  removeField,
  setFieldsTouched,
  setFieldTouched,
  setFieldChanged,
  setFieldsChanged,
  setFieldHidden,
  setFieldsHidden,
} from '../actions/Field';
import { validateField, getValidateFunctionsArray } from '../utils/Field';
import { debounce, asyncForEach, filterReactDomProps, getFormNameKey } from '../utils/common';
import type { ComponentProps, FieldsValidate } from '../types/Form';
import type {
  FieldData,
  FieldsData,
  FieldValidateProp,
  FieldsCount,
  FieldName,
} from '../types/Field';
import type { ComponentCreator } from '../types/common';
import type { State, ResetState } from '../types/formReducer';
import type { DataFunctions } from '../types/dataFunctions';

// $FlowFixMe
export const ReformReduxContext = createContext(null);

export const createFormComponent: ComponentCreator = (dataFunctions: DataFunctions) => {
  const {
    getIn,
    keys,
    listSize,
    list,
    setIn,
    toJS,
    map,
    isList,
    fromJS,
    is,
    deleteIn,
    listIncludes,
  }: DataFunctions = dataFunctions;

  /**
   * @callback onSubmitFailed
   * @param {FieldsData} errorFields
   * @param {FieldsData} fields
   * @param {Event} event
   */

  /**
   * @callback onSubmit
   * @param {FieldsData} fields
   * @param {Event} event
   */

  /**
   * The Form component is a simple wrapper for the React `<form>`.
   *
   * @class Form
   * @example
   * import { Form } from 'reform-redux';
   *
   * const FormWrapper = () => (
   *  <Form path="path.to.form" />
   * );
   *
   * @param {string} path Path to reducer in the redux store. Example: 'some.reducers.myFormName'. (Required)
   * @param {string} [name] Form name.
   * @param {onSubmitFailed} [onSubmitFailed] Function which will trigger after unsuccessfull submit the form.
   * @param {onSubmit} [onSubmit] Function which will trigger after successfull submit the form.
   * @param {boolean} [submitHiddenFields] Submit hidden fields or not. False by default.
   */
  class Form extends Component<ComponentProps> {
    formName: string;
    path: Array<string>;
    initialized: boolean = false;
    _reformReduxContext: any = {};
    updateForm: Function;

    static propTypes = {
      path: PropTypes.string.isRequired,
      name: PropTypes.string,
      submitHiddenFields: PropTypes.bool,
      onSubmitFailed: PropTypes.func,
      onSubmit: PropTypes.func,
    };

    static defaultProps: {
      onSubmit: $PropertyType<ComponentProps, 'onSubmit'>,
      onSubmitFailed: $PropertyType<ComponentProps, 'onSubmitFailed'>,
    } = {
      onSubmit: () => {},
      onSubmitFailed: () => {},
    };

    fieldsStack: {
      [formName: string]: FieldsData,
    } = {};
    fieldsCount: {
      [formName: string]: FieldsCount,
    } = {};
    fieldsValidateStack: {
      [formName: string]: FieldsValidate,
    } = {};

    constructor(props: ComponentProps) {
      super(props);

      if (!props.path) {
        throw new Error('The `path` prop is required.');
      }

      this.path = props.path.split('.');
      this.formName = props.name || this.path.slice(-1)[0];

      if (props.name) {
        const formKey: string = getFormNameKey(props.name);

        if (formKey) {
          this.path = this.path.concat(formKey);
        }
      }

      if (!this.fieldsStack[this.formName]) this.fieldsStack[this.formName] = {};
      if (!this.fieldsCount[this.formName]) this.fieldsCount[this.formName] = {};
      if (!this.fieldsValidateStack[this.formName]) this.fieldsValidateStack[this.formName] = {};

      this._reformReduxContext = {
        form: {
          name: this.formName,
          path: this.path,
          registerField: this.registerField,
          unregisterField: this.unregisterField,
          resetForm: (state?: ResetState): Function =>
            props.reactReduxContextDispatch(resetForm(this.formName, state)),
          setFormSubmitted: (submitted: boolean): Function =>
            props.reactReduxContextDispatch(setFormSubmitted(this.formName, submitted)),
        },
        field: {
          getFieldCount: (fieldName: string) => this.fieldsCount[this.formName][fieldName] || 0,
          setFieldHidden: (fieldName: FieldName, fieldHidden: boolean): Function =>
            props.reactReduxContextDispatch(setFieldHidden(this.formName, fieldName, fieldHidden)),
          setFieldsHidden: (hiddenFields: { [fieldName: FieldName]: boolean }): Function =>
            props.reactReduxContextDispatch(setFieldsHidden(this.formName, hiddenFields)),
          setFieldTouched: (fieldName: FieldName, fieldTouched: boolean): Function =>
            props.reactReduxContextDispatch(
              setFieldTouched(this.formName, fieldName, fieldTouched),
            ),
          setFieldsTouched: (fieldsTouched: { [fieldName: FieldName]: boolean }): Function =>
            props.reactReduxContextDispatch(setFieldsTouched(this.formName, fieldsTouched)),
          setFieldChanged: (fieldName: FieldName, fieldChanged: boolean): Function =>
            props.reactReduxContextDispatch(
              setFieldChanged(this.formName, fieldName, fieldChanged),
            ),
          setFieldsChanged: (fieldsChanged: { [fieldName: FieldName]: boolean }): Function =>
            props.reactReduxContextDispatch(setFieldsChanged(this.formName, fieldsChanged)),
          removeField: (fieldName: FieldName): Function =>
            props.reactReduxContextDispatch(removeField(this.formName, fieldName)),
          changeFieldsValues: (fieldsValues: { [fieldName: FieldName]: any }): Function =>
            props.reactReduxContextDispatch(changeFieldsValues(this.formName, fieldsValues)),
          changeFieldValue: (fieldName: FieldName, fieldValue: any): Function =>
            props.reactReduxContextDispatch(changeFieldValue(this.formName, fieldName, fieldValue)),
          setFieldErrors: (fieldName: FieldName, errors: Array<string>): Function =>
            props.reactReduxContextDispatch(setFieldErrors(this.formName, fieldName, errors)),
          setFieldsErrors: (
            fieldName: FieldName,
            fieldsErrors: { [fieldName: FieldName]: Array<string> },
          ): Function =>
            props.reactReduxContextDispatch(setFieldsErrors(this.formName, fieldsErrors)),
          setFieldDisabled: (fieldName: FieldName, disabled: boolean = true): Function =>
            props.reactReduxContextDispatch(setFieldDisabled(this.formName, fieldName, disabled)),
          setFieldsDisabled: (disabledFields: { [fieldName: FieldName]: boolean }): Function =>
            props.reactReduxContextDispatch(setFieldsDisabled(this.formName, disabledFields)),
          resetField: (fieldName: FieldName, state?: ResetState): Function =>
            props.reactReduxContextDispatch(resetField(this.formName, fieldName, state)),
          resetFields: (fieldsNames: Array<FieldName>, state?: ResetState): Function =>
            props.reactReduxContextDispatch(resetFields(this.formName, fieldsNames, state)),
        },
        _core: {
          updateStackFieldValue: (fieldName: string, fieldValue: any) =>
            this.updateStackFieldValue(fieldName, fieldValue),
        },
      };

      this.updateForm = this.createFormUpdater(props.reactReduxContextDispatch);
    }

    updateStackFieldValue(fieldName: string, fieldValue: any) {
      this.fieldsStack[this.formName][fieldName] = setIn(
        this.fieldsStack[this.formName][fieldName],
        ['value'],
        fieldValue,
      );
    }

    createFormUpdater = reactReduxContextDispatch =>
      debounce((formInitialized): Function => {
        if (formInitialized) {
          reactReduxContextDispatch(updateForm(this.formName, this.fieldsStack[this.formName]));
        }
      }, 250);

    increaseFieldCount = (fieldName: FieldName) => {
      const fieldsCount: number = this.fieldsCount[this.formName][fieldName] || 0;
      return (this.fieldsCount[this.formName][fieldName] = fieldsCount + 1);
    };

    decreaseFieldCount = (fieldName: FieldName, reset: boolean) => {
      const fieldsCount: number = reset ? 0 : this.fieldsCount[this.formName][fieldName];
      return (this.fieldsCount[this.formName][fieldName] = fieldsCount ? fieldsCount - 1 : 0);
    };

    unregisterField = (fieldName: FieldName, removeOnUnmount: boolean) => {
      if (!getIn(this.fieldsStack, [this.formName, fieldName])) return;

      this.decreaseFieldCount(fieldName, removeOnUnmount);

      if (removeOnUnmount) {
        this.props.reactReduxContextDispatch(removeField(this.formName, fieldName));
        this.fieldsStack = deleteIn(this.fieldsStack, [this.formName, fieldName]);
        this.fieldsValidateStack = deleteIn(this.fieldsValidateStack, [this.formName, fieldName]);
      }
    };

    registerField = (
      fieldName: FieldName,
      fieldData: FieldData,
      fieldValidate: FieldValidateProp,
      fieldAdditionalData: {
        type: string,
        checked: boolean,
        multiple: boolean,
        component: string,
      },
    ) => {
      this.increaseFieldCount(fieldName);

      if (fieldAdditionalData.type && this.fieldsCount[this.formName][fieldName] > 1) {
        if (fieldAdditionalData.type === 'radio' && !fieldAdditionalData.checked) {
          return this.updateForm(this.initialized);
        }

        const stackFieldValue: any = getIn(this.fieldsStack[this.formName][fieldName], ['value']);
        const fieldDataValue: any = getIn(fieldData, ['value']);

        if (fieldAdditionalData.type === 'checkbox' || fieldAdditionalData.type === 'radio') {
          if (fieldAdditionalData.checked) {
            if (fieldAdditionalData.type === 'checkbox') {
              if (!isList(stackFieldValue)) {
                let fieldValue: any = list([fieldDataValue]);

                if (stackFieldValue) {
                  fieldValue = list([stackFieldValue, fieldDataValue]);
                }

                this.fieldsStack[this.formName][fieldName] = setIn(
                  this.fieldsStack[this.formName][fieldName],
                  ['value'],
                  fieldValue,
                );

                return this.updateForm(this.initialized);
              }

              if (
                !listIncludes(stackFieldValue, fieldDataValue) &&
                !is(stackFieldValue, fieldDataValue)
              ) {
                this.fieldsStack[this.formName][fieldName] = setIn(
                  this.fieldsStack[this.formName][fieldName],
                  ['value', listSize(stackFieldValue)],
                  fieldDataValue,
                );
              }

              return this.updateForm(this.initialized);
            }

            this.fieldsStack[this.formName][fieldName] = setIn(
              this.fieldsStack[this.formName][fieldName],
              ['value'],
              fieldDataValue,
            );

            return this.updateForm(this.initialized);
          }

          if (!isList(stackFieldValue) && fieldAdditionalData.type === 'checkbox') {
            let fieldValue: any = list([]);

            if (stackFieldValue) {
              fieldValue = list([stackFieldValue]);
            }

            this.fieldsStack[this.formName][fieldName] = setIn(
              this.fieldsStack[this.formName][fieldName],
              ['value'],
              fieldValue,
            );
          }

          return this.updateForm(this.initialized);
        }
      }

      // Set empty array as default value for multiple select

      if (
        fieldAdditionalData.component === 'select' &&
        fieldAdditionalData.multiple &&
        !getIn(fieldData, ['value'])
      ) {
        fieldData = setIn(fieldData, ['value'], list([]));
      }

      this.fieldsStack[this.formName][fieldName] = fieldData;
      this.fieldsValidateStack[this.formName][fieldName] = fieldValidate;

      this.updateForm(this.initialized);
    };

    componentDidMount() {
      let state: State = this.props.reactReduxContextGetState();
      let fieldsLength: number = listSize(keys(getIn(state, [...this.path, 'fields'])));

      if (fieldsLength) {
        this.initialized = true;
      }

      if (this.initialized) {
        this.updateForm(this.initialized);
      } else {
        this.props.reactReduxContextDispatch(
          formInitialisation(this.formName, this.fieldsStack[this.formName]),
        );

        this.initialized = true;
      }
    }

    handleSubmit = async (event: Event) => {
      event.preventDefault();

      this.props.reactReduxContextDispatch(setFormSubmitting(this.formName, true));

      const { onSubmit, onSubmitFailed } = this.props;

      // Validate all fields

      let state: State = this.props.reactReduxContextGetState();
      let fields: FieldsData = getIn(state, [...this.path, 'fields']);
      let fieldsErrors: { [fieldName: FieldName]: Array<string> } = map({});
      let errorsExists: boolean = false;

      if (!this.props.submitHiddenFields) {
        const jsFields = toJS(fields);
        const jsFilteredFields = {};
        Object.keys(jsFields).forEach(jsFieldKey => {
          if (!jsFields[jsFieldKey].hidden) {
            jsFilteredFields[jsFieldKey] = jsFields[jsFieldKey];
          }
        });
        fields = fromJS(jsFilteredFields);
      }

      await asyncForEach(
        keys(fields),
        async (fieldKey: string) => {
          const validateFunctions = getValidateFunctionsArray(dataFunctions)(
            this.fieldsValidateStack[this.formName][fieldKey],
          );
          let errors: Array<string> = getIn(fields, [fieldKey, 'errors']);

          if (!listSize(errors)) {
            errors = await validateField(
              getIn(fields, [fieldKey, 'value']),
              validateFunctions,
              dataFunctions,
            );
          }

          fieldsErrors = setIn(fieldsErrors, [fieldKey], errors);

          if (listSize(errors)) {
            errorsExists = true;
          }
        },
        dataFunctions,
      );

      if (errorsExists) {
        this.props.reactReduxContextDispatch(setFieldsErrors(this.formName, fieldsErrors));

        state = this.props.reactReduxContextGetState();
        fields = getIn(state, [...this.path, 'fields']);

        let fieldsWithErrors: { [fieldName: FieldName]: FieldData } = map({});

        keys(fields).forEach((fieldKey: FieldName) => {
          if (!getIn(fields, [fieldKey, 'valid'])) {
            fieldsWithErrors = setIn(fieldsWithErrors, [fieldKey], getIn(fields, [fieldKey]));
          }
        });

        if (onSubmitFailed) {
          onSubmitFailed(fieldsWithErrors, fields, event);
          this.props.reactReduxContextDispatch(setFormSubmitting(this.formName, false));
        }
      } else if (onSubmit) {
        state = this.props.reactReduxContextGetState();

        await Promise.resolve(onSubmit(fields, event)).then(() => {
          this.props.reactReduxContextDispatch(setFormSubmitting(this.formName, false));
          this.props.reactReduxContextDispatch(setFormSubmitted(this.formName, true));
        });
      }

      const jsFields = toJS(fields);
      const jsFilteredFields = {};
      Object.keys(jsFields).forEach(jsFieldKey => {
        jsFilteredFields[jsFieldKey] = true;
      });
      fields = fromJS(jsFilteredFields);

      if (this._reformReduxContext.field) this._reformReduxContext.field.setFieldsTouched(fields);
    };

    render() {
      const { children, innerRef } = this.props;

      return createElement(
        ReformReduxContext.Provider,
        { value: this._reformReduxContext },
        createElement('form', {
          ...filterReactDomProps(this.props),
          ref: innerRef,
          onSubmit: this.handleSubmit,
          children,
        }),
      );
    }
  }

  return forwardRef((props, ref) =>
    createElement(ReactReduxContext.Consumer, {}, reactReduxContextValue =>
      createElement(Form, {
        ...props,
        reactReduxContextDispatch: reactReduxContextValue.store.dispatch,
        reactReduxContextGetState: reactReduxContextValue.store.getState,
        innerRef: ref,
      }),
    ),
  );
};
