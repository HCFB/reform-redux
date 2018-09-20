# Changelog

All notable changes to this project will be documented in this file.

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
