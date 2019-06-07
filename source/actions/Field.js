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
import { getReduxConst } from '../utils/common';

/**
 * Set field touched.
 *
 * @example
 *
 * import { setFieldTouched } from 'reform-redux';
 *
 * store.dispatch(setFieldTouched(
 *   formName,
 *   fieldName,
 *   fieldTouched,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {boolean} fieldTouched
 * @returns {SetFieldTouched}
 */
export const setFieldTouched = (formName, fieldName, fieldTouched) => ({
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
 *  formName,
 *  hiddenFields,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, boolean>} hiddenFields
 * @returns {SetFieldsHidden}
 */
export const setFieldsHidden = (formName, hiddenFields) => ({
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
 *   formName,
 *   fieldName,
 *   fieldHidden,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {boolean} fieldHidden
 * @returns {SetFieldHidden}
 */
export const setFieldHidden = (formName, fieldName, fieldHidden) => ({
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
 *   formName,
 *   touchedFields,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, boolean>} touchedFields
 * @returns {SetFieldsTouched}
 */
export const setFieldsTouched = (formName, touchedFields) => ({
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
 *   formName,
 *   fieldName,
 *   fieldChanged,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {boolean} fieldChanged
 * @returns {SetFieldChanged}
 */
export const setFieldChanged = (formName, fieldName, fieldChanged) => ({
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
 *   formName,
 *   changedFields,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, boolean>} changedFields
 * @returns {SetFieldsChanged}
 */
export const setFieldsChanged = (formName, changedFields) => ({
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
 *   formName,
 *   fieldName,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @returns {RemoveField}
 */
export const removeField = (formName, fieldName) => ({
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
 *   formName,
 *   fieldName,
 *   state?: ResetState
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {ResetState} [state]
 * @returns {ResetField}
 */
export const resetField = (formName, fieldName, state) => ({
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
 *   formName,
 *   fieldNames,
 *   state?: ResetState
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName[]} fieldNames
 * @param {ResetState} [state]
 * @returns {ResetFields}
 */
export const resetFields = (formName, fieldsNames, state) => ({
  type: getReduxConst(RESET_FIELDS),
  formName,
  fieldsNames,
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
 *   formName,
 *   fieldName,
 *   disabled = true,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {boolean} [disabled=true]
 * @returns {SetFieldDisabled}
 */
export const setFieldDisabled = (formName, fieldName, disabled = true) => ({
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
 *   formName,
 *   disabledFields
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, boolean>} disabledFields
 * @returns {SetFieldsDisabled}
 */
export const setFieldsDisabled = (formName, disabledFields) => ({
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
 *   formName,
 *   fieldName,
 *   fieldValue,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {*} FieldValue
 * @returns {ChangeFieldValue}
 */
export const changeFieldValue = (formName, fieldName, fieldValue) => ({
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
 *   formName,
 *   fieldsValues,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, *>} fieldsValues
 * @returns {ChangeFieldsValues}
 */
export const changeFieldsValues = (formName, fieldsValues) => ({
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
 *   formName,
 *   fieldName,
 *   errors,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {FieldName} fieldName
 * @param {string[]} errors
 * @returns {SetFieldErrors}
 */
export const setFieldErrors = (formName, fieldName, errors) => ({
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
 *   formName,
 *   fieldsErrors,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {object.<FieldName, string[]>} fieldName
 * @returns {SetFieldsErrors}
 */
export const setFieldsErrors = (formName, fieldsErrors) => ({
  type: getReduxConst(SET_FIELDS_ERRORS),
  formName,
  fieldsErrors,
});
