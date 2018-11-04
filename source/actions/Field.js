import {
  CHANGE_FIELD_VALUE,
  SET_FIELD_ERRORS,
  SET_FIELDS_ERRORS,
  SET_FIELD_DISABLED,
  SET_FIELDS_DISABLED,
  CHANGE_FIELDS_VALUES,
  RESET_FIELD,
  RESET_FIELDS,
  REMOVE_FIELD,
  SET_FIELD_TOUCHED,
  SET_FIELDS_TOUCHED,
  SET_FIELD_CHANGED,
  SET_FIELDS_CHANGED,
} from '../constants/Field';
import type {
  ChangeFieldValue,
  SetFieldErrors,
  SetFieldsErrors,
  SetFieldsDisabled,
  SetFieldDisabled,
  ChangeFieldsValues,
  ResetField,
  ResetFields,
  FieldValue,
  FieldName,
  RemoveField,
  SetFieldTouched,
  SetFieldsTouched,
  SetFieldChanged,
  SetFieldsChanged,
} from '../types/Field';
import type { ResetState } from '../types/formReducer';
import { getReduxConst } from '../utils/common';

export const setFieldTouched: Function = (
  formName: string,
  fieldName: FieldName,
  fieldTouched: boolean,
): SetFieldTouched => ({
  type: getReduxConst(SET_FIELD_TOUCHED),
  formName,
  fieldName,
  fieldTouched,
});

export const setFieldsTouched: Function = (
  formName: string,
  touchedFields: { [fieldName: FieldName]: boolean },
): SetFieldsTouched => ({
  type: getReduxConst(SET_FIELDS_TOUCHED),
  formName,
  touchedFields,
});

export const setFieldChanged: Function = (
  formName: string,
  fieldName: FieldName,
  fieldChanged: boolean,
): SetFieldChanged => ({
  type: getReduxConst(SET_FIELD_CHANGED),
  formName,
  fieldName,
  fieldChanged,
});

export const setFieldsChanged: Function = (
  formName: string,
  changedFields: { [fieldName: FieldName]: boolean },
): SetFieldsChanged => ({
  type: getReduxConst(SET_FIELDS_CHANGED),
  formName,
  changedFields,
});

export const removeField: Function = (formName: string, fieldName: FieldName): RemoveField => ({
  type: getReduxConst(REMOVE_FIELD),
  formName,
  fieldName,
});

export const resetField: Function = (
  formName: string,
  fieldName: FieldName,
  state?: ResetState,
): ResetField => ({
  type: getReduxConst(RESET_FIELD),
  formName,
  fieldName,
  state,
});

export const resetFields: Function = (
  formName: string,
  fieldsNames: Array<FieldName>,
  state?: ResetState,
): ResetFields => ({
  type: getReduxConst(RESET_FIELDS),
  formName,
  fieldsNames,
  state,
});

export const setFieldDisabled: Function = (
  formName: string,
  fieldName: FieldName,
  disabled: boolean = true,
): SetFieldDisabled => ({
  type: getReduxConst(SET_FIELD_DISABLED),
  formName,
  fieldName,
  disabled,
});

export const setFieldsDisabled: Function = (
  formName: string,
  disabledFields: { [fieldName: FieldName]: boolean },
): SetFieldsDisabled => ({
  type: getReduxConst(SET_FIELDS_DISABLED),
  formName,
  disabledFields,
});

export const changeFieldValue: Function = (
  formName: string,
  fieldName: FieldName,
  fieldValue: FieldValue,
): ChangeFieldValue => ({
  type: getReduxConst(CHANGE_FIELD_VALUE),
  formName,
  fieldName,
  fieldValue,
});

export const changeFieldsValues: Function = (
  formName: string,
  fieldsValues: { [fieldName: FieldName]: FieldValue },
): ChangeFieldsValues => ({
  type: getReduxConst(CHANGE_FIELDS_VALUES),
  formName,
  fieldsValues,
});

export const setFieldErrors: Function = (
  formName: string,
  fieldName: FieldName,
  errors: Array<string>,
): SetFieldErrors => ({
  type: getReduxConst(SET_FIELD_ERRORS),
  formName,
  fieldName,
  errors,
});

export const setFieldsErrors: Function = (
  formName: string,
  fieldsErrors: { [fieldName: FieldName]: Array<string> },
): SetFieldsErrors => ({
  type: getReduxConst(SET_FIELDS_ERRORS),
  formName,
  fieldsErrors,
});
