import { shallow, mount } from 'enzyme';
import { object } from 'prop-types';
import { setImmediate } from 'timers';
import { createElement, Component } from 'react';
import { Form, Field } from '../../index';

describe('components / Form', () => {
  beforeEach(() => {
    global.formContext = {
      context: { store: global.store },
    };
  });

  it('snapshot', () => {
    const snapshot = shallow(createElement(Form, { path: 'form' }, ''), global.formContext);
    expect(snapshot).toMatchSnapshot();
  });

  it('if component has not "path" prop then throw error', () => {
    console.error = jest.fn(); // eslint-disable-line
    expect(() => shallow(createElement(Form, {}), global.formContext)).toThrow(
      'The `path` prop is required.',
    );
  });

  it('child component will get right context', () => {
    expect.assertions(3);

    class CustomInput extends Component {
      static contextTypes = {
        _reformRedux: object,
      };

      componentDidMount() {
        expect(Object.keys(this.context._reformRedux)).toEqual(
          expect.arrayContaining(['form', 'field']),
        );

        expect(Object.keys(this.context._reformRedux.form)).toEqual(
          expect.arrayContaining([
            'name',
            'path',
            'fieldsCount',
            'registerField',
            'unregisterField',
            'resetForm',
          ]),
        );

        expect(Object.keys(this.context._reformRedux.field)).toEqual(
          expect.arrayContaining([
            'changeFieldsValues',
            'changeFieldValue',
            'setFieldErrors',
            'setFieldsErrors',
            'setFieldDisabled',
            'setFieldsDisabled',
            'resetField',
            'resetFields',
          ]),
        );
      }

      render() {
        return '';
      }
    }

    mount(
      createElement(
        Form,
        { path: 'form' },
        createElement(CustomInput, { name: 'test', component: 'input' }),
      ),
      global.formContext,
    );
  });

  it('form initialisation in the store after component mount', () => {
    mount(
      createElement(
        Form,
        { path: 'form' },
        createElement(Field, { name: 'test', component: 'input', changed: true, touched: true }),
      ),
      global.formContext,
    );

    expect(global.store.getState().form).toEqual({
      fields: {
        test: {
          changed: true,
          disabled: false,
          touched: true,
          errors: [],
          valid: true,
          value: '',
        },
      },
      submitted: false,
      submitting: false,
      touched: true,
      changed: true,
      valid: true,
    });
  });

  it('form component has default prop onSubmit', () => {
    const component = shallow(createElement(Form, { path: 'form' }), global.formContext);

    expect(typeof component.find('form').prop('onSubmit')).toBe('function');
  });

  it('form component onSubmit behavior', done => {
    expect.assertions(4);

    const validate = value => {
      expect(global.store.getState().form.submitting).toBeTruthy();

      if (value.length < 2) {
        return 'Value must be at least 2 characters';
      }
    };
    const onSubmit = jest.fn();

    const component = mount(
      createElement(Form, { path: 'form', onSubmit }, [
        createElement(Field, { key: 0, name: 'test1', value: '12', component: 'input', validate }),
        createElement(Field, { key: 1, name: 'test2', value: '12', component: 'input', validate }),
      ]),
      global.formContext,
    );

    component.find('form').simulate('submit');

    setImmediate(() => {
      expect(global.store.getState().form.submitting).toBeFalsy();
      expect(onSubmit).toBeCalledWith(
        {
          test1: {
            disabled: false,
            errors: [],
            valid: true,
            touched: false,
            changed: false,
            value: '12',
          },
          test2: {
            disabled: false,
            errors: [],
            touched: false,
            valid: true,
            changed: false,
            value: '12',
          },
        },
        expect.anything(),
      );
      done();
    });
  });

  it('form component onSubmitFailed behavior', done => {
    const validate = value => {
      if (value.length < 2) {
        return 'Value must be at least 2 characters';
      }
    };
    const onSubmitFailed = jest.fn();

    const component = mount(
      createElement(Form, { path: 'form', onSubmitFailed }, [
        createElement(Field, { key: 0, name: 'test1', value: '1', component: 'input', validate }),
        createElement(Field, { key: 1, name: 'test2', value: '1', component: 'input', validate }),
      ]),
      global.formContext,
    );

    component.find('form').simulate('submit');

    setImmediate(() => {
      expect(onSubmitFailed).toBeCalledWith(
        {
          test1: {
            disabled: false,
            errors: ['Value must be at least 2 characters'],
            valid: false,
            changed: false,
            touched: false,
            value: '1',
          },
          test2: {
            disabled: false,
            errors: ['Value must be at least 2 characters'],
            valid: false,
            touched: false,
            changed: false,
            value: '1',
          },
        },
        {
          test1: {
            disabled: false,
            errors: ['Value must be at least 2 characters'],
            valid: false,
            touched: false,
            changed: false,
            value: '1',
          },
          test2: {
            disabled: false,
            errors: ['Value must be at least 2 characters'],
            valid: false,
            touched: false,
            changed: false,
            value: '1',
          },
        },
        expect.anything(),
      );
      done();
    });
  });
});
