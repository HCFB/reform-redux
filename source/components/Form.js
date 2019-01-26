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
import { debounce, asyncForEach, filterReactDomProps } from '../utils/common';
import type { ComponentProps, FieldsValidate } from '../types/Form';
import type {
  FieldData,
  FieldsData,
  FieldValidateProp,
  FieldsCount,
  FieldName,
} from '../types/Field';
import type { ComponentCreator } from '../types/common';
import type { Store } from 'redux';
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
    _reformReduxContext: {} = {};
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
            props.reactReduxContext.store.dispatch(resetForm(this.formName, state)),
          setFormSubmitted: (submitted: boolean): Function =>
            props.reactReduxContext.store.dispatch(setFormSubmitted(this.formName, submitted)),
        },
        field: {
          getFieldCount: (fieldName: string) => this.fieldsCount[this.formName][fieldName] || 0,
          setFieldHidden: (fieldName: FieldName, fieldHidden: boolean): Function =>
            props.reactReduxContext.store.dispatch(
              setFieldHidden(this.formName, fieldName, fieldHidden),
            ),
          setFieldsHidden: (hiddenFields: { [fieldName: FieldName]: boolean }): Function =>
            props.reactReduxContext.store.dispatch(setFieldsHidden(this.formName, hiddenFields)),
          setFieldTouched: (fieldName: FieldName, fieldTouched: boolean): Function =>
            props.reactReduxContext.store.dispatch(
              setFieldTouched(this.formName, fieldName, fieldTouched),
            ),
          setFieldsTouched: (fieldsTouched: { [fieldName: FieldName]: boolean }): Function =>
            props.reactReduxContext.store.dispatch(setFieldsTouched(this.formName, fieldsTouched)),
          setFieldChanged: (fieldName: FieldName, fieldChanged: boolean): Function =>
            props.reactReduxContext.store.dispatch(
              setFieldChanged(this.formName, fieldName, fieldChanged),
            ),
          setFieldsChanged: (fieldsChanged: { [fieldName: FieldName]: boolean }): Function =>
            props.reactReduxContext.store.dispatch(setFieldsChanged(this.formName, fieldsChanged)),
          removeField: (fieldName: FieldName): Function =>
            props.reactReduxContext.store.dispatch(removeField(this.formName, fieldName)),
          changeFieldsValues: (fieldsValues: { [fieldName: FieldName]: any }): Function =>
            props.reactReduxContext.store.dispatch(changeFieldsValues(this.formName, fieldsValues)),
          changeFieldValue: (fieldName: FieldName, fieldValue: any): Function =>
            props.reactReduxContext.store.dispatch(
              changeFieldValue(this.formName, fieldName, fieldValue),
            ),
          setFieldErrors: (fieldName: FieldName, errors: Array<string>): Function =>
            props.reactReduxContext.store.dispatch(
              setFieldErrors(this.formName, fieldName, errors),
            ),
          setFieldsErrors: (
            fieldName: FieldName,
            fieldsErrors: { [fieldName: FieldName]: Array<string> },
          ): Function =>
            props.reactReduxContext.store.dispatch(setFieldsErrors(this.formName, fieldsErrors)),
          setFieldDisabled: (fieldName: FieldName, disabled: boolean = true): Function =>
            props.reactReduxContext.store.dispatch(
              setFieldDisabled(this.formName, fieldName, disabled),
            ),
          setFieldsDisabled: (disabledFields: { [fieldName: FieldName]: boolean }): Function =>
            props.reactReduxContext.store.dispatch(
              setFieldsDisabled(this.formName, disabledFields),
            ),
          resetField: (fieldName: FieldName, state?: ResetState): Function =>
            props.reactReduxContext.store.dispatch(resetField(this.formName, fieldName, state)),
          resetFields: (fieldsNames: Array<FieldName>, state?: ResetState): Function =>
            props.reactReduxContext.store.dispatch(resetFields(this.formName, fieldsNames, state)),
        },
        _core: {
          updateStackFieldValue: (fieldName: string, fieldValue: any) =>
            this.updateStackFieldValue(fieldName, fieldValue),
        },
      };

      this.updateForm = this.createFormUpdater(props.reactReduxContext.store);
    }

    updateStackFieldValue(fieldName: string, fieldValue: any) {
      this.fieldsStack[this.formName][fieldName] = setIn(
        this.fieldsStack[this.formName][fieldName],
        ['value'],
        fieldValue,
      );
    }

    createFormUpdater = (store: Store<State, *, *>) =>
      debounce((formInitialized): Function => {
        if (formInitialized) {
          store.dispatch(updateForm(this.formName, this.fieldsStack[this.formName]));
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
        this.props.reactReduxContext.store.dispatch(removeField(this.formName, fieldName));
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
      const store: Store<State, *, *> = this.props.reactReduxContext.store;
      let state: State = store.getState();
      let fieldsLength: number = listSize(keys(getIn(state, [...this.path, 'fields'])));

      if (fieldsLength) {
        this.initialized = true;
      }

      if (this.initialized) {
        this.updateForm(this.initialized);
      } else {
        this.props.reactReduxContext.store.dispatch(
          formInitialisation(this.formName, this.fieldsStack[this.formName]),
        );

        this.initialized = true;
      }
    }

    handleSubmit = async (event: Event) => {
      event.preventDefault();

      const store: Store<State, *, *> = this.props.reactReduxContext.store;
      store.dispatch(setFormSubmitting(this.formName, true));

      const { onSubmit, onSubmitFailed } = this.props;

      // Validate all fields

      let state: State = store.getState();
      let fields: FieldsData = getIn(state, [...this.path, 'fields']);
      let fieldsErrors: { [fieldName: FieldName]: Array<string> } = map({});
      let errorsExists: boolean = false;

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
        store.dispatch(setFieldsErrors(this.formName, fieldsErrors));

        state = store.getState();
        fields = getIn(state, [...this.path, 'fields']);

        let fieldsWithErrors: { [fieldName: FieldName]: FieldData } = map({});

        keys(fields).forEach((fieldKey: FieldName) => {
          if (!getIn(fields, [fieldKey, 'valid'])) {
            fieldsWithErrors = setIn(fieldsWithErrors, [fieldKey], getIn(fields, [fieldKey]));
          }
        });

        if (onSubmitFailed) {
          onSubmitFailed(fieldsWithErrors, fields, event);
          store.dispatch(setFormSubmitting(this.formName, false));
        }
      } else if (onSubmit) {
        state = store.getState();
        fields = getIn(state, [...this.path, 'fields']);

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

        Promise.resolve(onSubmit(fields, event)).then(() => {
          store.dispatch(setFormSubmitting(this.formName, false));
          store.dispatch(setFormSubmitted(this.formName, true));
        });
      }
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
      createElement(Form, { ...props, reactReduxContext: reactReduxContextValue, innerRef: ref }),
    ),
  );
};
