import { asyncForEach } from '../utils/common';

export const getValidateFunctionsArray = validateProp => {
  if (!validateProp || (Array.isArray(validateProp) && !validateProp.length)) return [];
  const validate = !Array.isArray(validateProp) ? [validateProp] : validateProp;

  return validate;
};

export const validateField = async (value, validateFunctions) => {
  let errorsStack = [];

  if (!validateFunctions.length) return errorsStack;

  await asyncForEach(validateFunctions, async errorChecker => {
    if (typeof errorChecker !== 'function')
      throw new Error('"validate" prop must be Array<Function> or Function');

    const checkerResult = await errorChecker(value);

    if (checkerResult && typeof checkerResult === 'string') {
      errorsStack.push(checkerResult);
    }
  });

  return errorsStack;
};
