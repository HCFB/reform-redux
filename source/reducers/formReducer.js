import {
  FORM_INITIALISATION,
  RESET_FORM,
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
} from '../constants/Field';
import { getReduxConst } from '../utils/common';
import type { State, Action } from '../types/formReducer';
import type {
  FieldsData,
  ChangeFieldsValues,
  ChangeFieldValue,
  SetFieldsDisabled,
  SetFieldDisabled,
  SetFieldErrors,
  SetFieldsErrors,
  ResetField,
  FieldsValues,
  ResetFields,
  FieldName,
  SetFieldTouched,
  SetFieldsTouched,
  RemoveField,
} from '../types/Field';
import type { FormInitialisation, SetFormSubmitting, UpdateForm, ResetForm } from '../types/Form';
import type { DataFunctions } from '../types/dataFunctions';

export const createFormReducer: Function = ({
  fromJS,
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
  const initialState: State = fromJS({
    valid: true,
    submitted: false,
    submitting: false,
    changed: false,
    touched: false,
    fields: map({}),
  });
  let initialFormState: State = map(initialState);
  let emptyFormState: State = map(initialState);

  const reducers: {
    [reducerName: string]: (state: State, action?: Action) => State,
  } = {
    [getReduxConst(RESET_FORM)]: (state: State, action: ResetForm): State => {
      return action.state === 'initial' ? map(initialFormState) : map(emptyFormState);
    },
    [getReduxConst(RESET_FIELD)]: (state: State, action: ResetField): State => {
      const newState: State = map(state);
      const resetToState: State = action.state === 'initial' ? initialFormState : emptyFormState;

      if (hasIn(newState, ['fields', action.fieldName])) {
        return setIn(
          newState,
          ['fields', action.fieldName],
          getIn(resetToState, ['fields', action.fieldName]),
        );
      }

      return newState;
    },
    [getReduxConst(RESET_FIELDS)]: (state: State, action: ResetFields): State => {
      let newState = map(state);
      const resetToState: State = action.state === 'initial' ? initialFormState : emptyFormState;

      action.fieldsNames.forEach((fieldName: FieldName) => {
        if (hasIn(newState, ['fields', fieldName])) {
          newState = setIn(
            newState,
            ['fields', fieldName],
            getIn(resetToState, ['fields', fieldName]),
          );
        }
      });

      return newState;
    },
    [getReduxConst(REMOVE_FIELD)]: (state: State, action: RemoveField): State => {
      const newState: State = map(state);

      if (hasIn(newState, ['fields', action.fieldName])) {
        return deleteIn(newState, ['fields', action.fieldName]);
      }

      return newState;
    },
    [getReduxConst(CHANGE_FIELDS_VALUES)]: (state: State, action: ChangeFieldsValues): State => {
      let newState: State = map(state);
      const fieldsValues: FieldsValues = action.fieldsValues;

      keys(fieldsValues).forEach((fieldKey: string) => {
        if (hasIn(state, ['fields', fieldKey])) {
          // Change form
          newState = setIn(newState, ['changed'], true);

          // Change field
          newState = setIn(
            newState,
            ['fields', fieldKey, 'value'],
            getIn(fieldsValues, [fieldKey]),
          );
          newState = setIn(newState, ['fields', fieldKey, 'changed'], true);
        }
      });

      return newState;
    },
    [getReduxConst(SET_FORM_SUBMITTING)]: (state: State, action: SetFormSubmitting): State => {
      let newState: State = map(state);

      if (!action.submitting) newState = setIn(newState, ['submitted'], true);

      return setIn(newState, ['submitting'], action.submitting);
    },
    [getReduxConst(FORM_INITIALISATION)]: (state: State, action: FormInitialisation): State => {
      const fields = map(action.fields);
      const touched: boolean = keys(fields).some((fieldKey: string) =>
        getIn(fields, [fieldKey, 'touched']),
      );
      const changed: boolean = keys(fields).some((fieldKey: string) =>
        getIn(fields, [fieldKey, 'changed']),
      );

      initialFormState = (merge(state, {
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

      emptyFormState = merge(state, {
        fields: map(emptyFields),
        valid: true,
      });

      return map(initialFormState);
    },
    [getReduxConst(UPDATE_FORM)]: (state: State, action: UpdateForm): State => {
      let newState: State = map(state);

      keys(action.fields).forEach((fieldKey: string) => {
        if (!hasIn(newState, ['fields', fieldKey])) {
          newState = setIn(newState, ['fields', fieldKey], action.fields[fieldKey]);
        }
      });

      keys(getIn(newState, ['fields'])).forEach((fieldKey: string) => {
        if (!getIn(action.fields, [fieldKey])) {
          newState = deleteIn(newState, ['fields', fieldKey]);
        }
      });

      return newState;
    },
    [getReduxConst(CHANGE_FIELD_VALUE)]: (state: State, action: ChangeFieldValue): State => {
      let newState: State = map(state);

      if (hasIn(state, ['fields', action.fieldName])) {
        // Change form
        newState = setIn(newState, ['changed'], true);

        // Change field
        newState = setIn(newState, ['fields', action.fieldName, 'value'], action.fieldValue);
        newState = setIn(newState, ['fields', action.fieldName, 'changed'], true);
      }

      return newState;
    },
    [getReduxConst(SET_FIELDS_DISABLED)]: (state: State, action: SetFieldsDisabled): State => {
      let newState: State = map(state);

      keys(action.disabledFields).forEach((disabledField: string) => {
        newState = setIn(
          newState,
          ['fields', disabledField, 'disabled'],
          getIn(action.disabledFields, [disabledField]),
        );
      });

      return newState;
    },
    [getReduxConst(SET_FIELD_DISABLED)]: (state: State, action: SetFieldDisabled): State => {
      if (hasIn(state, ['fields', action.fieldName])) {
        return setIn(state, ['fields', action.fieldName, 'disabled'], action.disabled);
      }

      return state;
    },
    [getReduxConst(SET_FIELD_TOUCHED)]: (state: State, action: SetFieldTouched): State => {
      let newState: State = map(state);

      if (hasIn(state, ['fields', action.fieldName])) {
        // Change form
        newState = setIn(newState, ['touched'], true);

        // Change field
        newState = setIn(newState, ['fields', action.fieldName, 'touched'], action.fieldTouched);
      }

      return newState;
    },
    [getReduxConst(SET_FIELDS_TOUCHED)]: (state: State, action: SetFieldsTouched): State => {
      let newState: State = map(state);

      keys(action.touchedFields).forEach((touchedField: string) => {
        // Change form
        newState = setIn(newState, ['touched'], true);

        // Change field
        newState = setIn(
          newState,
          ['fields', touchedField, 'touched'],
          getIn(action.touchedFields, [touchedField]),
        );
      });

      return newState;
    },
    [getReduxConst(SET_FIELD_ERRORS)]: (state: State, action: SetFieldErrors): State => {
      let newState: State = map(state);
      const fieldPath: Array<string> = ['fields', action.fieldName];
      newState = setIn(newState, [...fieldPath, 'errors'], list(action.errors));

      if (listSize(action.errors)) {
        newState = setIn(newState, [...fieldPath, 'valid'], false);
        newState = setIn(newState, ['valid'], false);
      } else {
        newState = setIn(newState, [...fieldPath, 'valid'], true);

        let formValid: boolean = true;
        keys(getIn(newState, ['fields'])).forEach((fieldKey: string) => {
          if (!getIn(newState, ['fields', fieldKey, 'valid'])) {
            formValid = false;
          }
        });

        newState = setIn(newState, ['valid'], formValid);
      }

      return newState;
    },
    [getReduxConst(SET_FIELDS_ERRORS)]: (state: State, action: SetFieldsErrors): State => {
      let newState: State = map(state);
      const fieldsErrors: { [fieldName: FieldName]: Array<string> } = action.fieldsErrors;

      keys(fieldsErrors).forEach((fieldKey: string) => {
        const fieldErrors: Array<string> = getIn(fieldsErrors, [fieldKey]);
        const fieldPath: Array<string> = ['fields', fieldKey];
        newState = setIn(newState, [...fieldPath, 'errors'], fieldErrors);

        if (listSize(fieldErrors)) {
          newState = setIn(newState, [...fieldPath, 'valid'], false);
        } else {
          newState = setIn(newState, [...fieldPath, 'valid'], true);
        }
      });

      // Check that form is valid or not

      const stateFields: FieldsData = getIn(newState, ['fields']);
      let formValid: boolean = true;
      keys(stateFields).forEach((fieldKey: string) => {
        if (!getIn(stateFields, [fieldKey, 'valid'])) {
          formValid = false;
        }
      });

      newState = setIn(newState, ['valid'], formValid);

      return newState;
    },
  };

  return (formName: string): Function => {
    return (state: State = initialState, action: Action): State => {
      if (action.formName !== formName) return state;

      const reducer = reducers[action.type];
      return reducer ? reducer(state, action) : state;
    };
  };
};
