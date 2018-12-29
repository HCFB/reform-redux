import { formReducerCreator } from '../../index';
import { getReduxConst } from '../../utils/common';
import {
  SET_FIELDS_ERRORS,
  SET_FIELD_ERRORS,
  SET_FIELD_DISABLED,
  SET_FIELDS_DISABLED,
  CHANGE_FIELD_VALUE,
  CHANGE_FIELDS_VALUES,
  RESET_FIELDS,
  RESET_FIELD,
  REMOVE_FIELD,
} from '../../constants/Field';
import {
  UPDATE_FORM,
  FORM_INITIALISATION,
  SET_FORM_SUBMITTING,
  RESET_FORM,
} from '../../constants/Form';

describe('reducers/formReducer', () => {
  const state = {
    valid: true,
    submitted: false,
    submitting: false,
    fields: {
      field: {
        disabled: false,
        value: '',
        valid: true,
        errors: [],
      },
    },
  };

  it('if pass undefined formName then reducer just return not modified state', () => {
    const action = formReducerCreator('form');
    const newState = action(state, {
      formName: 'form1',
    });

    expect(newState).toEqual(state);
  });

  it('if pass undefined action type then reducer just return not modified state', () => {
    const action = formReducerCreator('form');
    const newState = action(state, {
      formName: 'form',
      type: 'test',
    });

    expect(newState).toEqual(state);
  });

  it('SET_FIELDS_ERRORS', () => {
    expect.assertions(4);

    const action = formReducerCreator('form');
    const newState = action(state, {
      type: getReduxConst(SET_FIELDS_ERRORS),
      formName: 'form',
      fieldsErrors: {
        field: ['first error'],
      },
    });

    expect(newState.fields.field.errors).toEqual(['first error']);
    expect(newState.valid).toBeFalsy();

    const newState2 = action(newState, {
      type: getReduxConst(SET_FIELDS_ERRORS),
      formName: 'form',
      fieldsErrors: {
        field: [],
      },
    });

    expect(newState2.fields.field.errors).toEqual([]);
    expect(newState2.valid).toBeTruthy();
  });

  it('SET_FIELD_ERRORS', () => {
    expect.assertions(4);

    const action = formReducerCreator('form');
    const newState = action(state, {
      type: getReduxConst(SET_FIELD_ERRORS),
      formName: 'form',
      fieldName: 'field',
      errors: ['first error'],
    });

    expect(newState.fields.field.errors).toEqual(['first error']);
    expect(newState.valid).toBeFalsy();

    const newState2 = action(newState, {
      type: getReduxConst(SET_FIELD_ERRORS),
      formName: 'form',
      fieldName: 'field',
      errors: [],
    });

    expect(newState2.fields.field.errors).toEqual([]);
    expect(newState2.valid).toBeTruthy();
  });

  it('SET_FIELD_DISABLED', () => {
    const action = formReducerCreator('form');
    const newState = action(state, {
      type: getReduxConst(SET_FIELD_DISABLED),
      formName: 'form',
      fieldName: 'field',
      disabled: true,
    });

    expect(newState.fields.field.disabled).toBeTruthy();
  });

  it('SET_FIELDS_DISABLED', () => {
    const action = formReducerCreator('form');
    const newState = action(state, {
      type: getReduxConst(SET_FIELDS_DISABLED),
      formName: 'form',
      disabledFields: {
        field: true,
      },
    });

    expect(newState.fields.field.disabled).toBeTruthy();
  });

  it('CHANGE_FIELD_VALUE', () => {
    const action = formReducerCreator('form');
    const newState = action(state, {
      type: getReduxConst(CHANGE_FIELD_VALUE),
      formName: 'form',
      fieldName: 'field',
      fieldValue: 'test',
    });

    expect(newState.fields.field.value).toBe('test');
  });

  it('UPDATE_FORM', () => {
    const action = formReducerCreator('form');
    const newState = action(state, {
      type: getReduxConst(UPDATE_FORM),
      formName: 'form',
      fields: {
        field: 'new field',
        field1: 'test',
      },
    });

    expect(Object.keys(newState.fields)).toEqual(['field', 'field1']);
  });

  it('REMOVE_FIELD', () => {
    const action = formReducerCreator('form');
    const newState = action(state, {
      type: getReduxConst(REMOVE_FIELD),
      formName: 'form',
      fieldName: 'field',
    });

    expect(Object.keys(newState.fields)).toEqual([]);
  });

  it('FORM_INITIALISATION', () => {
    const action = formReducerCreator('form');
    const newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: {
        field1: 'test',
      },
    });

    expect(Object.keys(newState.fields)).toEqual(['field1']);
  });

  it('SET_FORM_SUBMITTING', () => {
    const action = formReducerCreator('form');
    const newState = action(state, {
      type: getReduxConst(SET_FORM_SUBMITTING),
      formName: 'form',
      submitting: true,
    });

    expect(newState.submitting).toBeTruthy();
  });

  it('CHANGE_FIELDS_VALUES', () => {
    const action = formReducerCreator('form');
    const newState = action(state, {
      type: getReduxConst(CHANGE_FIELDS_VALUES),
      formName: 'form',
      fieldsValues: {
        field: 'test',
      },
    });

    expect(newState.fields.field.value).toBe('test');
  });

  it('RESET_FIELDS', () => {
    expect.assertions(2);
    const action = formReducerCreator('form');
    let newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: {
        field: {
          disabled: false,
          value: 'initial',
          valid: true,
          errors: [],
        },
      },
    });

    newState = action(newState, {
      type: getReduxConst(CHANGE_FIELD_VALUE),
      formName: 'form',
      fieldName: 'field',
      fieldValue: 'changed',
    });

    newState = action(newState, {
      type: getReduxConst(RESET_FIELDS),
      formName: 'form',
      fieldsNames: ['field'],
      state: 'initial',
    });

    expect(newState.fields.field.value).toBe('initial');

    newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: {
        field: {
          disabled: false,
          value: 'initial',
          valid: true,
          errors: [],
        },
      },
    });

    newState = action(newState, {
      type: getReduxConst(CHANGE_FIELD_VALUE),
      formName: 'form',
      fieldName: 'field',
      fieldValue: 'changed',
    });

    newState = action(newState, {
      type: getReduxConst(RESET_FIELDS),
      formName: 'form',
      fieldsNames: ['field'],
    });

    expect(newState.fields.field.value).toBe('');
  });

  it('RESET_FIELD', () => {
    expect.assertions(2);
    const action = formReducerCreator('form');
    let newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: {
        field: {
          disabled: false,
          value: 'initial',
          valid: true,
          errors: [],
        },
      },
    });

    newState = action(newState, {
      type: getReduxConst(CHANGE_FIELD_VALUE),
      formName: 'form',
      fieldName: 'field',
      fieldValue: 'changed',
    });

    newState = action(newState, {
      type: getReduxConst(RESET_FIELD),
      formName: 'form',
      fieldName: 'field',
      state: 'initial',
    });

    expect(newState.fields.field.value).toBe('initial');

    newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: {
        field: {
          disabled: false,
          value: 'initial',
          valid: true,
          errors: [],
        },
      },
    });

    newState = action(newState, {
      type: getReduxConst(CHANGE_FIELD_VALUE),
      formName: 'form',
      fieldName: 'field',
      fieldValue: 'changed',
    });

    newState = action(newState, {
      type: getReduxConst(RESET_FIELD),
      formName: 'form',
      fieldName: 'field',
    });

    expect(newState.fields.field.value).toBe('');
  });

  it('RESET_FORM', () => {
    expect.assertions(2);
    const action = formReducerCreator('form');
    let newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: {
        field: {
          disabled: false,
          value: 'initial',
          valid: true,
          errors: [],
        },
      },
    });

    newState = action(newState, {
      type: getReduxConst(CHANGE_FIELD_VALUE),
      formName: 'form',
      fieldName: 'field',
      fieldValue: 'changed',
    });

    newState = action(newState, {
      type: getReduxConst(RESET_FORM),
      formName: 'form',
      state: 'initial',
    });

    expect(newState.fields.field.value).toBe('initial');

    newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: {
        field: {
          disabled: false,
          value: 'initial',
          valid: true,
          errors: [],
        },
      },
    });

    newState = action(newState, {
      type: getReduxConst(CHANGE_FIELD_VALUE),
      formName: 'form',
      fieldName: 'field',
      fieldValue: 'changed',
    });

    newState = action(newState, {
      type: getReduxConst(RESET_FORM),
      formName: 'form',
    });

    expect(newState.fields.field.value).toBe('');
  });
});
