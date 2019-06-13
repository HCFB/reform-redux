import React, {
  createContext,
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react';
import { useStore } from 'react-redux';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import {
  formInitialisation,
  resetForm,
  setFormSubmitting,
  updateForm,
  setFormSubmitted,
} from '../actions/Form';
import {
  changeFieldValue,
  setFieldErrors,
  setFieldsErrors,
  changeFieldsValues,
  setFieldDisabled,
  setFieldsDisabled,
  resetField,
  resetFields,
  removeField,
  setFieldsTouched,
  setFieldTouched,
  setFieldChanged,
  setFieldsChanged,
  setFieldHidden,
  setFieldsHidden,
} from '../actions/Field';
import { validateField, getValidateFunctionsArray } from '../utils/Field';
import { asyncForEach, filterReactDomProps, getFormNameKey } from '../utils/common';

export const ReformReduxContext = createContext(null);

/**
 * @callback onSubmitFailed
 * @param {FieldsData} errorFields
 * @param {FieldsData} fields
 * @param {Event} event
 */

/**
 * @callback onSubmit
 * @param {FieldsData} fields
 * @param {Event} event
 */

const useGetFormPathAndName = props =>
  useMemo(
    () => {
      let path;

      if (!props.path) {
        throw new Error('The `path` prop is required.');
      }

      path = props.path.split('.');
      const formName = props.name || path.slice(-1)[0];

      if (props.name) {
        const formKey = getFormNameKey(props.name);

        if (formKey) {
          path = path.concat(formKey);
        }
      }

      return { path, formName };
    },
    [props.name, props.path],
  );

const useDataStacks = formName => {
  const fieldsStack = useRef({});
  const fieldsCount = useRef({});
  const fieldsValidateStack = useRef({});

  if (!fieldsStack.current[formName]) fieldsStack.current[formName] = {};
  if (!fieldsCount.current[formName]) fieldsCount.current[formName] = {};
  if (!fieldsValidateStack.current[formName]) fieldsValidateStack.current[formName] = {};

  return {
    fieldsStack,
    fieldsCount,
    fieldsValidateStack,
  };
};

const useReformContext = (
  formPath,
  formName,
  { fieldsStack, fieldsCount },
  reactReduxStore,
  handlers,
) =>
  useMemo(
    () => {
      return {
        form: {
          name: formName,
          path: formPath,
          registerField: handlers.registerField,
          unregisterField: handlers.unregisterField,
          resetForm: state => reactReduxStore.dispatch(resetForm(formName, state)),
          setFormSubmitted: submitted =>
            reactReduxStore.dispatch(setFormSubmitted(formName, submitted)),
        },
        field: {
          getFieldCount: fieldName => fieldsCount.current[formName][fieldName] || 0,
          setFieldHidden: (fieldName, fieldHidden) => {
            fieldsStack.current[formName][fieldName].hidden = fieldHidden;
            reactReduxStore.dispatch(setFieldHidden(formName, fieldName, fieldHidden));
          },
          setFieldsHidden: hiddenFields => {
            Object.keys(hiddenFields).forEach(hiddenField => {
              fieldsStack.current[formName][hiddenField].hidden = hiddenFields[hiddenField].hidden;
            });
            reactReduxStore.dispatch(setFieldsHidden(formName, hiddenFields));
          },
          setFieldTouched: (fieldName, fieldTouched) => {
            fieldsStack.current[formName][fieldName].touched = fieldTouched;
            reactReduxStore.dispatch(setFieldTouched(formName, fieldName, fieldTouched));
          },
          setFieldsTouched: fieldsTouched => {
            Object.keys(fieldsTouched).forEach(touchedField => {
              fieldsStack.current[formName][touchedField].touched =
                fieldsTouched[touchedField].touched;
            });
            reactReduxStore.dispatch(setFieldsTouched(formName, fieldsTouched));
          },
          setFieldChanged: (fieldName, fieldChanged) => {
            fieldsStack.current[formName][fieldName].changed = fieldChanged;
            reactReduxStore.dispatch(setFieldChanged(formName, fieldName, fieldChanged));
          },
          setFieldsChanged: fieldsChanged => {
            Object.keys(fieldsChanged).forEach(changedField => {
              fieldsStack.current[formName][changedField].changed =
                fieldsChanged[changedField].changed;
            });
            reactReduxStore.dispatch(setFieldsChanged(formName, fieldsChanged));
          },
          removeField: fieldName => reactReduxStore.dispatch(removeField(formName, fieldName)),
          changeFieldsValues: fieldsValues => {
            Object.keys(fieldsValues).forEach(field => {
              fieldsStack.current[formName][field].changed = true;
            });
            reactReduxStore.dispatch(changeFieldsValues(formName, fieldsValues));
          },
          changeFieldValue: (fieldName, fieldValue) => {
            fieldsStack.current[formName][fieldName].changed = true;
            reactReduxStore.dispatch(changeFieldValue(formName, fieldName, fieldValue));
          },
          setFieldErrors: (fieldName, errors) =>
            reactReduxStore.dispatch(setFieldErrors(formName, fieldName, errors)),
          setFieldsErrors: (fieldName, fieldsErrors) =>
            reactReduxStore.dispatch(setFieldsErrors(formName, fieldsErrors)),
          setFieldDisabled: (fieldName, disabled = true) =>
            reactReduxStore.dispatch(setFieldDisabled(formName, fieldName, disabled)),
          setFieldsDisabled: disabledFields =>
            reactReduxStore.dispatch(setFieldsDisabled(formName, disabledFields)),
          resetField: (fieldName, state) =>
            reactReduxStore.dispatch(resetField(formName, fieldName, state)),
          resetFields: (fieldsNames, state) =>
            reactReduxStore.dispatch(resetFields(formName, fieldsNames, state)),
        },
        _core: {
          updateStackFieldValue: (fieldName, fieldValue) => {
            fieldsStack.current[formName][fieldName].value = fieldValue;
          },
        },
      };
    },
    [
      fieldsCount,
      fieldsStack,
      formName,
      formPath,
      handlers.registerField,
      handlers.unregisterField,
      reactReduxStore,
    ],
  );

const useFormUpdater = (reactReduxStore, formName, dataStacks) =>
  useMemo(
    () => {
      return debounce(formInitialized => {
        if (formInitialized) {
          reactReduxStore.dispatch(updateForm(formName, dataStacks.fieldsStack.current[formName]));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, 250);
    },
    [dataStacks.fieldsStack, formName, reactReduxStore],
  );

const useInitialization = (
  initialized,
  reactReduxStore,
  formPath,
  updateFormData,
  dataStacks,
  formName,
) => {
  useEffect(
    () => {
      let state = reactReduxStore.getState();
      let fieldsLength = Object.keys(get(state, [...formPath, 'fields'], {})).length;

      if (fieldsLength) {
        initialized.current = true;
      }

      if (initialized.current) {
        updateFormData(initialized.current);
      } else {
        reactReduxStore.dispatch(
          formInitialisation(formName, dataStacks.fieldsStack.current[formName]),
        );

        initialized.current = true;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
};

const useHandlers = (
  dataStacks,
  formName,
  reactReduxStore,
  initialized,
  updateFormData,
  props,
  formPath,
) => {
  const increaseFieldCount = useCallback(
    fieldName => {
      const fieldsCount = dataStacks.fieldsCount.current[formName][fieldName] || 0;
      return (dataStacks.fieldsCount.current[formName][fieldName] = fieldsCount + 1);
    },
    [dataStacks.fieldsCount, formName],
  );

  const decreaseFieldCount = useCallback(
    (fieldName, reset) => {
      const fieldsCount = reset ? 0 : dataStacks.fieldsCount.current[formName][fieldName];
      return (dataStacks.fieldsCount.current[formName][fieldName] = fieldsCount
        ? fieldsCount - 1
        : 0);
    },
    [dataStacks.fieldsCount, formName],
  );

  const unregisterField = useCallback(
    (fieldName, removeOnUnmount) => {
      if (!get(dataStacks.fieldsStack.current, [formName, fieldName])) return;

      decreaseFieldCount(fieldName, removeOnUnmount);

      if (removeOnUnmount) {
        reactReduxStore.dispatch(removeField(formName, fieldName));
        delete dataStacks.fieldsStack.current[formName][fieldName];
        delete dataStacks.fieldsValidateStack.current[formName][fieldName];
      }
    },
    [
      dataStacks.fieldsStack,
      dataStacks.fieldsValidateStack,
      decreaseFieldCount,
      formName,
      reactReduxStore,
    ],
  );

  const registerField = useCallback(
    (fieldName, fieldData, fieldValidate, fieldAdditionalData) => {
      increaseFieldCount(fieldName);

      if (fieldAdditionalData.type && dataStacks.fieldsCount.current[formName][fieldName] > 1) {
        if (fieldAdditionalData.type === 'radio' && !fieldAdditionalData.checked) {
          return updateFormData(initialized.current);
        }

        const stackFieldValue = get(dataStacks.fieldsStack.current[formName][fieldName], ['value']);
        const fieldDataValue = get(fieldData, ['value']);

        if (fieldAdditionalData.type === 'checkbox' || fieldAdditionalData.type === 'radio') {
          if (fieldAdditionalData.checked) {
            if (fieldAdditionalData.type === 'checkbox') {
              if (!Array.isArray(stackFieldValue)) {
                let fieldValue = [fieldDataValue];

                if (stackFieldValue) {
                  fieldValue = [stackFieldValue, fieldDataValue];
                }

                dataStacks.fieldsStack.current[formName][fieldName].value = fieldValue;

                return updateFormData(initialized.current);
              }

              if (
                stackFieldValue.indexOf(fieldDataValue) === -1 &&
                !isEqual(stackFieldValue, fieldDataValue)
              ) {
                dataStacks.fieldsStack.current[formName][fieldName].value.push(fieldDataValue);
              }

              return updateFormData(initialized.current);
            }

            dataStacks.fieldsStack.current[formName][fieldName].value = fieldDataValue;

            return updateFormData(initialized.current);
          }

          if (!Array.isArray(stackFieldValue) && fieldAdditionalData.type === 'checkbox') {
            let fieldValue = [];

            if (stackFieldValue) {
              fieldValue = [stackFieldValue];
            }

            dataStacks.fieldsStack.current[formName][fieldName].value = fieldValue;
          }

          return updateFormData(initialized.current);
        }
      }

      // Set empty array as default value for multiple select

      if (
        fieldAdditionalData.component === 'select' &&
        fieldAdditionalData.multiple &&
        !get(fieldData, ['value'])
      ) {
        fieldData.value = [];
      }

      dataStacks.fieldsStack.current[formName][fieldName] = fieldData;
      dataStacks.fieldsValidateStack.current[formName][fieldName] = fieldValidate;
      updateFormData(initialized.current);
    },
    [dataStacks, formName, increaseFieldCount, initialized, updateFormData],
  );

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();

      (async () => {
        reactReduxStore.dispatch(setFormSubmitting(formName, true));

        const { onSubmit, onSubmitFailed } = props;

        // Validate all fields

        let state = reactReduxStore.getState();
        let fields = get(state, [...formPath, 'fields']);
        let fieldsErrors = {};
        let errorsExists = false;

        if (!props.submitHiddenFields) {
          const jsFields = fields;
          const jsFilteredFields = {};
          Object.keys(jsFields).forEach(jsFieldKey => {
            if (!jsFields[jsFieldKey].hidden) {
              jsFilteredFields[jsFieldKey] = jsFields[jsFieldKey];
            }
          });
          fields = jsFilteredFields;
        }

        await asyncForEach(Object.keys(fields), async fieldKey => {
          const validateFunctions = getValidateFunctionsArray(
            dataStacks.fieldsValidateStack.current[formName][fieldKey],
          );
          let errors = get(fields, [fieldKey, 'errors']);

          if (!errors.length) {
            errors = await validateField(get(fields, [fieldKey, 'value']), validateFunctions);
          }

          fieldsErrors[fieldKey] = errors;

          if (errors.length) {
            errorsExists = true;
          }
        });

        if (errorsExists) {
          reactReduxStore.dispatch(setFieldsErrors(formName, fieldsErrors));

          state = reactReduxStore.getState();
          fields = get(state, [...formPath, 'fields']);

          let fieldsWithErrors = {};

          Object.keys(fields).forEach(fieldKey => {
            if (!get(fields, [fieldKey, 'valid'])) {
              fieldsWithErrors[fieldKey] = get(fields, [fieldKey]);
            }
          });

          if (onSubmitFailed) {
            onSubmitFailed(fieldsWithErrors, fields, event);
            reactReduxStore.dispatch(setFormSubmitting(formName, false));
          }
        } else if (onSubmit) {
          state = reactReduxStore.getState();

          await Promise.resolve(onSubmit(fields, event)).then(() => {
            reactReduxStore.dispatch(setFormSubmitting(formName, false));
            reactReduxStore.dispatch(setFormSubmitted(formName, true));
          });
        }

        const jsFields = fields;
        const jsFilteredFields = {};
        Object.keys(jsFields).forEach(jsFieldKey => {
          jsFilteredFields[jsFieldKey] = true;
        });
        fields = jsFilteredFields;

        reactReduxStore.dispatch(setFieldsTouched(formName, fields));
      })();
    },
    [dataStacks.fieldsValidateStack, formName, formPath, props, reactReduxStore],
  );

  return { handleSubmit, registerField, unregisterField, decreaseFieldCount, increaseFieldCount };
};

/**
 * The Form component is a simple wrapper for the React `<form>`.
 *
 * @class Form
 * @example
 * import { Form } from 'reform-redux';
 *
 * const FormWrapper = () => (
 *  <Form path="path.to.form" />
 * );
 *
 * @param {string} path Path to reducer in the redux store. Example: 'some.reducers.myFormName'. (Required)
 * @param {string} [name] Form name.
 * @param {onSubmitFailed} [onSubmitFailed] Function which will trigger after unsuccessfull submit the form.
 * @param {onSubmit} [onSubmit] Function which will trigger after successfull submit the form.
 * @param {boolean} [submitHiddenFields] Submit hidden fields or not. False by default.
 */
const Form = props => {
  const reactReduxStore = useStore();
  const initialized = useRef(false);
  const { path, formName } = useGetFormPathAndName(props);
  const dataStacks = useDataStacks(formName);
  const updateFormData = useFormUpdater(reactReduxStore, formName, dataStacks);
  const {
    handleSubmit,
    registerField,
    unregisterField,
    decreaseFieldCount,
    increaseFieldCount,
  } = useHandlers(dataStacks, formName, reactReduxStore, initialized, updateFormData, props, path);
  const reformContext = useReformContext(path, formName, dataStacks, reactReduxStore, {
    handleSubmit,
    registerField,
    unregisterField,
    decreaseFieldCount,
    increaseFieldCount,
  });
  useInitialization(initialized, reactReduxStore, path, updateFormData, dataStacks, formName);

  return (
    <ReformReduxContext.Provider value={reformContext}>
      <form
        {...{
          ...filterReactDomProps(props),
          ref: props.innerRef,
          onSubmit: handleSubmit,
          children: props.children,
        }}
      />
    </ReformReduxContext.Provider>
  );
};

Form.propTypes = {
  path: PropTypes.string.isRequired,
  name: PropTypes.string,
  submitHiddenFields: PropTypes.bool,
  onSubmitFailed: PropTypes.func,
  onSubmit: PropTypes.func,
  innerRef: PropTypes.any,
  children: PropTypes.any,
};

Form.defaultProps = {
  onSubmit: () => {},
  onSubmitFailed: () => {},
};

export default memo(forwardRef((props, ref) => <Form {...{ ...props, innerRef: ref }} />));
