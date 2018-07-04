import { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { formInitialisation, resetForm, setFormSubmitting, updateForm } from '../actions/Form';
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
} from '../actions/Field';
import { validateField, getValidateFunctionsArray } from '../utils/Field';
import { debounce, asyncForEach, filterReactDomProps } from '../utils/common';
import type { Element } from 'react';
import type { MiniReduxForm, ComponentProps, FieldsValidate, ComponentState } from '../types/Form';
import type {
  FieldData,
  FieldsData,
  FieldValidateProp,
  FieldsCount,
  FieldName,
} from '../types/Field';
import type { ComponentCreator } from '../types/common';
import type { Store } from 'redux';
import type { State } from '../types/formReducer';
import type { DataFunctions } from '../types/dataFunctions';

export const createFormComponent: ComponentCreator = (dataFunctions: DataFunctions) => {
  const {
    getIn,
    keys,
    listSize,
    list,
    setIn,
    map,
    isList,
    deleteIn,
  }: DataFunctions = dataFunctions;

  class Form extends Component<ComponentProps, ComponentState> {
    formName: string;
    path: Array<string>;

    static contextTypes = {
      store: PropTypes.object,
    };

    static childContextTypes = {
      _reformRedux: PropTypes.object,
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
      this.formName = this.path.slice(-1)[0];

      if (!this.fieldsStack[this.formName]) this.fieldsStack[this.formName] = {};
      if (!this.fieldsCount[this.formName]) this.fieldsCount[this.formName] = {};
      if (!this.fieldsValidateStack[this.formName]) this.fieldsValidateStack[this.formName] = {};
    }

    getChildContext(): MiniReduxForm {
      const store: Store<State, *, *> = this.context.store;

      return {
        _reformRedux: {
          form: {
            name: this.formName,
            path: this.path,
            fieldsCount: this.fieldsCount[this.formName],
            registerField: this.registerField,
            unregisterField: this.unregisterField,
            resetForm: (): Function => store.dispatch(resetForm(this.formName)),
            updateForm: debounce(
              (): Function =>
                store.dispatch(updateForm(this.formName, this.fieldsStack[this.formName])),
              250,
            ),
          },
          field: {
            removeField: (fieldName: FieldName): Function =>
              store.dispatch(removeField(this.formName, fieldName)),
            changeFieldsValues: (fieldsValues: { [fieldName: FieldName]: any }): Function =>
              store.dispatch(changeFieldsValues(this.formName, fieldsValues)),
            changeFieldValue: (fieldName: FieldName, fieldValue: any): Function =>
              store.dispatch(changeFieldValue(this.formName, fieldName, fieldValue)),
            setFieldErrors: (fieldName: FieldName, errors: Array<string>): Function =>
              store.dispatch(setFieldErrors(this.formName, fieldName, errors)),
            setFieldsErrors: (
              fieldName: FieldName,
              fieldsErrors: { [fieldName: FieldName]: Array<string> },
            ): Function => store.dispatch(setFieldsErrors(this.formName, fieldsErrors)),
            setFieldDisabled: (fieldName: FieldName, disabled: boolean = true): Function =>
              store.dispatch(setFieldDisabled(this.formName, fieldName, disabled)),
            setFieldsDisabled: (
              fieldName: FieldName,
              disabledFields: { [fieldName: FieldName]: boolean },
            ): Function => store.dispatch(setFieldsDisabled(this.formName, disabledFields)),
            resetField: (fieldName: FieldName): Function =>
              store.dispatch(resetField(this.formName, fieldName)),
            resetFields: (fieldsNames: Array<FieldName>): Function =>
              store.dispatch(resetFields(this.formName, fieldsNames)),
          },
        },
      };
    }

    increaseFieldCount = (fieldName: FieldName) => {
      const fieldsCount: number = this.fieldsCount[this.formName][fieldName] || 0;
      return (this.fieldsCount[this.formName][fieldName] = fieldsCount + 1);
    };

    decreaseFieldCount = (fieldName: FieldName) => {
      const fieldsCount: number = this.fieldsCount[this.formName][fieldName];
      return (this.fieldsCount[this.formName][fieldName] = fieldsCount ? fieldsCount - 1 : 0);
    };

    unregisterField = (fieldName: FieldName, removeOnUnmount: boolean) => {
      this.decreaseFieldCount(fieldName);

      if (removeOnUnmount) {
        this.context.store.dispatch(removeField(this.formName, fieldName));
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
          return;
        }

        if (fieldAdditionalData.type === 'checkbox' || fieldAdditionalData.type === 'radio') {
          if (fieldAdditionalData.checked) {
            if (fieldAdditionalData.type === 'checkbox') {
              if (!isList(getIn(this.fieldsStack[this.formName][fieldName], ['value']))) {
                let fieldValue: any = list([getIn(fieldData, ['value'])]);

                if (getIn(this.fieldsStack[this.formName][fieldName], ['value'])) {
                  fieldValue = list([
                    getIn(this.fieldsStack[this.formName][fieldName], ['value']),
                    getIn(fieldData, ['value']),
                  ]);
                }

                return (this.fieldsStack[this.formName][fieldName] = setIn(
                  this.fieldsStack[this.formName][fieldName],
                  ['value'],
                  fieldValue,
                ));
              }

              return (this.fieldsStack[this.formName][fieldName] = setIn(
                this.fieldsStack[this.formName][fieldName],
                ['value', listSize(getIn(this.fieldsStack[this.formName][fieldName], ['value']))],
                getIn(fieldData, ['value']),
              ));
            }

            return (this.fieldsStack[this.formName][fieldName] = setIn(
              this.fieldsStack[this.formName][fieldName],
              ['value'],
              getIn(fieldData, ['value']),
            ));
          }

          if (
            !isList(getIn(this.fieldsStack[this.formName][fieldName], ['value'])) &&
            fieldAdditionalData.type === 'checkbox'
          ) {
            let fieldValue: any = list([]);

            if (getIn(this.fieldsStack[this.formName][fieldName], ['value'])) {
              fieldValue = list([getIn(this.fieldsStack[this.formName][fieldName], ['value'])]);
            }

            return (this.fieldsStack[this.formName][fieldName] = setIn(
              this.fieldsStack[this.formName][fieldName],
              ['value'],
              fieldValue,
            ));
          }

          return;
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
    };

    componentDidMount() {
      const state: State = this.context.store.getState();
      const currentFormData = getIn(state, this.path);
      const fields: FieldsData = getIn(currentFormData, ['fields']);

      if (!listSize(keys(fields))) {
        this.context.store.dispatch(
          formInitialisation(this.formName, this.fieldsStack[this.formName]),
        );
      }
    }

    handleSubmit = async (event: Event) => {
      event.preventDefault();

      const store: Store<State, *, *> = this.context.store;
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

        Promise.resolve(onSubmit(fields, event)).then(() => {
          store.dispatch(setFormSubmitting(this.formName, false));
        });
      }
    };

    render(): Element<'form'> {
      const { children } = this.props;

      return createElement('form', {
        ...filterReactDomProps(this.props),
        onSubmit: this.handleSubmit,
        children,
      });
    }
  }

  return Form;
};
