// @flow

import type { ComponentType } from 'react';

declare module 'reform-redux/immutable' {
  // Reducer
  declare export var formReducerCreator: Function;

  // Actions
  declare export var changeFieldsValues: Function;
  declare export var changeFieldValue: Function;
  declare export var setFieldErrors: Function;
  declare export var setFieldsErrors: Function;
  declare export var setFieldDisabled: Function;
  declare export var setFieldsDisabled: Function;
  declare export var resetField: Function;
  declare export var resetFields: Function;
  declare export var resetForm: Function;
  declare export var setFieldTouched: Function;
  declare export var setFieldsTouched: Function;

  // Components
  declare export var Form: ComponentType<*>;
  declare export var Field: ComponentType<*>;
  declare export var Button: ComponentType<*>;

  // Containers
  declare export var selectFormData: (
    fieldNames: any,
    formPath?: string,
  ) => (ConnectedComponent: ComponentType<*>) => ComponentType<*>;
}

declare module 'reform-redux' {
  // Reducer
  declare export var formReducerCreator: (
    formName: string,
  ) => (
    state: any,
    action: any,
  ) => {
    valid: boolean,
    submitted: boolean,
    submitting: boolean,
    fields: {
      [fieldName: string]: {
        value: any,
        errors: Array<string>,
        valid: boolean,
        disabled: boolean,
      },
    },
  };

  // Actions
  declare export var setFieldTouched: (
    formName: string,
    fieldName: string,
    fieldTouched: boolean,
  ) => {
    type: string,
    formName: string,
    fieldName: string,
    fieldTouched: boolean,
  };
  declare export var setFieldsTouched: (
    formName: string,
    touchedFields: { [fieldName: string]: boolean },
  ) => {
    type: string,
    formName: string,
    touchedFields: { [fieldName: string]: boolean },
  };
  declare export var changeFieldsValues: (
    formName: string,
    fieldsValues: { [fieldName: string]: any },
  ) => {
    type: string,
    formName: string,
    fieldsValues: { [fieldName: string]: any },
  };
  declare export var changeFieldValue: (
    formName: string,
    fieldName: string,
    fieldValue: any,
  ) => {
    type: string,
    formName: string,
    fieldValue: any,
  };
  declare export var setFieldErrors: (
    formName: string,
    fieldName: string,
    errors: Array<string>,
  ) => {
    type: string,
    formName: string,
    fieldName: string,
    errors: Array<string>,
  };
  declare export var setFieldsErrors: (
    formName: string,
    fieldsErrors: { [fieldName: string]: Array<string> },
  ) => {
    type: string,
    formName: string,
    fieldsErrors: { [fieldName: string]: Array<string> },
  };
  declare export var setFieldDisabled: (
    formName: string,
    fieldName: string,
    disabled: boolean,
  ) => {
    type: string,
    formName: string,
    fieldName: string,
    disabled: boolean,
  };
  declare export var setFieldsDisabled: (
    formName: string,
    disabledFields: { [fieldName: string]: boolean },
  ) => {
    type: string,
    formName: string,
    disabledFields: { [fieldName: string]: boolean },
  };
  declare export var resetField: (
    formName: string,
    fieldName: string,
  ) => {
    type: string,
    formName: string,
    fieldName: string,
  };
  declare export var resetFields: (
    formName: string,
    fieldsNames: Array<string>,
  ) => {
    type: string,
    formName: string,
    fieldsNames: Array<string>,
  };
  declare export var resetForm: (
    formName: string,
  ) => {
    type: string,
    formName: string,
  };

  // Components
  declare export var Form: ComponentType<{
    children: Element<*>,
    path: string,
    onSubmitFailed?: (
      errorFields: {
        [fieldName: string]: {
          value: any,
          errors: Array<string>,
          valid: boolean,
          disabled: boolean,
        },
      },
      fields: Array<{
        value: any,
        errors: Array<string>,
        valid: boolean,
        disabled: boolean,
      }>,
      event: Event,
    ) => any,
    onSubmit?: (
      fields: Array<{
        value: any,
        errors: Array<string>,
        valid: boolean,
        disabled: boolean,
      }>,
      event: Event,
    ) => any,
  }>;
  declare export var Field: ComponentType<{
    name: string,
    component: ComponentType<*>,
    normalize?: (
      value: any,
      previousValue: any,
      allFields: Array<{
        value: any,
        errors: Array<string>,
        valid: boolean,
        disabled: boolean,
      }>,
      when: string,
    ) => any,
    type?: string,
    multiple?: boolean,
    checked?: boolean,
    changed?: boolean,
    touched?: boolean,
    value?: string,
    validate?: Array<Function> | Function,
    disabled?: boolean,
    onChange?: Function,
    onBlur?: (
      event: Event,
      fieldData: {
        value: any,
        errors: Array<string>,
        valid: boolean,
        disabled: boolean,
      },
    ) => any,
    onFocus?: (
      event: Event,
      fieldData: {
        value: any,
        errors: Array<string>,
        valid: boolean,
        disabled: boolean,
      },
    ) => any,
  }>;
  declare export var Button: ComponentType<{
    type: string,
    onClick?: Function,
  }>;

  // Containers
  declare export var selectFormData: (
    fieldNames: Array<string>,
    formPath?: string,
  ) => (ConnectedComponent: ComponentType<*>) => ComponentType<*>;
}
