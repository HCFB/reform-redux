import {
  FORM_INITIALISATION,
  RESET_FORM,
  SET_FORM_SUBMITTING,
  UPDATE_FORM,
  SET_FORM_SUBMITTED,
} from '../constants/Form';
import { getReduxConst } from '../utils/common';

export const formInitialisation = (formName, fields) => ({
  type: getReduxConst(FORM_INITIALISATION),
  formName,
  fields,
});

export const updateForm = (formName, fields) => ({
  type: getReduxConst(UPDATE_FORM),
  formName,
  fields,
});

export const setFormSubmitting = (formName, submitting) => ({
  type: getReduxConst(SET_FORM_SUBMITTING),
  formName,
  submitting,
});

/**
 * Set form submitted
 *
 * @example
 *
 * import { setFormSubmitted } from 'reform-redux';
 *
 * store.dispatch(setFormSubmitted(
 *   formName,
 *   submitted,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {boolean} submitted
 * @returns {SetFormSubmitted}
 */
export const setFormSubmitted = (formName, submitted) => ({
  type: getReduxConst(SET_FORM_SUBMITTED),
  formName,
  submitted,
});

/**
 * Reset form
 *
 * @example
 *
 * import { resetForm } from 'reform-redux';
 *
 * store.dispatch(resetForm(
 *   formName,
 *   state?: ResetState,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {ResetState} [state]
 */
export const resetForm = (formName, state) => ({
  type: getReduxConst(RESET_FORM),
  formName,
  state,
});
