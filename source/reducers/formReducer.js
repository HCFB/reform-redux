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

/**
 * initial | empty
 * @typedef {string} ResetState
 */

export const createFormReducer = ({
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
}) => {
  const initialState = {
    valid: true,
    submitted: false,
    submitting: false,
    changed: false,
    touched: false,
    fields: {},
  };
  let initialFormState = initialState;
  let emptyFormState = initialState;
  let multipleFormsWasInitialized = false;

  const reducers = {
    [getReduxConst(RESET_FORM)]: (state, action) => {
      return action.state === 'initial' ? map(initialFormState) : map(emptyFormState);
    },
    [getReduxConst(RESET_FIELD)]: (state, action, statePrefix) => {
      const newState = map(state);
      const resetToState = action.state === 'initial' ? initialFormState : emptyFormState;
      const fieldPath = [...statePrefix, 'fields', action.fieldName];

      if (hasIn(newState, fieldPath)) {
        return setIn(newState, fieldPath, getIn(resetToState, fieldPath));
      }

      return newState;
    },
    [getReduxConst(RESET_FIELDS)]: (state, action, statePrefix) => {
      let newState = map(state);
      const resetToState = action.state === 'initial' ? initialFormState : emptyFormState;

      action.fieldsNames.forEach(fieldName => {
        const fieldPath = [...statePrefix, 'fields', fieldName];

        if (hasIn(newState, fieldPath)) {
          newState = setIn(newState, fieldPath, getIn(resetToState, fieldPath));
        }
      });

      return newState;
    },
    [getReduxConst(REMOVE_FIELD)]: (state, action, statePrefix) => {
      const newState = map(state);
      const fieldPath = [...statePrefix, 'fields', action.fieldName];

      if (hasIn(newState, fieldPath)) {
        return deleteIn(newState, fieldPath);
      }

      return newState;
    },
    [getReduxConst(CHANGE_FIELDS_VALUES)]: (state, action, statePrefix) => {
      let newState = map(state);
      const fieldsValues = action.fieldsValues;

      keys(fieldsValues).forEach(fieldKey => {
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
    [getReduxConst(SET_FORM_SUBMITTING)]: (state, action, statePrefix) => {
      let newState = map(state);

      return setIn(newState, [...statePrefix, 'submitting'], action.submitting);
    },
    [getReduxConst(FORM_INITIALISATION)]: (state, action, statePrefix) => {
      const fields = map(action.fields);
      const touched = keys(fields).some(fieldKey => getIn(fields, [fieldKey, 'touched']));
      const changed = keys(fields).some(fieldKey => getIn(fields, [fieldKey, 'changed']));
      const formState = merge(initialState, {
        fields: map(fields),
        valid: true,
        touched,
        changed,
      });
      const emptyFields = keys(fields).reduce((accumulator, emptyFieldKey) => {
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
      const initialEmptyFormState = merge(initialState, {
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
    [getReduxConst(UPDATE_FORM)]: (state, action, statePrefix) => {
      let newState = map(state);

      keys(action.fields).forEach(fieldKey => {
        newState = setIn(newState, [...statePrefix, 'fields', fieldKey], action.fields[fieldKey]);
      });

      keys(getIn(newState, [...statePrefix, 'fields'])).forEach(fieldKey => {
        if (!getIn(action.fields, [fieldKey])) {
          newState = deleteIn(newState, [...statePrefix, 'fields', fieldKey]);
        }
      });

      return newState;
    },
    [getReduxConst(CHANGE_FIELD_VALUE)]: (state, action, statePrefix) => {
      let newState = map(state);

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
    [getReduxConst(SET_FIELDS_DISABLED)]: (state, action, statePrefix) => {
      let newState = map(state);

      keys(action.disabledFields).forEach(disabledField => {
        newState = setIn(
          newState,
          [...statePrefix, 'fields', disabledField, 'disabled'],
          getIn(action.disabledFields, [disabledField]),
        );
      });

      return newState;
    },
    [getReduxConst(SET_FIELD_DISABLED)]: (state, action, statePrefix) => {
      if (hasIn(state, [...statePrefix, 'fields', action.fieldName])) {
        return setIn(
          state,
          [...statePrefix, 'fields', action.fieldName, 'disabled'],
          action.disabled,
        );
      }

      return state;
    },
    [getReduxConst(SET_FIELD_HIDDEN)]: (state, action, statePrefix) => {
      if (hasIn(state, [...statePrefix, 'fields', action.fieldName])) {
        return setIn(
          state,
          [...statePrefix, 'fields', action.fieldName, 'hidden'],
          action.fieldHidden,
        );
      }

      return state;
    },
    [getReduxConst(SET_FIELD_TOUCHED)]: (state, action, statePrefix) => {
      let newState = map(state);

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
      const touched = Boolean(keys(fields).find(fieldKey => getIn(fields, [fieldKey, 'touched'])));
      newState = setIn(newState, [...statePrefix, 'touched'], touched);

      return newState;
    },
    [getReduxConst(SET_FIELDS_TOUCHED)]: (state, action, statePrefix) => {
      let newState = map(state);

      keys(action.touchedFields).forEach(touchedField => {
        // Change field
        newState = setIn(
          newState,
          [...statePrefix, 'fields', touchedField, 'touched'],
          getIn(action.touchedFields, [touchedField]),
        );
      });

      // Change form
      const fields = getIn(newState, [...statePrefix, 'fields']);
      const touched = Boolean(keys(fields).find(fieldKey => getIn(fields, [fieldKey, 'touched'])));
      newState = setIn(newState, [...statePrefix, 'touched'], touched);

      return newState;
    },
    [getReduxConst(SET_FIELDS_HIDDEN)]: (state, action, statePrefix) => {
      let newState = map(state);

      keys(action.hiddenFields).forEach(hiddenField => {
        newState = setIn(
          newState,
          [...statePrefix, 'fields', hiddenField, 'hidden'],
          getIn(action.hiddenFields, [hiddenField]),
        );
      });

      return newState;
    },
    [getReduxConst(SET_FIELD_CHANGED)]: (state, action, statePrefix) => {
      let newState = map(state);

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
      const changed = Boolean(keys(fields).find(fieldKey => getIn(fields, [fieldKey, 'changed'])));
      newState = setIn(newState, [...statePrefix, 'changed'], changed);

      return newState;
    },
    [getReduxConst(SET_FIELDS_CHANGED)]: (state, action, statePrefix) => {
      let newState = map(state);

      keys(action.changedFields).forEach(changedField => {
        // Change field
        newState = setIn(
          newState,
          [...statePrefix, 'fields', changedField, 'changed'],
          getIn(action.changedFields, [changedField]),
        );
      });

      // Change form
      const fields = getIn(newState, [...statePrefix, 'fields']);
      const changed = Boolean(keys(fields).find(fieldKey => getIn(fields, [fieldKey, 'changed'])));
      newState = setIn(newState, [...statePrefix, 'changed'], changed);

      return newState;
    },
    [getReduxConst(SET_FIELD_ERRORS)]: (state, action, statePrefix) => {
      let newState = map(state);
      const fieldPath = [...statePrefix, 'fields', action.fieldName];
      newState = setIn(newState, [...fieldPath, 'errors'], list(action.errors));

      if (listSize(action.errors)) {
        newState = setIn(newState, [...fieldPath, 'valid'], false);
        newState = setIn(newState, [...statePrefix, 'valid'], false);
      } else {
        newState = setIn(newState, [...fieldPath, 'valid'], true);

        let formValid = true;
        keys(getIn(newState, [...statePrefix, 'fields'])).forEach(fieldKey => {
          if (!getIn(newState, [...statePrefix, 'fields', fieldKey, 'valid'])) {
            formValid = false;
          }
        });

        newState = setIn(newState, [...statePrefix, 'valid'], formValid);
      }

      return newState;
    },
    [getReduxConst(SET_FIELDS_ERRORS)]: (state, action, statePrefix) => {
      let newState = map(state);
      const fieldsErrors = action.fieldsErrors;

      keys(fieldsErrors).forEach(fieldKey => {
        const fieldErrors = getIn(fieldsErrors, [fieldKey]);
        const fieldPath = [...statePrefix, 'fields', fieldKey];
        newState = setIn(newState, [...fieldPath, 'errors'], fieldErrors);

        if (listSize(fieldErrors)) {
          newState = setIn(newState, [...fieldPath, 'valid'], false);
        } else {
          newState = setIn(newState, [...fieldPath, 'valid'], true);
        }
      });

      // Check that form is valid or not

      const stateFields = getIn(newState, [...statePrefix, 'fields']);
      let formValid = true;
      keys(stateFields).forEach(fieldKey => {
        if (!getIn(stateFields, [fieldKey, 'valid'])) {
          formValid = false;
        }
      });

      newState = setIn(newState, [...statePrefix, 'valid'], formValid);

      return newState;
    },
    [getReduxConst(SET_FORM_SUBMITTED)]: (state, action, statePrefix) => {
      let newState = map(state);
      newState = setIn(newState, [...statePrefix, 'submitted'], action.submitted);
      return newState;
    },
  };

  /**
   * Create form reducer.
   * @callback formReducerCreator
   * @param {string} formName
   */
  return formName => {
    return (state = initialState, action) => {
      if (getFormNameWihoutKey(action.formName) !== formName) return state;

      const formNameKey = getFormNameKey(action.formName);
      const statePrefix = formNameKey ? [formNameKey] : [];
      const reducer = reducers[action.type];
      return reducer ? reducer(state, action, statePrefix) : state;
    };
  };
};
