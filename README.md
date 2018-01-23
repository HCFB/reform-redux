# ReForm-Redux

Simple realisation of react/redux form component.

## Attention

For use this plugin with old browsers you need to add polyfills to your bundle. Like [babel-polyfill](https://github.com/babel/babel/tree/master/packages/babel-polyfill) & [babel-preset-env](https://github.com/babel/babel/tree/master/packages/babel-preset-env).

## Examples

### [Simple Form](https://codesandbox.io/s/lpmkpv7m57)

Demonstrates how to attach standard inputs to Redux.

### [Synchronous validation](https://codesandbox.io/s/nnvzv3nnvl)

How to add synchronous client-side validation to your form.

### [Submit validation](https://codesandbox.io/s/474vwxzn4)

How to return server-side validation errors back from your submit function.

### [Asynchronous validation](https://codesandbox.io/s/x77530kr4)

How to run asynchronous server-side validation on your form.

### [Initializing From State](https://codesandbox.io/s/wnynw97x0k)

How to initialize your form data from any slice of the Redux state.

### [Selecting form values](https://codesandbox.io/s/04ow975qyv)

How to bind certain form values as props to your custom component.

### [Two forms on same page](https://codesandbox.io/s/7zx59o8316)

How to create two forms on same page.

### [Normalizing or masking](https://codesandbox.io/s/1qz08x6x9q)

How to use normalize or masking your form values.

## Create form reducer

How to create form reducer.

```javascript
import { formReducerCreator } from 'reform-redux';

const store = createStore({
  formName: formReducerCreator('formName'),
});
```

## Components

Description of all components in the library.

## Form

```javascript
import { Form } from 'reform-redux';
```

The Form component is a simple wrapper for the React `<form>`.

### Props

| Prop name      | Flow type                                                          | Required | Description                                                              |
| -------------- | ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| path           | string                                                             | yes      | Path to reducer in the redux store. Example: 'some.reducers.myFormName'. |
| onSubmitFailed | (errorFields: FieldsData, fields: FieldsData, event: Event) => any | no       | Function which will trigger after unsuccessfull submit the form.         |
| onSubmit       | (fields: FieldsData, event: Event) => any                          | no       | Function which will trigger after successfull submit the form.           |

### Flow types

```
type FieldsData = {
  [fieldName: string]: FieldData,
};

type FieldData = {
  value: any,
  errors: Array<string>,
  valid: boolean,
  disabled: boolean,
};
```

## Field

```javascript
import { Field } from 'reform-redux';
```

The Field component creates new field in store and provide all data of this field to your component.

### Props

| Prop name | Flow type                                                                                           | Required | Description                                                                |
| --------- | --------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| name      | string                                                                                              | yes      | Name of your field. This name will appear in fields object in redux store. |
| component | ComponentType<*>                                                                                    | yes      | Function or Class or String which be passed to React.createElement.        |
| validate  | Array\<(value: any) => any\> \| (value: any) => any                                                 | no       | Validate functions.                                                        |
| disabled  | boolean                                                                                             | no       | Field disabled or not.                                                     |
| value     | any                                                                                                 | no       | Value of your field.                                                       |
| normalize | (value: any, previousValue: any, allFields: FieldsData, when: onChange \| onBlur \| onFocus) => any | no       | Normalize value function.                                                  |
| onFocus   | (event: Event, fieldData: FieldData) => any                                                         | no       | onFocus handler.                                                           |
| onBlur    | (event: Event, fieldData: FieldData) => any                                                         | no       | onBlur handler.                                                            |
| onChange  | (data: any, value: any) => any                                                                      | no       | onChange handler.                                                          |
| checked   | boolean                                                                                             | no       | Checked or not your radio button or checkbox.                              |

### Props which avaible in the `component`

| Prop name | Flow type                                   | Description                                                                            |
| --------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| onChange  | (data: any, value: any) => any              | Execute this function when you need to change value in the store.                      |
| onBlur    | (event: Event, fieldData: FieldData) => any | This function will trigger function or functions which validate your field.            |
| onFocus   | (event: Event, fieldData: FieldData) => any | This function will trigger normalize function.                                         |
| value     | any                                         | Field value.                                                                           |
| disabled  | boolean                                     | Field disabled or not.                                                                 |
| checked   | boolean                                     | This prop will avaible in the component if your component is checkbox or radio button. |
| formName  | string                                      | Form name.                                                                             |
| errors    | Array\<string\>                             | Array of errors.                                                                       |

## Button

```javascript
import { Button } from 'reform-redux';
```

If you need to disable your submit button when form is submitting or reset form use this component.

| Prop name | Flow type       | Required | Description      |
| --------- | --------------- | -------- | ---------------- |
| type      | submit \| reset | yes      | Button type.     |
| onClick   | Function        | no       | onClick handler. |

## Containers

## selectFormData

Component wrapper which pass fields data to wrapped component through props.

```javascript
import { selectFormData } from 'reform-redux';

selectFormData(
  fieldNames: Array<string>,
  formPath?: string
)(ConnectedComponent: ComponentType<*>) => ComponentType<*>
```

## Actions

Description of all actions in the library.

### changeFieldsValues

Change value in one or more fields.

```javascript
import { changeFieldsValues } from 'reform-redux';

store.dispatch(changeFieldsValues(
  formName: string,
  fieldsValues: { [fieldName: string]: any },
));
```

### changeFieldValue

Change value in one field.

```javascript
import { changeFieldValue } from 'reform-redux';

store.dispatch(changeFieldValue(
  formName: string,
  fieldName: string,
  fieldValue: any,
));
```

### setFieldErrors

Change field errors.

```javascript
import { setFieldErrors } from 'reform-redux';

store.dispatch(setFieldErrors(
  formName: string,
  fieldName: string,
  errors: Array<string>,
));
```

### setFieldsErrors

Change errors in one or more fields.

```javascript
import { setFieldsErrors } from 'reform-redux';

store.dispatch(setFieldsErrors(
  formName: string,
  fieldsErrors: { [fieldName: string]: Array<string> },
));
```

### setFieldDisabled

Disable field.

```javascript
import { setFieldDisabled } from 'reform-redux';

store.dispatch(setFieldDisabled(
  formName: string,
  fieldName: string,
  disabled: boolean = true,
));
```

### setFieldsDisabled

Disable one or more fields.

```javascript
import { setFieldsDisabled } from 'reform-redux';

store.dispatch(setFieldsDisabled(
  formName: string,
  disabledFields: { [fieldName: string]: boolean },
));
```

### resetField

Reset field.

```javascript
import { resetField } from 'reform-redux';

store.dispatch(resetField(
  formName: string,
  fieldName: string,
));
```

### resetFields

Reset fields.

```javascript
import { resetFields } from 'reform-redux';

store.dispatch(resetFields(
  formName: string,
  fieldsNames: Array<string>,
));
```

### resetForm

Reset form.

```javascript
import { resetForm } from 'reform-redux';

store.dispatch(resetFields(
  formName: string,
));
```

### Context

Form component creates context which avaible in components children. 

```javascript
_reformRedux: {
    form: {
      name: string,
      path: string,
      registerField: Function,
      fieldsCount: { [fieldName: string]: number },
      unregisterField: Function,
      resetForm: Function,
      updateForm: Function,
    },
    field: {
      changeFieldValue: (fieldName: string, fieldValue: string) => Function,
      changeFieldsValues: (fieldsValues: { [fieldName: string]: any }) => Function,
      setFieldErrors: (fieldName: string, errors: Array<string>) => Function,
      setFieldsErrors: (fieldName: string, fieldsErrors: { [fieldName: string]: Array<string> }) => Function,
      setFieldDisabled: (fieldName: string, disabled: boolean) => Function,
      setFieldsDisabled: (fieldName: string, disabledFields: { [fieldName: string]: boolean }) => Function,
      resetField: (fieldName: string) => Function,
      resetFields: (fieldsNames: Array<string>) => Function,
    },
  }
```

## Commands

* `npm run build` - Build the library
* `npm run flow` - Check static typing
* `npm run flow-typed library-name@x.x.x` - Intall flow types from [flow-typed](https://github.com/flowtype/flow-typed) library
* `npm run lint` - Code linting ([prettier](https://github.com/prettier/prettier) & [eslint](https://github.com/eslint/eslint))
* `npm run fix` - Format code 
* `npm test` - Run unit-tests
* `npm run test:dev` - Run unit-tests in watch mode
* `npm run test:dev:inspect` - Run unit-tests in watch mode with chrome inspector
* `npm run precommit` - Fix code and add fixed files to git
* `npm run prepush` - Run tests