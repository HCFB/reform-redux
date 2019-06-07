import '@babel/polyfill';

import plain from './utils/plainFunctions';
import { createFormReducer } from './reducers/formReducer';
import Form from './components/Form';
import Field from './components/Field';
import Button from './components/Button';
import { filterReactDomProps } from './utils/common';

const dataFunctions = plain();

// Utils

export { filterReactDomProps };

// Reducer

const formReducerCreator = createFormReducer(dataFunctions);
export { formReducerCreator };

// Actions

export {
  changeFieldsValues,
  changeFieldValue,
  setFieldErrors,
  setFieldsErrors,
  setFieldDisabled,
  setFieldsDisabled,
  resetField,
  resetFields,
  removeField,
  setFieldTouched,
  setFieldsTouched,
  setFieldChanged,
  setFieldsChanged,
  setFieldHidden,
  setFieldsHidden,
} from './actions/Field';
export { resetForm, setFormSubmitted } from './actions/Form';

// Components

export { Form, Field, Button };
