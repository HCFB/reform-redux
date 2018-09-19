import type { FieldsData } from './Field';
import type {
  ChangeFieldValue,
  ChangeFieldsValues,
  SetFieldErrors,
  SetFieldsErrors,
  SetFieldDisabled,
  SetFieldsDisabled,
  ResetField,
  ResetFields,
} from '../types/Field';
import type { FormInitialisation, ResetForm, UpdateForm, SetFormSubmitting } from '../types/Form';

export type Action =
  | ResetField
  | ResetFields
  | ChangeFieldValue
  | ChangeFieldsValues
  | FormInitialisation
  | SetFieldErrors
  | SetFieldsErrors
  | ResetForm
  | UpdateForm
  | SetFormSubmitting
  | SetFieldDisabled
  | SetFieldsDisabled;

export type State = {
  valid: boolean,
  changed: boolean,
  touched: boolean,
  submitted: boolean,
  submitting: boolean,
  fields: FieldsData,
};
