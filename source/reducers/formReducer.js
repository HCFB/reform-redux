import {
  FORM_INITIALISATION,
  RESET_FORM,
  SET_FORM_SUBMITTED,
  SET_FORM_SUBMITTING,
  UPDATE_FORM,
} from '../constants/Form';
import {
  REMOVE_FIELD,
  CHANGE_FIELD_VALUE,
  CHANGE_FIELDS_VALUES,
  SET_FIELD_ERRORS,
  SET_FIELDS_ERRORS,
  SET_FIELD_DISABLED,
  SET_FIELDS_DISABLED,
  RESET_FIELD,
  RESET_FIELDS,
  SET_FIELD_TOUCHED,
  SET_FIELDS_TOUCHED,
  SET_FIELD_CHANGED,
  SET_FIELDS_CHANGED,
  SET_FIELDS_HIDDEN,
  SET_FIELD_HIDDEN,
} from '../constants/Field';
import { getReduxConst, getFormNameKey, getFormNameWihoutKey } from '../utils/common';
import type { State, Action } from '../types/formReducer';
import type {
  FieldsData,
  ChangeFieldsValues,
  ChangeFieldValue,
  SetFieldsDisabled,
  SetFieldDisabled,
  SetFieldHidden,
  SetFieldsHidden,
  SetFieldErrors,
  SetFieldsErrors,
  ResetField,
  FieldsValues,
  ResetFields,
  FieldName,
  SetFieldTouched,
  SetFieldsTouched,
  RemoveField,
  SetFieldsChanged,
  SetFieldChanged,
  SetFormSubmitted,
} from '../types/Field';
import type { FormInitialisation, SetFormSubmitting, UpdateForm, ResetForm } from '../types/Form';
import type { DataFunctions } from '../types/dataFunctions';

/**
 * initial | empty
 * @typedef {string} ResetState
 */

export const createFormReducer: Function = ({
  map,
  hasIn,
  setIn,
  getIn,
  merge,
  deleteIn,
  listSize,
  keys,
  list,
  isList,
}: DataFunctions) => {
  const initialState: State = {
    valid: true,
    submitted: false,
    submitting: false,
    changed: false,
    touched: false,
    fields: {},
  };
  let initialFormState: State = initialState;
  let emptyFormState: State = initialState;
  let multipleFormsWasInitialized: boolean = false;

  const reducers: {
    [reducerName: string]: (state: State, action: Action, statePrefix: Array<string>) => State,
  } = {
    [getReduxConst(RESET_FORM)]: (state: State, action: ResetForm): State => {
      return action.state === 'initial' ? map(initialFormState) : map(emptyFormState);
    },
    [getReduxConst(RESET_FIELD)]: (
      state: State,
      action: ResetField,
      statePrefix: Array<string>,
    ): State => {
      const newState: State = map(state);
      const resetToState: State = action.state === 'initial' ? initialFormState : emptyFormState;
      const fieldPath: Array<string> = [...statePrefix, 'fields', action.fieldName];

      if (hasIn(newState, fieldPath)) {
        return setIn(newState, fieldPath, getIn(resetToState, fieldPath));
      }

      return newState;
    },
    [getReduxConst(RESET_FIELDS)]: (
      state: State,
      action: ResetFields,
      statePrefix: Array<string>,
    ): State => {
      let newState = map(state);
      const resetToState: State = action.state === 'initial' ? initialFormState : emptyFormState;

      action.fieldsNames.forEach((fieldName: FieldName) => {
        const fieldPath: Array<string> = [...statePrefix, 'fields', fieldName];

        if (hasIn(newState, fieldPath)) {
          newState = setIn(newState, fieldPath, getIn(resetToState, fieldPath));
        }
      });

      return newState;
    },
    [getReduxConst(REMOVE_FIELD)]: (
      state: State,
      action: RemoveField,
      statePrefix: Array<string>,
    ): State => {
      const newState: State = map(state);
      const fieldPath: Array<string> = [...statePrefix, 'fields', action.fieldName];

      if (hasIn(newState, fieldPath)) {
        return deleteIn(newState, fieldPath);
      }

      return newState;
    },
    [getReduxConst(CHANGE_FIELDS_VALUES)]: (
      state: State,
      action: ChangeFieldsValues,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);
      const fieldsValues: FieldsValues = action.fieldsValues;

      keys(fieldsValues).forEach((fieldKey: string) => {
        if (hasIn(state, [...statePrefix, 'fields', fieldKey])) {
          // Change form
          newState = setIn(newState, [...statePrefix, 'changed'], true);

          // Change field
          newState = setIn(
            newState,
            [...statePrefix, 'fields', fieldKey, 'value'],
            getIn(fieldsValues, [fieldKey]),
          );
          newState = setIn(newState, [...statePrefix, 'fields', fieldKey, 'changed'], true);
        }
      });

      return newState;
    },
    [getReduxConst(SET_FORM_SUBMITTING)]: (
      state: State,
      action: SetFormSubmitting,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);

      return setIn(newState, [...statePrefix, 'submitting'], action.submitting);
    },
    [getReduxConst(FORM_INITIALISATION)]: (
      state: State,
      action: FormInitialisation,
      statePrefix: Array<string>,
    ): State => {
      const fields = map(action.fields);
      const touched: boolean = keys(fields).some((fieldKey: string) =>
        getIn(fields, [fieldKey, 'touched']),
      );
      const changed: boolean = keys(fields).some((fieldKey: string) =>
        getIn(fields, [fieldKey, 'changed']),
      );
      const formState = (merge(initialState, {
        fields: map(fields),
        valid: true,
        touched,
        changed,
      }): any);
      const emptyFields: FieldsData = keys(fields).reduce((accumulator, emptyFieldKey: string) => {
        return merge(
          accumulator,
          map({
            [emptyFieldKey]: map({
              value: isList(getIn(fields, [emptyFieldKey, 'value'])) ? list([]) : '',
              valid: true,
              changed: false,
              touched: false,
              errors: list([]),
              disabled: false,
            }),
          }),
        );
      }, map({}));
      const initialEmptyFormState: any = merge(initialState, {
        fields: map(emptyFields),
        valid: true,
      });

      if (statePrefix.length) {
        if (!multipleFormsWasInitialized) {
          initialFormState = {
            [statePrefix[0]]: formState,
          };

          emptyFormState = {
            [statePrefix[0]]: initialEmptyFormState,
          };

          multipleFormsWasInitialized = true;
        } else {
          emptyFormState[statePrefix[0]] = initialEmptyFormState;
          initialFormState[statePrefix[0]] = formState;
        }
      } else {
        emptyFormState = initialEmptyFormState;
        initialFormState = formState;
      }

      return map(initialFormState);
    },
    [getReduxConst(UPDATE_FORM)]: (
      state: State,
      action: UpdateForm,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);

      keys(action.fields).forEach((fieldKey: string) => {
        newState = setIn(newState, [...statePrefix, 'fields', fieldKey], action.fields[fieldKey]);
      });

      keys(getIn(newState, [...statePrefix, 'fields'])).forEach((fieldKey: string) => {
        if (!getIn(action.fields, [fieldKey])) {
          newState = deleteIn(newState, [...statePrefix, 'fields', fieldKey]);
        }
      });

      return newState;
    },
    [getReduxConst(CHANGE_FIELD_VALUE)]: (
      state: State,
      action: ChangeFieldValue,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);

      if (hasIn(state, [...statePrefix, 'fields', action.fieldName])) {
        // Change form
        newState = setIn(newState, [...statePrefix, 'changed'], true);

        // Change field
        newState = setIn(
          newState,
          [...statePrefix, 'fields', action.fieldName, 'value'],
          action.fieldValue,
        );
        newState = setIn(newState, [...statePrefix, 'fields', action.fieldName, 'changed'], true);
      }

      return newState;
    },
    [getReduxConst(SET_FIELDS_DISABLED)]: (
      state: State,
      action: SetFieldsDisabled,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);

      keys(action.disabledFields).forEach((disabledField: string) => {
        newState = setIn(
          newState,
          [...statePrefix, 'fields', disabledField, 'disabled'],
          getIn(action.disabledFields, [disabledField]),
        );
      });

      return newState;
    },
    [getReduxConst(SET_FIELD_DISABLED)]: (
      state: State,
      action: SetFieldDisabled,
      statePrefix: Array<string>,
    ): State => {
      if (hasIn(state, [...statePrefix, 'fields', action.fieldName])) {
        return setIn(
          state,
          [...statePrefix, 'fields', action.fieldName, 'disabled'],
          action.disabled,
        );
      }

      return state;
    },
    [getReduxConst(SET_FIELD_HIDDEN)]: (
      state: State,
      action: SetFieldHidden,
      statePrefix: Array<string>,
    ): State => {
      if (hasIn(state, [...statePrefix, 'fields', action.fieldName])) {
        return setIn(
          state,
          [...statePrefix, 'fields', action.fieldName, 'hidden'],
          action.fieldHidden,
        );
      }

      return state;
    },
    [getReduxConst(SET_FIELD_TOUCHED)]: (
      state: State,
      action: SetFieldTouched,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);

      if (hasIn(state, [...statePrefix, 'fields', action.fieldName])) {
        // Change field
        newState = setIn(
          newState,
          [...statePrefix, 'fields', action.fieldName, 'touched'],
          action.fieldTouched,
        );
      }

      // Change form
      const fields = getIn(newState, [...statePrefix, 'fields']);
      const touched = Boolean(
        keys(fields).find((fieldKey: string) => getIn(fields, [fieldKey, 'touched'])),
      );
      newState = setIn(newState, [...statePrefix, 'touched'], touched);

      return newState;
    },
    [getReduxConst(SET_FIELDS_TOUCHED)]: (
      state: State,
      action: SetFieldsTouched,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);

      keys(action.touchedFields).forEach((touchedField: string) => {
        // Change field
        newState = setIn(
          newState,
          [...statePrefix, 'fields', touchedField, 'touched'],
          getIn(action.touchedFields, [touchedField]),
        );
      });

      // Change form
      const fields = getIn(newState, [...statePrefix, 'fields']);
      const touched = Boolean(
        keys(fields).find((fieldKey: string) => getIn(fields, [fieldKey, 'touched'])),
      );
      newState = setIn(newState, [...statePrefix, 'touched'], touched);

      return newState;
    },
    [getReduxConst(SET_FIELDS_HIDDEN)]: (
      state: State,
      action: SetFieldsHidden,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);

      keys(action.hiddenFields).forEach((hiddenField: string) => {
        newState = setIn(
          newState,
          [...statePrefix, 'fields', hiddenField, 'hidden'],
          getIn(action.hiddenFields, [hiddenField]),
        );
      });

      return newState;
    },
    [getReduxConst(SET_FIELD_CHANGED)]: (
      state: State,
      action: SetFieldChanged,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);

      if (hasIn(state, [...statePrefix, 'fields', action.fieldName])) {
        // Change field
        newState = setIn(
          newState,
          [...statePrefix, 'fields', action.fieldName, 'changed'],
          action.fieldChanged,
        );
      }

      // Change form
      const fields = getIn(newState, [...statePrefix, 'fields']);
      const changed = Boolean(
        keys(fields).find((fieldKey: string) => getIn(fields, [fieldKey, 'changed'])),
      );
      newState = setIn(newState, [...statePrefix, 'changed'], changed);

      return newState;
    },
    [getReduxConst(SET_FIELDS_CHANGED)]: (
      state: State,
      action: SetFieldsChanged,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);

      keys(action.changedFields).forEach((changedField: string) => {
        // Change field
        newState = setIn(
          newState,
          [...statePrefix, 'fields', changedField, 'changed'],
          getIn(action.changedFields, [changedField]),
        );
      });

      // Change form
      const fields = getIn(newState, [...statePrefix, 'fields']);
      const changed = Boolean(
        keys(fields).find((fieldKey: string) => getIn(fields, [fieldKey, 'changed'])),
      );
      newState = setIn(newState, [...statePrefix, 'changed'], changed);

      return newState;
    },
    [getReduxConst(SET_FIELD_ERRORS)]: (
      state: State,
      action: SetFieldErrors,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);
      const fieldPath: Array<string> = [...statePrefix, 'fields', action.fieldName];
      newState = setIn(newState, [...fieldPath, 'errors'], list(action.errors));

      if (listSize(action.errors)) {
        newState = setIn(newState, [...fieldPath, 'valid'], false);
        newState = setIn(newState, [...statePrefix, 'valid'], false);
      } else {
        newState = setIn(newState, [...fieldPath, 'valid'], true);

        let formValid: boolean = true;
        keys(getIn(newState, [...statePrefix, 'fields'])).forEach((fieldKey: string) => {
          if (!getIn(newState, [...statePrefix, 'fields', fieldKey, 'valid'])) {
            formValid = false;
          }
        });

        newState = setIn(newState, [...statePrefix, 'valid'], formValid);
      }

      return newState;
    },
    [getReduxConst(SET_FIELDS_ERRORS)]: (
      state: State,
      action: SetFieldsErrors,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);
      const fieldsErrors: { [fieldName: FieldName]: Array<string> } = action.fieldsErrors;

      keys(fieldsErrors).forEach((fieldKey: string) => {
        const fieldErrors: Array<string> = getIn(fieldsErrors, [fieldKey]);
        const fieldPath: Array<string> = [...statePrefix, 'fields', fieldKey];
        newState = setIn(newState, [...fieldPath, 'errors'], fieldErrors);

        if (listSize(fieldErrors)) {
          newState = setIn(newState, [...fieldPath, 'valid'], false);
        } else {
          newState = setIn(newState, [...fieldPath, 'valid'], true);
        }
      });

      // Check that form is valid or not

      const stateFields: FieldsData = getIn(newState, [...statePrefix, 'fields']);
      let formValid: boolean = true;
      keys(stateFields).forEach((fieldKey: string) => {
        if (!getIn(stateFields, [fieldKey, 'valid'])) {
          formValid = false;
        }
      });

      newState = setIn(newState, [...statePrefix, 'valid'], formValid);

      return newState;
    },
    [getReduxConst(SET_FORM_SUBMITTED)]: (
      state: State,
      action: SetFormSubmitted,
      statePrefix: Array<string>,
    ): State => {
      let newState: State = map(state);
      newState = setIn(newState, [...statePrefix, 'submitted'], action.submitted);
      return newState;
    },
  };

  /**
   * Create form reducer.
   * @callback formReducerCreator
   * @param {string} formName
   */
  return (formName: string) => {
    return (state: State = initialState, action: Action): State => {
      if (getFormNameWihoutKey(action.formName) !== formName) return state;

      const formNameKey: string = getFormNameKey(action.formName);
      const statePrefix: Array<string> = formNameKey ? [formNameKey] : [];
      const reducer = reducers[action.type];
      return reducer ? reducer(state, action, statePrefix) : state;
    };
  };
};
