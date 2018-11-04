import {
  RESET_FIELD,
  RESET_FIELDS,
  SET_FIELD_DISABLED,
  SET_FIELDS_DISABLED,
  CHANGE_FIELD_VALUE,
  CHANGE_FIELDS_VALUES,
  SET_FIELD_ERRORS,
  SET_FIELDS_ERRORS,
  SET_FIELD_TOUCHED,
  SET_FIELDS_TOUCHED,
  SET_FIELD_CHANGED,
  SET_FIELDS_CHANGED,
} from '../../constants/Field';
import { getReduxConst } from '../../utils/common';
import {
  resetField,
  resetFields,
  setFieldDisabled,
  setFieldsDisabled,
  changeFieldValue,
  changeFieldsValues,
  setFieldErrors,
  setFieldsErrors,
  setFieldTouched,
  setFieldsTouched,
  setFieldChanged,
  setFieldsChanged,
} from '../Field';

describe('actions / Field', () => {
  const formName = 'formName';
  const fieldName = 'fieldName';

  it('setFieldTouched', () => {
    const fieldTouched = true;
    const actionResult = setFieldTouched(formName, fieldName, fieldTouched);

    expect(actionResult).toEqual({
      type: getReduxConst(SET_FIELD_TOUCHED),
      formName,
      fieldName,
      fieldTouched,
    });
  });

  it('setFieldsTouched', () => {
    const touchedFields = { test: true };
    const actionResult = setFieldsTouched(formName, touchedFields);

    expect(actionResult).toEqual({
      type: getReduxConst(SET_FIELDS_TOUCHED),
      formName,
      touchedFields,
    });
  });

  it('setFieldChanged', () => {
    const fieldChanged = true;
    const actionResult = setFieldChanged(formName, fieldName, fieldChanged);

    expect(actionResult).toEqual({
      type: getReduxConst(SET_FIELD_CHANGED),
      formName,
      fieldName,
      fieldChanged,
    });
  });

  it('setFieldsChanged', () => {
    const changedFields = { test: true };
    const actionResult = setFieldsChanged(formName, changedFields);

    expect(actionResult).toEqual({
      type: getReduxConst(SET_FIELDS_CHANGED),
      formName,
      changedFields,
    });
  });

  it('resetField', () => {
    const actionResult = resetField(formName, fieldName);

    expect(actionResult).toEqual({
      type: getReduxConst(RESET_FIELD),
      formName,
      fieldName,
    });
  });

  it('resetFields', () => {
    const fieldsNames = ['test'];
    const actionResult = resetFields(formName, fieldsNames);

    expect(actionResult).toEqual({
      type: getReduxConst(RESET_FIELDS),
      formName,
      fieldsNames,
    });
  });

  it('setFieldDisabled', () => {
    const disabled = true;
    const actionResult = setFieldDisabled(formName, fieldName, disabled);

    expect(actionResult).toEqual({
      type: getReduxConst(SET_FIELD_DISABLED),
      formName,
      fieldName,
      disabled,
    });
  });

  it('setFieldsDisabled', () => {
    const disabledFields = { test: true };
    const actionResult = setFieldsDisabled(formName, disabledFields);

    expect(actionResult).toEqual({
      type: getReduxConst(SET_FIELDS_DISABLED),
      formName,
      disabledFields,
    });
  });

  it('changeFieldValue', () => {
    const fieldValue = true;
    const actionResult = changeFieldValue(formName, fieldName, fieldValue);

    expect(actionResult).toEqual({
      type: getReduxConst(CHANGE_FIELD_VALUE),
      formName,
      fieldName,
      fieldValue,
    });
  });

  it('changeFieldsValues', () => {
    const fieldsValues = { test: 'test' };
    const actionResult = changeFieldsValues(formName, fieldsValues);

    expect(actionResult).toEqual({
      type: getReduxConst(CHANGE_FIELDS_VALUES),
      formName,
      fieldsValues,
    });
  });

  it('setFieldErrors', () => {
    const errors = ['test'];
    const actionResult = setFieldErrors(formName, fieldName, errors);

    expect(actionResult).toEqual({
      type: getReduxConst(SET_FIELD_ERRORS),
      formName,
      fieldName,
      errors,
    });
  });

  it('setFieldsErrors', () => {
    const fieldsErrors = { test: ['test'] };
    const actionResult = setFieldsErrors(formName, fieldsErrors);

    expect(actionResult).toEqual({
      type: getReduxConst(SET_FIELDS_ERRORS),
      formName,
      fieldsErrors,
    });
  });
});
