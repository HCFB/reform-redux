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
  SET_FIELDS_HIDDEN,
  SET_FIELD_CHANGED,
  SET_FIELDS_CHANGED,
  SET_FIELD_HIDDEN,
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
  SetFieldHidden,
  SetFieldsHidden,
} from '../types/Field';
import type { ResetState } from '../types/formReducer';
import { getReduxConst } from '../utils/common';

/**
 * Set field touched.
 *
 * @example
 *
 * import { setFieldTouched } from 'reform-redux';
 *
 * store.dispatch(setFieldTouched(
 *   formName: string,
 *   fieldName: FieldName,
 *   fieldTouched: boolean,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {boolean} fieldTouched
 * @returns {SetFieldTouched}
 */
export const setFieldTouched = (
  formName: string,
  fieldName: FieldName,
  fieldTouched: boolean,
): SetFieldTouched => ({
  type: getReduxConst(SET_FIELD_TOUCHED),
  formName,
  fieldName,
  fieldTouched,
});

/**
 * Set fields hidden.
 *
 * @example
 *
 * import { setFieldsHidden } from 'reform-redux';
 *
 * store.dispatch(setFieldsHidden(
 *  formName: string,
 *  hiddenFields: { [fieldName: FieldName]: boolean },
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, boolean>} hiddenFields
 * @returns {SetFieldsHidden}
 */
export const setFieldsHidden = (
  formName: string,
  hiddenFields: { [fieldName: FieldName]: boolean },
): SetFieldsHidden => ({
  type: getReduxConst(SET_FIELDS_HIDDEN),
  formName,
  hiddenFields,
});

/**
 * Set field hidden.
 *
 * @example
 *
 * import { setFieldHidden } from 'reform-redux';
 *
 * store.dispatch(setFieldHidden(
 *   formName: string,
 *   fieldName: FieldName,
 *   fieldHidden: boolean,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {boolean} fieldHidden
 * @returns {SetFieldHidden}
 */
export const setFieldHidden = (
  formName: string,
  fieldName: FieldName,
  fieldHidden: boolean,
): SetFieldHidden => ({
  type: getReduxConst(SET_FIELD_HIDDEN),
  formName,
  fieldName,
  fieldHidden,
});

/**
 * Set fields touched.
 *
 * @example
 *
 * import { setFieldsTouched } from 'reform-redux';
 *
 * store.dispatch(setFieldsTouched(
 *   formName: string,
 *   touchedFields: { [fieldName: FieldName]: boolean },
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, boolean>} touchedFields
 * @returns {SetFieldsTouched}
 */
export const setFieldsTouched = (
  formName: string,
  touchedFields: { [fieldName: FieldName]: boolean },
): SetFieldsTouched => ({
  type: getReduxConst(SET_FIELDS_TOUCHED),
  formName,
  touchedFields,
});

/**
 * Set field changed.
 *
 * @example
 *
 * import { setFieldChanged } from 'reform-redux';
 *
 * store.dispatch(setFieldChanged(
 *   formName: string,
 *   fieldName: FieldName,
 *   fieldChanged: boolean,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {boolean} fieldChanged
 * @returns {SetFieldChanged}
 */
export const setFieldChanged = (
  formName: string,
  fieldName: FieldName,
  fieldChanged: boolean,
): SetFieldChanged => ({
  type: getReduxConst(SET_FIELD_CHANGED),
  formName,
  fieldName,
  fieldChanged,
});

/**
 * Set fields changed.
 *
 * @example
 *
 * import { setFieldsChanged } from 'reform-redux';
 *
 * store.dispatch(setFieldsChanged(
 *   formName: string,
 *   changedFields: { [fieldName: FieldName]: boolean },
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, boolean>} changedFields
 * @returns {SetFieldsChanged}
 */
export const setFieldsChanged = (
  formName: string,
  changedFields: { [fieldName: FieldName]: boolean },
): SetFieldsChanged => ({
  type: getReduxConst(SET_FIELDS_CHANGED),
  formName,
  changedFields,
});

/**
 * Remove field
 *
 * @example
 *
 * import { removeField } from 'reform-redux';
 *
 * store.dispatch(removeField(
 *   formName: string,
 *   fieldName: FieldName,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @returns {RemoveField}
 */
export const removeField = (formName: string, fieldName: FieldName): RemoveField => ({
  type: getReduxConst(REMOVE_FIELD),
  formName,
  fieldName,
});

/**
 * Reset field
 *
 * @example
 *
 * import { resetField } from 'reform-redux';
 *
 * store.dispatch(resetField(
 *   formName: string,
 *   fieldName: FieldName,
 *   state?: ResetState
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {ResetState} [state]
 * @returns {ResetField}
 */
export const resetField = (
  formName: string,
  fieldName: FieldName,
  state?: ResetState,
): ResetField => ({
  type: getReduxConst(RESET_FIELD),
  formName,
  fieldName,
  // $FlowFixMe
  state,
});

/**
 * Reset fields
 *
 * @example
 *
 * import { resetFields } from 'reform-redux';
 *
 * store.dispatch(resetFields(
 *   formName: string,
 *   fieldNames: Array<FieldName>,
 *   state?: ResetState
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName[]} fieldNames
 * @param {ResetState} [state]
 * @returns {ResetFields}
 */
export const resetFields = (
  formName: string,
  fieldsNames: Array<FieldName>,
  state?: ResetState,
): ResetFields => ({
  type: getReduxConst(RESET_FIELDS),
  formName,
  fieldsNames,
  // $FlowFixMe
  state,
});

/**
 * Set field disabled
 *
 * @example
 *
 * import { setFieldDisabled } from 'reform-redux';
 *
 * store.dispatch(setFieldDisabled(
 *   formName: string,
 *   fieldName: FieldName,
 *   disabled: boolean = true,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {boolean} [disabled=true]
 * @returns {SetFieldDisabled}
 */
export const setFieldDisabled = (
  formName: string,
  fieldName: FieldName,
  disabled: boolean = true,
): SetFieldDisabled => ({
  type: getReduxConst(SET_FIELD_DISABLED),
  formName,
  fieldName,
  disabled,
});

/**
 * Set fields disabled
 *
 * @example
 *
 * import { setFieldsDisabled } from 'reform-redux';
 *
 * store.dispatch(setFieldDisabled(
 *   formName: string,
 *   disabledFields: { [fieldName: FieldName]: boolean }
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, boolean>} disabledFields
 * @returns {SetFieldsDisabled}
 */
export const setFieldsDisabled = (
  formName: string,
  disabledFields: { [fieldName: FieldName]: boolean },
): SetFieldsDisabled => ({
  type: getReduxConst(SET_FIELDS_DISABLED),
  formName,
  disabledFields,
});

/**
 * Change field value
 *
 * @example
 *
 * import { changeFieldValue } from 'reform-redux';
 *
 * store.dispatch(changeFieldValue(
 *   formName: string,
 *   fieldName: FieldName,
 *   fieldValue: FieldValue,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {*} FieldValue
 * @returns {ChangeFieldValue}
 */
export const changeFieldValue = (
  formName: string,
  fieldName: FieldName,
  fieldValue: FieldValue,
): ChangeFieldValue => ({
  type: getReduxConst(CHANGE_FIELD_VALUE),
  formName,
  fieldName,
  fieldValue,
});

/**
 * Change fields values
 *
 * @example
 *
 * import { changeFieldsValues } from 'reform-redux';
 *
 * store.dispatch(changeFieldsValues(
 *   formName: string,
 *   fieldsValues: { [fieldName: FieldName]: FieldValue },
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, *>} fieldsValues
 * @returns {ChangeFieldsValues}
 */
export const changeFieldsValues = (
  formName: string,
  fieldsValues: { [fieldName: FieldName]: FieldValue },
): ChangeFieldsValues => ({
  type: getReduxConst(CHANGE_FIELDS_VALUES),
  formName,
  fieldsValues,
});

/**
 * Set field errors
 *
 * @example
 *
 * import { setFieldErrors } from 'reform-redux';
 *
 * store.dispatch(setFieldErrors(
 *   formName: string,
 *   fieldName: FieldName,
 *   errors: Array<string>,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {string[]} errors
 * @returns {SetFieldErrors}
 */
export const setFieldErrors = (
  formName: string,
  fieldName: FieldName,
  errors: Array<string>,
): SetFieldErrors => ({
  type: getReduxConst(SET_FIELD_ERRORS),
  formName,
  fieldName,
  errors,
});

/**
 * Set field errors
 *
 * @example
 *
 * import { setFieldsErrors } from 'reform-redux';
 *
 * store.dispatch(setFieldsErrors(
 *   formName: string,
 *   fieldsErrors: { [fieldName: FieldName]: Array<string> },
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, string[]>} fieldName
 * @returns {SetFieldsErrors}
 */
export const setFieldsErrors = (
  formName: string,
  fieldsErrors: { [fieldName: FieldName]: Array<string> },
): SetFieldsErrors => ({
  type: getReduxConst(SET_FIELDS_ERRORS),
  formName,
  fieldsErrors,
});
