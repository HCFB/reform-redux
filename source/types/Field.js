import type { ComponentType } from 'react';

// Additional Types

export type FieldData = {
  value: any,
  errors: Array<string>,
  valid: boolean,
  disabled: boolean,
};

export type FieldName = string;

export type FieldsCount = { [fieldName: FieldName]: number };

export type FieldsData = {
  [fieldName: FieldName]: FieldData,
};

export type FormProp = {
  name: string,
};

export type FieldValue = any;

export type FieldProp = {
  onChange: Function,
  onBlur: Function,
  value: string,
  disabled: boolean,
  errors: Array<string>,
};

export type FieldProps = FormProp & FieldProp;

export type FieldValidateProp = Array<Function> | Function;

// Component

export type ComponentProps = {
  name: string,
  component: ComponentType<*>,
  normalize?: (value: any, previousValue: any, allFields: FieldsData, when: string) => any,
  type?: string,
  multiple?: boolean,
  checked?: boolean,
  value?: string,
  validate?: FieldValidateProp,
  disabled?: boolean,
  onChange?: Function,
  onBlur?: (event: Event, fieldData: FieldData) => any,
  onFocus?: (event: Event, fieldData: FieldData) => any,
};

export type ComponentState = {
  field: FieldData,
};

// Actions

export type SetFieldDisabled = {
  type: string,
  formName: string,
  fieldName: FieldName,
  disabled: boolean,
};

export type SetFieldsDisabled = {
  type: string,
  formName: string,
  disabledFields: { [fieldName: FieldName]: boolean },
};

export type ResetField = {
  type: string,
  formName: string,
  fieldName: FieldName,
};

export type ResetFields = {
  type: string,
  formName: string,
  fieldsNames: Array<FieldName>,
};

export type FieldsValues = {
  [fieldName: FieldName]: FieldValue,
};

export type ChangeFieldsValues = {
  type: string,
  formName: string,
  fieldsValues: FieldsValues,
};

export type ChangeFieldValue = {
  type: string,
  formName: string,
  fieldName: FieldName,
  fieldValue: string,
};

export type SetFieldErrors = {
  type: string,
  formName: string,
  fieldName: FieldName,
  errors: Array<string>,
};

export type SetFieldsErrors = {
  type: string,
  formName: string,
  fieldsErrors: { [fieldName: FieldName]: Array<string> },
};
