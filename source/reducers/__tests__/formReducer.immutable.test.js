import { Map, getIn, List, is, Seq } from 'immutable';
import { formReducerCreator as immutableReducer } from '../../immutable';
import { getReduxConst } from '../../utils/common';
import {
  FORM_INITIALISATION,
  RESET_FORM,
  UPDATE_FORM,
  SET_FORM_SUBMITTING,
} from '../../constants/Form';
import {
  CHANGE_FIELD_VALUE,
  RESET_FIELD,
  SET_FIELDS_ERRORS,
  SET_FIELD_DISABLED,
  SET_FIELDS_DISABLED,
  SET_FIELD_ERRORS,
  RESET_FIELDS,
  CHANGE_FIELDS_VALUES,
} from '../../constants/Field';

describe('reducers / formReducer.immutable', () => {
  const state = Map({
    valid: true,
    submitted: false,
    submitting: false,
    fields: Map({
      field: Map({
        disabled: false,
        value: '',
        valid: true,
        errors: List(),
      }),
    }),
  });

  it('if pass undefined formName then reducer just return not modified state', () => {
    const action = immutableReducer('form');
    const newState = action(state, {
      formName: 'form1',
    });

    expect(newState.toJS()).toEqual(state.toJS());
  });

  it('if pass undefined action type then reducer just return not modified state', () => {
    const action = immutableReducer('form');
    const newState = action(state, {
      formName: 'form',
      type: 'test',
    });

    expect(newState.toJS()).toEqual(state.toJS());
  });

  it('SET_FIELDS_ERRORS', () => {
    expect.assertions(4);

    const action = immutableReducer('form');
    const newState = action(state, {
      type: getReduxConst(SET_FIELDS_ERRORS),
      formName: 'form',
      fieldsErrors: Map({
        field: List(['first error']),
      }),
    });

    expect(is(getIn(newState, ['fields', 'field', 'errors']), List(['first error']))).toBeTruthy();
    expect(getIn(newState, ['valid'])).toBeFalsy();

    const newState2 = action(newState, {
      type: getReduxConst(SET_FIELDS_ERRORS),
      formName: 'form',
      fieldsErrors: Map({
        field: List(),
      }),
    });

    expect(is(getIn(newState2, ['fields', 'field', 'errors']), List())).toBeTruthy();
    expect(getIn(newState2, ['valid'])).toBeTruthy();
  });

  it('SET_FIELD_ERRORS', () => {
    expect.assertions(4);

    const action = immutableReducer('form');
    const newState = action(state, {
      type: getReduxConst(SET_FIELD_ERRORS),
      formName: 'form',
      fieldName: 'field',
      errors: List(['first error']),
    });

    expect(is(getIn(newState, ['fields', 'field', 'errors']), List(['first error']))).toBeTruthy();
    expect(getIn(newState, ['valid'])).toBeFalsy();

    const newState2 = action(newState, {
      type: getReduxConst(SET_FIELD_ERRORS),
      formName: 'form',
      fieldName: 'field',
      errors: List(),
    });

    expect(is(getIn(newState2, ['fields', 'field', 'errors']), List())).toBeTruthy();
    expect(getIn(newState2, ['valid'])).toBeTruthy();
  });

  it('SET_FIELD_DISABLED', () => {
    const action = immutableReducer('form');
    const newState = action(state, {
      type: getReduxConst(SET_FIELD_DISABLED),
      formName: 'form',
      fieldName: 'field',
      disabled: true,
    });

    expect(getIn(newState, ['fields', 'field', 'disabled'])).toBeTruthy();
  });

  it('SET_FIELDS_DISABLED', () => {
    const action = immutableReducer('form');
    const newState = action(state, {
      type: getReduxConst(SET_FIELDS_DISABLED),
      formName: 'form',
      disabledFields: Map({
        field: true,
      }),
    });

    expect(getIn(newState, ['fields', 'field', 'disabled'])).toBeTruthy();
  });

  it('CHANGE_FIELD_VALUE', () => {
    const action = immutableReducer('form');
    const newState = action(state, {
      type: getReduxConst(CHANGE_FIELD_VALUE),
      formName: 'form',
      fieldName: 'field',
      fieldValue: 'test',
    });

    expect(getIn(newState, ['fields', 'field', 'value'])).toBe('test');
  });

  it('UPDATE_FORM', () => {
    expect.assertions(2);

    const action = immutableReducer('form');
    const newState = action(state, {
      type: getReduxConst(UPDATE_FORM),
      formName: 'form',
      fields: Map({
        field: 'new field',
        field1: 'test',
      }),
    });

    expect(is(getIn(newState, ['fields']).keySeq(), Seq(['field', 'field1']))).toBeTruthy();
    expect(getIn(newState, ['fields', 'field'])).not.toBe('new field');
  });

  it('FORM_INITIALISATION', () => {
    const action = immutableReducer('form');
    const newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: Map({
        field1: 'test',
      }),
    });

    expect(is(getIn(newState, ['fields']).keySeq(), Seq(['field1']))).toBeTruthy();
  });

  it('SET_FORM_SUBMITTING', () => {
    const action = immutableReducer('form');
    const newState = action(state, {
      type: getReduxConst(SET_FORM_SUBMITTING),
      formName: 'form',
      submitting: true,
    });

    expect(getIn(newState, ['submitting'])).toBeTruthy();
  });

  it('CHANGE_FIELDS_VALUES', () => {
    const action = immutableReducer('form');
    const newState = action(state, {
      type: getReduxConst(CHANGE_FIELDS_VALUES),
      formName: 'form',
      fieldsValues: Map({
        field: 'test',
      }),
    });

    expect(getIn(newState, ['fields', 'field', 'value'])).toBe('test');
  });

  it('RESET_FIELDS', () => {
    expect.assertions(2);

    const action = immutableReducer('form');
    let newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: Map({
        field: Map({
          disabled: false,
          value: 'initial',
          valid: true,
          errors: List(),
        }),
      }),
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

    expect(getIn(newState, ['fields', 'field', 'value'])).toBe('initial');

    newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: Map({
        field: Map({
          disabled: false,
          value: 'initial',
          valid: true,
          errors: List(),
        }),
      }),
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

    expect(getIn(newState, ['fields', 'field', 'value'])).toBe('');
  });

  it('RESET_FIELD', () => {
    const action = immutableReducer('form');
    let newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: Map({
        field: Map({
          disabled: false,
          value: 'initial',
          valid: true,
          errors: List(),
        }),
      }),
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

    expect(getIn(newState, ['fields', 'field', 'value'])).toBe('initial');
  });

  it('RESET_FORM', () => {
    const action = immutableReducer('form');
    let newState = action(state, {
      type: getReduxConst(FORM_INITIALISATION),
      formName: 'form',
      fields: Map({
        field: Map({
          disabled: false,
          value: 'initial',
          valid: true,
          errors: List(),
        }),
      }),
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

    expect(getIn(newState, ['fields', 'field', 'value'])).toBe('initial');
  });
});
