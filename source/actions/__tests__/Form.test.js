import {
  formInitialisation,
  updateForm,
  setFormSubmitting,
  resetForm,
  setFormSubmitted,
} from '../Form';
import { getReduxConst } from '../../utils/common';
import {
  FORM_INITIALISATION,
  UPDATE_FORM,
  SET_FORM_SUBMITTING,
  RESET_FORM,
  SET_FORM_SUBMITTED,
} from '../../constants/Form';

describe('actions / Form', () => {
  const formName = 'formName';
  const fields = { test: 'test' };

  it('formInitialisation', () => {
    const actionResult = formInitialisation(formName, fields);

    expect(actionResult).toEqual({
      type: getReduxConst(FORM_INITIALISATION),
      formName,
      fields,
    });
  });

  it('updateForm', () => {
    const actionResult = updateForm(formName, fields);

    expect(actionResult).toEqual({
      type: getReduxConst(UPDATE_FORM),
      formName,
      fields,
    });
  });

  it('setFormSubmitting', () => {
    const submitting = true;
    const actionResult = setFormSubmitting(formName, submitting);

    expect(actionResult).toEqual({
      type: getReduxConst(SET_FORM_SUBMITTING),
      formName,
      submitting,
    });
  });

  it('setFormSubmitted', () => {
    const submitted = true;
    const actionResult = setFormSubmitted(formName, submitted);

    expect(actionResult).toEqual({
      type: getReduxConst(SET_FORM_SUBMITTED),
      formName,
      submitted,
    });
  });

  it('resetForm', () => {
    const actionResult = resetForm(formName);

    expect(actionResult).toEqual({
      type: getReduxConst(RESET_FORM),
      formName,
    });
  });
});
