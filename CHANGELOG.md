# Changelog

All notable changes to this project will be documented in this file.

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
