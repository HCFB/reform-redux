import {
  FORM_INITIALISATION,
  RESET_FORM,
  SET_FORM_SUBMITTING,
  UPDATE_FORM,
} from '../constants/Form';
import type { ResetState } from '../types/formReducer';
import { getReduxConst } from '../utils/common';
import type { FieldsData } from '../types/Field';
import type { FormInitialisation, SetFormSubmitting, ResetForm, UpdateForm } from '../types/Form';

export const formInitialisation: Function = (
  formName: string,
  fields: FieldsData,
): FormInitialisation => ({
  type: getReduxConst(FORM_INITIALISATION),
  formName,
  fields,
});

export const updateForm: Function = (formName: string, fields: FieldsData): UpdateForm => ({
  type: getReduxConst(UPDATE_FORM),
  formName,
  fields,
});

export const setFormSubmitting: Function = (
  formName: string,
  submitting: boolean,
): SetFormSubmitting => ({
  type: getReduxConst(SET_FORM_SUBMITTING),
  formName,
  submitting,
});

export const resetForm: Function = (formName: string, state?: ResetState): ResetForm => ({
  type: getReduxConst(RESET_FORM),
  formName,
  state,
});
