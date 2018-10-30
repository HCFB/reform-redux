import { Component, createElement } from 'react';
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
} from '../actions/Field';
import { validateField, getValidateFunctionsArray } from '../utils/Field';
import { debounce, asyncForEach, filterReactDomProps } from '../utils/common';
import type { Element } from 'react';
import type { ReFormRedux, ComponentProps, FieldsValidate } from '../types/Form';
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

  class Form extends Component<ComponentProps> {
    formName: string;
    path: Array<string>;
    initialized: boolean = false;

    static contextTypes = {
      store: PropTypes.object,
    };

    static childContextTypes = {
      _reformRedux: PropTypes.object,
    };

    static propTypes = {
      path: PropTypes.string.isRequired,
      name: PropTypes.string,
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

    constructor(props: ComponentProps, context) {
      super(props);

      if (!props.path) {
        throw new Error('The `path` prop is required.');
      }

      this.path = props.path.split('.');
      this.formName = props.name || this.path.slice(-1)[0];

      if (!this.fieldsStack[this.formName]) this.fieldsStack[this.formName] = {};
      if (!this.fieldsCount[this.formName]) this.fieldsCount[this.formName] = {};
      if (!this.fieldsValidateStack[this.formName]) this.fieldsValidateStack[this.formName] = {};

      this.updateForm = this.createFormUpdater(context.store);
    }

    getChildContext(): ReFormRedux {
      const store: Store<State, *, *> = this.context.store;

      return {
        _reformRedux: {
          form: {
            name: this.formName,
            path: this.path,
            fieldsCount: this.fieldsCount[this.formName],
            registerField: this.registerField,
            unregisterField: this.unregisterField,
            resetForm: (state?: ResetState): Function =>
              store.dispatch(resetForm(this.formName, state)),
            setFormSubmitted: (submitted: boolean): Function =>
              store.dispatch(setFormSubmitted(this.formName, submitted)),
          },
          field: {
            setFieldTouched: (fieldName: FieldName, fieldTouched: boolean): Function =>
              store.dispatch(setFieldTouched(this.formName, fieldName, fieldTouched)),
            setFieldsTouched: (fieldsTouched: { [fieldName: FieldName]: boolean }): Function =>
              store.dispatch(setFieldsTouched(this.formName, fieldsTouched)),
            setFieldChanged: (fieldName: FieldName, fieldChanged: boolean): Function =>
              store.dispatch(setFieldChanged(this.formName, fieldName, fieldChanged)),
            setFieldsChanged: (fieldsChanged: { [fieldName: FieldName]: boolean }): Function =>
              store.dispatch(setFieldsChanged(this.formName, fieldsChanged)),
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
            setFieldsDisabled: (disabledFields: { [fieldName: FieldName]: boolean }): Function =>
              store.dispatch(setFieldsDisabled(this.formName, disabledFields)),
            resetField: (fieldName: FieldName, state?: ResetState): Function =>
              store.dispatch(resetField(this.formName, fieldName, state)),
            resetFields: (fieldsNames: Array<FieldName>, state?: ResetState): Function =>
              store.dispatch(resetFields(this.formName, fieldsNames, state)),
          },
        },
      };
    }

    createFormUpdater = (store: Store<State, *, *>) =>
      debounce(
        (): Function => store.dispatch(updateForm(this.formName, this.fieldsStack[this.formName])),
        250,
      );

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

      if (this.initialized) {
        this.updateForm();
      }
    };

    componentDidMount() {
      const state: State = this.context.store.getState();
      const currentFormData = getIn(state, this.path);
      const fields: FieldsData = getIn(currentFormData, ['fields']);

      if (!listSize(keys(fields))) {
        this.context.store.dispatch(
          formInitialisation(this.formName, this.fieldsStack[this.formName]),
        );
        this.initialized = true;
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
          store.dispatch(setFormSubmitted(this.formName, true));
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
