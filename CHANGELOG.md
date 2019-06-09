# Changelog

All notable changes to this project will be documented in this file.

## [2.0.1] - 2019-6-9

- Button disabled fix
- Button props fix

## [2.0.0] - 2019-6-7

- Use ref for the Button component
- Remove flow
- Big move to new version of react-redux
- Remove unused functionality

## [1.9.4] - 2019-4-2

- Use ref for the Button component

## [1.9.3] - 2019-4-2

- Use ref when component isnt string
- Use Component where shouldComponentUpdate

## [1.9.2] - 2019-3-5

- Use of pureComponents
- Field value use any proptype 

## [1.9.1] - 2019-3-4

- If form key doesnt exists, dont concat him to form path

## [1.9.0] - 2019-2-20

- Remove support of immutable.js
- Audit fixes
- Simplify Field props
- Support multiple forms with same name

## [1.8.9] - 2019-2-6

- Form update bugfixes

## [1.8.8] - 2019-2-6

- Call stack error bugfix

## [1.8.7] - 2019-2-5

- Code improvements
- Send hidden fields bugfix

## [1.8.5] - 2019-1-29

- Pass name prop to normalize function

## [1.8.4] - 2019-1-25

- Documentation.js

## [1.8.3] - 2019-1-21

- Pass custom props to Button component

## [1.8.2] - 2019-1-20

- Form component submitHiddenFields property
- Button component new component property

## [1.8.0] - 2019-1-18

- New actions setFieldsHidden, setFieldHidden & hidden param for components
- Pass previous value to onChange callback

## [1.7.0] - 2018-12-28

- Support of new react context api.

## [1.6.8] - 2018-12-11

- Get values from redux store if they exists

## [1.6.7] - 2018-12-3

- Set value as bool for checkboxes where value does not exists

## [1.6.6] - 2018-11-22

- If checkbox hasn't value prop then pass checked state.

## [1.6.5] - 2018-11-7

- Don't reset fields state on form update.

## [1.6.4] - 2018-11-6

- Bugfixes for list components.
- Register field after unregister.

## [1.6.3] - 2018-11-4

- Bugfix: Checkbox list after unmount & mount resets their value.

## [1.6.2] - 2018-11-2

- Set 0 fields count on field unmount.
- Don't change value for list of checkboxes or radio if value already was changed.

## [1.6.1] - 2018-10-31

- Update value through props in list of checkbox or radio buttons.

## [1.6.0] - 2018-10-30

- New action `setFormSubmitted`.
- Change touched and changed properties through props.

## [1.4.1] - 2018-10-22

- Usage of polyfills.

## [1.4.0] - 2018-10-20

- Support to reset form to empty or initial state.

## [1.3.7] - 2018-10-20

- If some field was touched or changed then form was touched or changed too.

## [1.3.6] - 2018-10-18

- Add fields in the store after Form mount. (bugfix)

## [1.3.5] - 2018-10-13

- Update components to new react api.

## [1.3.4] - 2018-10-11

- Pass stateless components as component to Field.

## [1.3.3] - 2018-10-11

- Change component prop-type validator.

## [1.3.2] - 2018-10-11

- Get form name from props 'name' in Form component.

## [1.3.1] - 2018-10-7

- Build fix.

## [1.3.0] - 2018-10-7

- Code improvements.
- Support React.forwardRef.

## [1.2.5] - 2018-10-1

- Add Fields to redux state after initialize.

## [1.2.4] - 2018-09-25

- Don't change value on receive props in list of Fields with same name.

## [1.2.3] - 2018-09-21

- Now exists commonJS bundle.

## [1.2.2] - 2018-09-20

- Code improvements.
- If the field was touched don't validate him. (bugfix)

## [1.2.1] - 2018-09-19

- Pass `touched` prop to Field component.

## [1.2.0] - 2018-09-19

- Name of property `touched` was changed to `changed`.
- Form `changed: true` when `onChange` was called at least in one Field of this Form.
- Field `changed: true` when `onChange` was called on this Field.
- Form `touched: true` when `onBlur` was called at least in one Field of this Form.
- Field `touched: true` when `onBlur` was called on this Field.
