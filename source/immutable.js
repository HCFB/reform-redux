import immutable from './utils/immutableFunctions';
import { createFormReducer } from './reducers/formReducer';
import { createFormComponent } from './components/Form';
import { createFieldComponent } from './components/Field';
import { createButtonComponent } from './components/Button';
import { createSelectFormData } from './containers/selectFormData';
import { filterReactDomProps } from './utils/common';
import type { DataFunctions } from './types/dataFunctions';

const dataFunctions: DataFunctions = immutable();

// Utils

export { filterReactDomProps };

// Reducer

const formReducerCreator: Function = createFormReducer(dataFunctions);
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
} from './actions/Field';
export { resetForm } from './actions/Form';

// Components

const Form = createFormComponent(dataFunctions);
const Field = createFieldComponent(dataFunctions);
const Button = createButtonComponent(dataFunctions);
const selectFormData = createSelectFormData(dataFunctions);

export { Form, Field, Button, selectFormData };
