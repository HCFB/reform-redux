import type { Element } from 'react';
import type { FieldsData, FieldValidateProp, FieldsCount, FieldName } from './Field';

export type MiniReduxForm = {
  _reformRedux: {
    form: {
      name: string,
      path: string,
      registerField: Function,
      fieldsCount: FieldsCount,
      unregisterField: Function,
      resetForm: Function,
      updateForm: Function,
    },
    field: {
      changeFieldValue: (fieldName: FieldName, fieldValue: string) => Function,
      changeFieldsValues: (fieldsValues: { [fieldName: FieldName]: any }) => Function,
      setFieldErrors: (fieldName: FieldName, errors: Array<string>) => Function,
      setFieldsErrors: (
        fieldName: FieldName,
        fieldsErrors: { [fieldName: FieldName]: Array<string> },
      ) => Function,
      setFieldDisabled: (fieldName: FieldName, disabled: boolean) => Function,
      setFieldsDisabled: (
        fieldName: FieldName,
        disabledFields: { [fieldName: FieldName]: boolean },
      ) => Function,
      resetField: (fieldName: FieldName) => Function,
      resetFields: (fieldsNames: Array<FieldName>) => Function,
    },
  },
};

export type ComponentState = {
  submitted: boolean,
};

export type ComponentProps = {
  children: Element<*>,
  path: string,
  onSubmitFailed?: (errorFields: FieldsData, fields: FieldsData, event: Event) => any,
  onSubmit?: (fields: FieldsData, event: Event) => any,
};

export type FieldsValidate = {
  [fieldName: FieldName]: FieldValidateProp,
};

// Actions

export type FormInitialisation = {
  type: string,
  formName: string,
  fields: FieldsData,
};

export type UpdateForm = {
  type: string,
  formName: string,
  fields: FieldsData,
};

export type SetFormSubmitting = {
  type: string,
  formName: string,
  submitting: boolean,
};

export type ResetForm = {
  type: string,
  formName: string,
};
