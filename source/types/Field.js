import type { ComponentType } from 'react';
import type { ResetState } from './formReducer';

// Additional Types

export type FieldData = {
  value: any,
  changed: boolean,
  errors: Array<string>,
  valid: boolean,
  touched: boolean,
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
  component: string | ComponentType<*>,
  reformReduxContext: any, // fix me
  reactReduxContext: any,
  hidden: boolean,
  removeOnUnmount?: boolean,
  children?: any,
  normalize?: (
    value: any,
    previousValue: any,
    allFields: FieldsData,
    when: string,
    name: FieldName,
  ) => any,
  type?: string,
  multiple?: boolean,
  checked?: boolean,
  value?: string,
  validate?: FieldValidateProp,
  disabled?: boolean,
  changed?: boolean,
  touched?: boolean,
  onChange?: Function,
  onBlur?: (event: Event, fieldData: FieldData) => any,
  onFocus?: (event: Event, fieldData: FieldData) => any,
  innerRef?: (element: any) => void,

  reformReduxContextFieldGetFieldCount: Function,
  reactReduxContextGetState: Function,
  reactReduxContextSubscribe: Function,

  reformReduxContextGetFieldCount: Function,
  reformReduxContextSetFieldTouched: Function,
  reformReduxContextSetFieldChanged: Function,
  reformReduxContextChangeFieldValue: Function,
  reformReduxContextSetFieldErrors: Function,

  reformReduxContextFormUnregisterField: Function,
  reformReduxContextFormName: string,
  reformReduxContextFormPath: Array<string>,
  reformReduxContextFormRegisterField: Function,
  reformReduxContextCoreUpdateStackFieldValue: Function,
};

export type ComponentState = {
  field: FieldData,
};

// Actions

export type SetFieldHidden = {
  type: string,
  formName: string,
  fieldName: FieldName,
  fieldHidden: boolean,
};

export type SetFieldsHidden = {
  type: string,
  formName: string,
  hiddenFields: { [fieldName: FieldName]: boolean },
};

export type SetFieldTouched = {
  type: string,
  formName: string,
  fieldName: FieldName,
  fieldTouched: boolean,
};

export type SetFieldsTouched = {
  type: string,
  formName: string,
  touchedFields: { [fieldName: FieldName]: boolean },
};

export type SetFieldChanged = {
  type: string,
  formName: string,
  fieldName: FieldName,
  fieldChanged: boolean,
};

export type SetFieldsChanged = {
  type: string,
  formName: string,
  changedFields: { [fieldName: FieldName]: boolean },
};

export type SetFieldDisabled = {
  type: string,
  formName: string,
  fieldName: FieldName,
  disabled: boolean,
};

export type SetFormSubmitted = {
  type: string,
  formName: string,
  submitted: boolean,
};

export type SetFieldsDisabled = {
  type: string,
  formName: string,
  disabledFields: { [fieldName: FieldName]: boolean },
};

export type ResetField = {
  type: string,
  formName: string,
  state: ResetState,
  fieldName: FieldName,
};

export type RemoveField = {
  type: string,
  formName: string,
  fieldName: string,
};

export type ResetFields = {
  type: string,
  formName: string,
  state: ResetState,
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
