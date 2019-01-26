import {
  FORM_INITIALISATION,
  RESET_FORM,
  SET_FORM_SUBMITTING,
  UPDATE_FORM,
  SET_FORM_SUBMITTED,
} from '../constants/Form';
import type { ResetState } from '../types/formReducer';
import { getReduxConst } from '../utils/common';
import type { FieldsData } from '../types/Field';
import type {
  FormInitialisation,
  SetFormSubmitting,
  ResetForm,
  UpdateForm,
  SetFormSubmitted,
} from '../types/Form';

export const formInitialisation = (formName: string, fields: FieldsData): FormInitialisation => ({
  type: getReduxConst(FORM_INITIALISATION),
  formName,
  fields,
});

export const updateForm = (formName: string, fields: FieldsData): UpdateForm => ({
  type: getReduxConst(UPDATE_FORM),
  formName,
  fields,
});

export const setFormSubmitting = (formName: string, submitting: boolean): SetFormSubmitting => ({
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
 *   formName: string,
 *   submitted: boolean,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {boolean} submitted
 * @returns {SetFormSubmitted}
 */
export const setFormSubmitted = (formName: string, submitted: boolean): SetFormSubmitted => ({
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
 *   formName: string,
 *   state?: ResetState,
 * ));
 *
 * @callback
 * @param {string} formName
 * @param {ResetState} [state]
 */
export const resetForm = (formName: string, state?: ResetState): ResetForm => ({
  type: getReduxConst(RESET_FORM),
  formName,
  state,
});
