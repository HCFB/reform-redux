import { getValidateFunctionsArray, validateField } from '../Field';

describe('utils/Field', () => {
  it('getValidateFunctionsArray', () => {
    expect.assertions(4);

    expect(getValidateFunctionsArray(null)).toEqual([]);
    expect(getValidateFunctionsArray([])).toEqual([]);
    expect(getValidateFunctionsArray('test')).toEqual(['test']);
    expect(getValidateFunctionsArray(['test'])).toEqual(['test']);
  });

  it('validateField', async () => {
    expect.assertions(4);
    jest.useFakeTimers();

    expect(await validateField('test', [])).toEqual([]);
    expect(await validateField('test', [() => 'first error', () => 'second error'])).toEqual([
      'first error',
      'second error',
    ]);
    await validateField('test', ['']).catch(error =>
      expect(error.message).toBe('"validate" prop must be Array<Function> or Function'),
    );
    expect(
      await validateField('test', [
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve('error');
            }, 1000);
            jest.runAllTimers();
          }),
      ]),
    ).toEqual(['error']);
  });
});
