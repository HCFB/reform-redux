import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import { setImmediate } from 'timers';
import { createElement } from 'react';
import { act } from 'react-test-renderer';
import { Form, Field } from '../../index';
import { setFieldsErrors } from '../../actions/Field';

describe('components / Form', () => {
  it('snapshot', () => {
    const snapshot = shallow(
      createElement(Provider, { store: global.store }, createElement(Form, { path: 'form' }, '')),
    );
    expect(snapshot).toMatchSnapshot();
  });

  it('if component has not "path" prop then throw error', () => {
    console.error = jest.fn(); // eslint-disable-line
    expect(() =>
      mount(createElement(Provider, { store: global.store }, createElement(Form, {}))),
    ).toThrow('The `path` prop is required.');
  });

  it('form initialisation in the store after component mount', () => {
    jest.useFakeTimers();

    act(() => {
      mount(
        createElement(
          Provider,
          { store: global.store },
          createElement(
            Form,
            { path: 'form' },
            createElement(Field, {
              name: 'test',
              component: 'input',
              changed: true,
              touched: true,
            }),
          ),
        ),
      );

      jest.runAllTimers();
    });

    expect(global.store.getState().form).toEqual({
      fields: {
        test: {
          changed: true,
          disabled: false,
          touched: true,
          hidden: false,
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

  it('form data on components after component mount and unmount', () => {
    expect.assertions(2);
    jest.useFakeTimers();

    const wrapper = ({ visible = true }) =>
      visible &&
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, { name: 'test', component: 'input' }),
        ),
      );

    const component = mount(createElement(wrapper));

    component
      .find('input')
      .simulate('change', { nativeEvent: new Event('change'), target: { value: 'test' } });

    expect(global.store.getState().form).toEqual({
      fields: {
        test: {
          changed: true,
          disabled: false,
          touched: false,
          hidden: false,
          errors: [],
          valid: true,
          value: 'test',
        },
      },
      submitted: false,
      submitting: false,
      touched: false,
      changed: true,
      valid: true,
    });

    component.setProps({ visible: false });
    component.setProps({ visible: true });

    jest.runAllTimers();

    expect(global.store.getState().form).toEqual({
      fields: {
        test: {
          changed: true,
          disabled: false,
          touched: false,
          hidden: false,
          errors: [],
          valid: true,
          value: 'test',
        },
      },
      submitted: false,
      submitting: false,
      touched: false,
      changed: true,
      valid: true,
    });
  });

  it('form component has default prop onSubmit', () => {
    const component = mount(
      createElement(Provider, { store: global.store }, createElement(Form, { path: 'form' })),
    );
    expect(typeof component.find('form').prop('onSubmit')).toBe('function');
  });

  it('form component onSubmit behavior', done => {
    expect.assertions(5);

    const validate = value => {
      expect(global.store.getState().form.submitting).toBeTruthy();

      if (value.length < 2) {
        return 'Value must be at least 2 characters';
      }
    };
    const onSubmit = jest.fn();

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form', onSubmit, submitHiddenFields: false }, [
          createElement(Field, {
            key: 0,
            name: 'test1',
            value: '12',
            component: 'input',
            hidden: true,
            validate,
          }),
          createElement(Field, {
            key: 1,
            name: 'test2',
            value: '12',
            component: 'input',
            validate,
          }),
        ]),
      ),
    );

    expect(global.store.getState().form.submitted).toBeFalsy();

    component.find('form').simulate('submit');

    setImmediate(() => {
      expect(global.store.getState().form.submitted).toBeTruthy();
      expect(global.store.getState().form.submitting).toBeFalsy();
      expect(onSubmit).toBeCalledWith(
        {
          test2: {
            disabled: false,
            errors: [],
            hidden: false,
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
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form', onSubmitFailed }, [
          createElement(Field, { key: 0, name: 'test1', value: '1', component: 'input', validate }),
          createElement(Field, { key: 1, name: 'test2', value: '1', component: 'input', validate }),
        ]),
      ),
    );

    component.find('form').simulate('submit');

    setImmediate(() => {
      expect(onSubmitFailed).toBeCalledWith(
        {
          test1: {
            disabled: false,
            errors: ['Value must be at least 2 characters'],
            valid: false,
            hidden: false,
            changed: false,
            touched: false,
            value: '1',
          },
          test2: {
            disabled: false,
            errors: ['Value must be at least 2 characters'],
            valid: false,
            hidden: false,
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
            hidden: false,
            changed: false,
            value: '1',
          },
          test2: {
            disabled: false,
            errors: ['Value must be at least 2 characters'],
            valid: false,
            hidden: false,
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

  it('few forms with same name on page onSubmit', done => {
    expect.assertions(3);

    const onSubmit = jest.fn();

    const component = mount(
      createElement(Provider, { store: global.store }, [
        createElement(Form, { path: 'form', name: 'form[first]', id: 'first', onSubmit, key: 1 }, [
          createElement(Field, { key: 0, name: 'test1', value: '1', component: 'input' }),
          createElement(Field, { key: 1, name: 'test2', value: '1', component: 'input' }),
        ]),
        createElement(
          Form,
          { path: 'form', name: 'form[second]', id: 'second', onSubmit, key: 2 },
          [
            createElement(Field, { key: 0, name: 'test1', value: '2', component: 'input' }),
            createElement(Field, { key: 1, name: 'test2', value: '2', component: 'input' }),
          ],
        ),
      ]),
    );

    expect(global.store.getState()).toEqual({
      form: {
        first: {
          changed: false,
          fields: {
            test1: {
              changed: false,
              disabled: false,
              errors: [],
              hidden: false,
              touched: false,
              valid: true,
              value: '1',
            },
            test2: {
              changed: false,
              disabled: false,
              errors: [],
              hidden: false,
              touched: false,
              valid: true,
              value: '1',
            },
          },
          submitted: false,
          submitting: false,
          touched: false,
          valid: true,
        },
        second: {
          changed: false,
          fields: {
            test1: {
              changed: false,
              disabled: false,
              errors: [],
              hidden: false,
              touched: false,
              valid: true,
              value: '2',
            },
            test2: {
              changed: false,
              disabled: false,
              errors: [],
              hidden: false,
              touched: false,
              valid: true,
              value: '2',
            },
          },
          submitted: false,
          submitting: false,
          touched: false,
          valid: true,
        },
      },
    });

    component.find('form#first').simulate('submit');

    setImmediate(() => {
      expect(onSubmit).lastCalledWith(
        {
          test1: {
            changed: false,
            disabled: false,
            errors: [],
            hidden: false,
            touched: false,
            valid: true,
            value: '1',
          },
          test2: {
            changed: false,
            disabled: false,
            errors: [],
            hidden: false,
            touched: false,
            valid: true,
            value: '1',
          },
        },
        expect.anything(),
      );

      component.find('form#second').simulate('submit');

      setImmediate(() => {
        expect(onSubmit).lastCalledWith(
          {
            test1: {
              changed: false,
              disabled: false,
              errors: [],
              hidden: false,
              touched: false,
              valid: true,
              value: '2',
            },
            test2: {
              changed: false,
              disabled: false,
              errors: [],
              hidden: false,
              touched: false,
              valid: true,
              value: '2',
            },
          },
          expect.anything(),
        );

        done();
      });
    });
  });

  it('few forms with same name on page onSubmitFailed', done => {
    expect.assertions(2);
    jest.useFakeTimers();

    const onSubmitFailed = jest.fn();

    let component;
    act(() => {
      component = mount(
        createElement(Provider, { store: global.store }, [
          createElement(
            Form,
            { path: 'form', name: 'form[first]', id: 'first', onSubmitFailed, key: 1 },
            [
              createElement(Field, { key: 0, name: 'test1', value: '1', component: 'input' }),
              createElement(Field, { key: 1, name: 'test2', value: '1', component: 'input' }),
            ],
          ),
          createElement(
            Form,
            { path: 'form', name: 'form[second]', id: 'second', onSubmitFailed, key: 2 },
            [
              createElement(Field, { key: 0, name: 'test1', value: '2', component: 'input' }),
              createElement(Field, { key: 1, name: 'test2', value: '2', component: 'input' }),
            ],
          ),
        ]),
      );

      global.store.dispatch(
        setFieldsErrors('form[first]', {
          test1: ['error form1 test1'],
          test2: ['error form1 test2'],
        }),
      );

      global.store.dispatch(
        setFieldsErrors('form[second]', {
          test1: ['error form2 test1'],
          test2: ['error form2 test2'],
        }),
      );

      component.find('form#first').simulate('submit');
      jest.runAllTimers();
    });

    setImmediate(() => {
      expect(onSubmitFailed).lastCalledWith(
        {
          test1: {
            changed: false,
            disabled: false,
            errors: ['error form1 test1'],
            hidden: false,
            touched: false,
            valid: false,
            value: '1',
          },
          test2: {
            changed: false,
            disabled: false,
            errors: ['error form1 test2'],
            hidden: false,
            touched: false,
            valid: false,
            value: '1',
          },
        },
        {
          test1: {
            changed: false,
            disabled: false,
            errors: ['error form1 test1'],
            hidden: false,
            touched: false,
            valid: false,
            value: '1',
          },
          test2: {
            changed: false,
            disabled: false,
            errors: ['error form1 test2'],
            hidden: false,
            touched: false,
            valid: false,
            value: '1',
          },
        },
        expect.anything(),
      );

      act(() => {
        component.find('form#second').simulate('submit');
        jest.runAllTimers();
      });

      setImmediate(() => {
        expect(onSubmitFailed).lastCalledWith(
          {
            test1: {
              changed: false,
              disabled: false,
              errors: ['error form2 test1'],
              hidden: false,
              touched: false,
              valid: false,
              value: '2',
            },
            test2: {
              changed: false,
              disabled: false,
              errors: ['error form2 test2'],
              hidden: false,
              touched: false,
              valid: false,
              value: '2',
            },
          },
          {
            test1: {
              changed: false,
              disabled: false,
              errors: ['error form2 test1'],
              hidden: false,
              touched: false,
              valid: false,
              value: '2',
            },
            test2: {
              changed: false,
              disabled: false,
              errors: ['error form2 test2'],
              hidden: false,
              touched: false,
              valid: false,
              value: '2',
            },
          },
          expect.anything(),
        );

        done();
      });
    });
  });
});
