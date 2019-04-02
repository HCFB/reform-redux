import { Component, createElement } from 'react';
import { Provider } from 'react-redux';
import { Provider as ReactReduxProvider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import { Field, changeFieldValue, Form, setFieldHidden } from '../../index';
import { formInitialisation } from '../../actions/Form';

describe('components / Field', () => {
  it('snapshot', () => {
    const snapshot = shallow(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, { component: 'input', name: 'name' }),
        ),
      ),
    );
    expect(snapshot).toMatchSnapshot();
  });

  it('receive new prop checked for radio and checkbox types', done => {
    const wrapper = ({ checked = false }) =>
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            value: 'test',
            type: 'checkbox',
            checked,
          }),
        ),
      );
    const component = mount(createElement(wrapper));

    component.setProps({
      checked: true,
    });

    setImmediate(() => {
      expect(global.store.getState().form.fields.field.value).toBe('test');

      done();
    });
  });

  it('receive new prop changed and touched', () => {
    expect.assertions(8);

    const wrapper = ({ changed = false, touched = false }) =>
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            value: 'test',
            type: 'checkbox',
            changed,
            touched,
          }),
        ),
      );
    const component = mount(createElement(wrapper));

    component.setProps({
      changed: true,
      touched: true,
    });

    expect(global.store.getState().form.fields.field.touched).toBeTruthy();
    expect(global.store.getState().form.fields.field.changed).toBeTruthy();
    expect(global.store.getState().form.touched).toBeTruthy();
    expect(global.store.getState().form.changed).toBeTruthy();

    component.setProps({
      changed: false,
      touched: false,
    });

    expect(global.store.getState().form.fields.field.touched).toBeFalsy();
    expect(global.store.getState().form.fields.field.changed).toBeFalsy();
    expect(global.store.getState().form.touched).toBeFalsy();
    expect(global.store.getState().form.changed).toBeFalsy();
  });

  it('dynamically create new fields in form', () => {
    expect.assertions(2);
    jest.useFakeTimers();
    class Test extends Component {
      state = {
        showFields: false,
      };

      static getDerivedStateFromProps({ showFields }) {
        return { showFields };
      }

      render() {
        return createElement(
          Provider,
          { store: global.store },
          createElement(
            Form,
            { path: 'form' },
            this.state.showFields
              ? [
                  createElement(Field, {
                    name: 'field',
                    component: 'input',
                    key: 0,
                  }),
                ]
              : null,
          ),
        );
      }
    }

    const component = mount(createElement(Test));

    expect(global.store.getState().form.fields).toEqual({});

    component.setProps({
      showFields: true,
    });

    jest.runAllTimers();

    component
      .find('input')
      .simulate('change', { nativeEvent: new Event('change'), target: { value: 'test' } });

    expect(global.store.getState().form.fields).toEqual({
      field: {
        value: 'test',
        errors: [],
        changed: true,
        hidden: false,
        touched: false,
        valid: true,
        disabled: false,
      },
    });
  });

  it('remove field on unmount', () => {
    expect.assertions(2);

    class Test extends Component {
      render() {
        return createElement(
          Provider,
          { store: global.store },
          createElement(Form, { path: 'form' }, [
            !this.props.hidden
              ? createElement(Field, {
                  name: 'field',
                  component: 'input',
                  removeOnUnmount: true,
                  key: 0,
                })
              : null,
            createElement(Field, {
              name: 'field1',
              component: 'input',
              key: 1,
            }),
          ]),
        );
      }
    }

    const component = mount(createElement(Test));

    expect(global.store.getState().form.fields).toEqual({
      field: {
        value: '',
        errors: [],
        changed: false,
        touched: false,
        hidden: false,
        valid: true,
        disabled: false,
      },
      field1: {
        value: '',
        errors: [],
        changed: false,
        touched: false,
        hidden: false,
        valid: true,
        disabled: false,
      },
    });

    component.setProps({ hidden: true });

    expect(global.store.getState().form.fields).toEqual({
      field1: {
        value: '',
        errors: [],
        changed: false,
        hidden: false,
        touched: false,
        valid: true,
        disabled: false,
      },
    });
  });

  it('if component is not in Form component then throw error', () => {
    console.error = jest.fn(); // eslint-disable-line
    expect(() =>
      mount(
        createElement(
          ReactReduxProvider,
          { store: global.store },
          createElement(Field, { name: 'name', component: 'input' }),
        ),
      ),
    ).toThrow('Component `Field` must be in `Form` component.');
  });

  it('check component prop types', () => {
    expect.assertions(3);

    let errors = [];
    console.error = error => errors.push(error); // eslint-disable-line no-console
    let expectedErrors = [
      'Warning: Failed prop type: The prop `name` is marked as required in `Field`, but its value is `undefined`.',
      'Warning: Failed prop type: The prop `component` is marked as required in `Field`, but its value is `undefined`.',
    ];

    try {
      mount(createElement(global.Provider, {}, createElement(Field)));
    } catch (e) {
      expect(errors[0]).toEqual(expect.stringContaining(expectedErrors[0]));
      expect(errors[1]).toEqual(expect.stringContaining(expectedErrors[1]));
    }

    errors = [];
    expectedErrors = [
      'Warning: Failed prop type: Invalid prop `normalize` of type `string` supplied to `Field`, expected `function`.',
    ];

    try {
      mount(
        createElement(
          global.Provider,
          {},
          createElement(Field, {
            name: 'test',
            normalize: 'test',
          }),
        ),
      );
    } catch {
      expect(errors[0]).toEqual(expect.stringContaining(expectedErrors[0]));
    }
  });

  it('if component with prop type=select and prop=multiple and value with type not array then throw error', () => {
    expect(() =>
      mount(
        createElement(
          Provider,
          { store: global.store },
          createElement(
            Form,
            { path: 'form' },
            createElement(Field, {
              name: 'test',
              component: 'select',
              multiple: true,
              value: 'test',
            }),
          ),
        ),
      ),
    ).toThrow(
      'The `value` prop supplied to Field with type "select" must be an array if `multiple` is true.',
    );
  });

  it('if you pass disabled and value props then this props will in state.field.value and state.field.disabled.', () => {
    expect.assertions(10);

    let component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'test',
            component: 'input',
            value: 'test',
            disabled: true,
            touched: true,
            changed: true,
            hidden: true,
          }),
        ),
      ),
    );

    expect(component.find('Field[name="test"]').state('field').value).toBe('test');
    expect(component.find('Field[name="test"]').state('field').disabled).toBeTruthy();
    expect(component.find('Field[name="test"]').state('field').touched).toBeTruthy();
    expect(component.find('Field[name="test"]').state('field').changed).toBeTruthy();
    expect(component.find('Field[name="test"]').state('field').hidden).toBeTruthy();

    component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'test1',
            component: 'input',
          }),
        ),
      ),
    );

    expect(component.find('Field[name="test1"]').state('field').value).toBe('');
    expect(component.find('Field[name="test1"]').state('field').disabled).toBeFalsy();
    expect(component.find('Field[name="test1"]').state('field').touched).toBeFalsy();
    expect(component.find('Field[name="test1"]').state('field').changed).toBeFalsy();
    expect(component.find('Field[name="test1"]').state('field').hidden).toBeFalsy();
  });

  it('if component type is checkbox or radio value must be an empty string.', () => {
    expect.assertions(2);

    let component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'test',
            component: 'input',
            value: 'test',
            type: 'checkbox',
          }),
        ),
      ),
    );

    expect(component.find('Field[name="test"]').state('field').value).toBe('');

    component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'test',
            component: 'input',
            value: 'test',
            type: 'radio',
          }),
        ),
      ),
    );

    expect(component.find('Field[name="test"]').state('field').value).toBe('');
  });

  it('check value of checkbox without value props in validate function.', done => {
    let component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'test',
            component: 'input',
            type: 'checkbox',
            touched: true,
            validate: value => {
              if (value) {
                expect(value).toBeTruthy();
                done();
              }
            },
          }),
        ),
      ),
    );

    const event = { nativeEvent: new Event('change'), target: { checked: true } };
    component.find(Field).simulate('change', event);
  });

  it('if in redux store exists field data then take it from redux store and write to field state.', () => {
    global.store.dispatch(
      formInitialisation('form', {
        field: {
          value: '',
          errors: [],
          valid: true,
          disabled: false,
        },
      }),
    );

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            value: 'test',
            type: 'checkbox',
          }),
        ),
      ),
    );

    expect(component.find('Field[name="field"]').state('field').value).toBe('');
  });

  it('component onChange', () => {
    expect.assertions(4);

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
          }),
        ),
      ),
    );

    component
      .find('input')
      .simulate('change', { nativeEvent: new Event('change'), target: { value: 'test' } });

    expect(component.find('input').prop('value')).toBe('test');
    expect(global.store.getState().form.fields.field.value).toBe('test');
    expect(global.store.getState().form.fields.field.changed).toBe(true);
    expect(global.store.getState().form.changed).toBe(true);
  });

  it('component with custom onChange', () => {
    expect.assertions(2);

    const onChange = jest.fn();
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            onChange,
          }),
        ),
      ),
    );
    const newEvent = value => ({ nativeEvent: new Event('change'), target: { value } });

    component.find('input').simulate('change', newEvent('value'));

    expect(onChange).toBeCalledWith(expect.anything(), 'value', '');

    component.find('input').simulate('change', newEvent('value1'));

    expect(onChange).toBeCalledWith(expect.anything(), 'value1', 'value');
  });

  it('validate on onChange after onBlur', done => {
    expect.assertions(6);

    const validate = value => {
      if (value.length > 3) return 'Must be 3 characters or less.';
    };
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            validate,
          }),
        ),
      ),
    );

    expect(global.store.getState().form.touched).toBeFalsy();
    expect(global.store.getState().form.fields.field.touched).toBeFalsy();

    const input = component.find('input');
    input.simulate('blur');

    const getEvent = value => ({ nativeEvent: new Event('change'), target: { value } });
    input.simulate('change', getEvent('test'));

    expect(global.store.getState().form.touched).toBeTruthy();
    expect(global.store.getState().form.fields.field.touched).toBeTruthy();

    setImmediate(() => {
      expect(global.store.getState().form.fields.field.errors).toEqual([
        'Must be 3 characters or less.',
      ]);

      input.simulate('change', getEvent('tes'));

      setImmediate(() => {
        expect(global.store.getState().form.fields.field.errors).toEqual([]);
        done();
      });
    });
  });

  it('normalize value on onChange', done => {
    const normalize = value => value && value.toUpperCase();
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            normalize,
          }),
        ),
      ),
    );

    const event = { nativeEvent: new Event('change'), target: { value: 'test' } };
    const input = component.find('input');

    input.simulate('change', event);

    setImmediate(() => {
      expect(global.store.getState().form.fields.field.value).toBe('TEST');
      done();
    });
  });

  it('normalize function was called with right arguments', () => {
    const normalize = jest.fn();
    normalize.mockReturnValue('TEST');
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            normalize,
          }),
        ),
      ),
    );

    const event = { nativeEvent: new Event('change'), target: { value: 'test' } };
    const input = component.find('input');

    input.simulate('change', event);

    expect(normalize).lastCalledWith(
      'test',
      'TEST',
      {
        field: {
          disabled: false,
          errors: [],
          touched: false,
          hidden: false,
          valid: true,
          changed: false,
          value: 'TEST',
        },
      },
      'onChange',
      'field',
    );
  });

  it('get field value from simple data in custom component', () => {
    class Input extends Component {
      onChange = event => {
        this.props.onChange(event.target.value);
      };

      render() {
        return createElement('input', { onChange: this.onChange });
      }
    }

    const onChange = (data, value) => expect(value).toBe('test');
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: Input,
            onChange,
          }),
        ),
      ),
    );

    const event = { nativeEvent: new Event('change'), target: { value: 'test' } };
    component.find('input').simulate('change', event);
  });

  it('through props change value of list of checkbox components', () => {
    const wrapper = ({ checked = false }) => {
      return createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            key: 0,
            name: 'field',
            component: 'input',
            value: '1',
            type: 'checkbox',
          }),
          createElement(Field, {
            key: 1,
            name: 'field',
            value: '2',
            checked,
            component: 'input',
            type: 'checkbox',
          }),
        ]),
      );
    };

    const component = mount(createElement(wrapper));
    component.setProps({ checked: true });

    expect(global.store.getState().form.fields.field.value).toEqual(['2']);
  });

  it('set field value in list of custom checkbox components', done => {
    class Checkbox extends Component {
      onChange = event => {
        this.props.onChange(event.target.checked);
      };

      render() {
        return createElement('input', { type: 'checkbox', onChange: this.onChange });
      }
    }

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            key: 0,
            name: 'field',
            component: Checkbox,
            value: '1',
            type: 'checkbox',
          }),
          createElement(Field, {
            key: 1,
            name: 'field',
            value: '2',
            component: Checkbox,
            type: 'checkbox',
          }),
        ]),
      ),
    );

    const event = { nativeEvent: new Event('change'), target: { checked: true } };
    component
      .find('input')
      .first()
      .simulate('change', event);

    setImmediate(() => {
      expect(global.store.getState().form.fields.field.value).toEqual(['1']);
      done();
    });
  });

  it('get field value from event in custom component', () => {
    class Input extends Component {
      onChange = event => {
        this.props.onChange(event);
      };

      render() {
        return createElement('input', { onChange: this.onChange });
      }
    }

    const onChange = (data, value) => expect(value).toBe('test');
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: Input,
            onChange,
          }),
        ),
      ),
    );

    const event = { nativeEvent: new Event('change'), target: { value: 'test' } };
    component.find('input').simulate('change', event);
  });

  it('get field value in select component with prop=multiple', () => {
    const onChange = (data, value) => expect(value).toEqual(['test2', 'test1']);
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(
            Field,
            {
              name: 'field',
              component: 'select',
              multiple: true,
              onChange,
            },
            [
              createElement('option', { value: 'test1', key: 1 }, 'test1'),
              createElement('option', { value: 'test2', key: 2 }, 'test2'),
            ],
          ),
        ),
      ),
    );

    const event = {
      nativeEvent: new Event('change'),
      target: { selectedOptions: [{ value: 'test2' }, { value: 'test1' }] },
    };
    component.find('select').simulate('change', event);
  });

  it('get field value in checkbox component', () => {
    expect.assertions(4);
    let checked = 0;

    const onChange = (data, value) => {
      checked++;
      expect(value).toBe(checked < 3 ? true : '');
    };
    const onChangeSecond = (data, value) => {
      checked++;
      expect(value).toBe(checked < 3 ? 'test' : '');
    };

    let component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            name: 'field',
            className: 'field',
            component: 'input',
            type: 'checkbox',
            key: 1,
            onChange,
          }),
          createElement(Field, {
            name: 'field1',
            className: 'field1',
            component: 'input',
            type: 'checkbox',
            value: 'test',
            key: 2,
            onChange: onChangeSecond,
          }),
        ]),
      ),
    );

    const event = checked => ({
      nativeEvent: new Event('change'),
      target: { checked },
    });
    component.find('input.field').simulate('change', event(true));
    component.find('input.field1').simulate('change', event(true));

    component.find('input.field').simulate('change', event(false));
    component.find('input.field1').simulate('change', event(false));
  });

  it('get field value in two checkbox components with same name', () => {
    expect.assertions(5);
    let checked = 0;

    const onChange = (data, value) => {
      checked++;

      if (checked === 1) {
        expect(value).toEqual(['field']);
      } else if (checked === 2) {
        expect(value).toEqual(['field', 'field1']);
      } else if (checked === 3) {
        expect(value).toEqual(['field1']);
      } else {
        expect(value).toEqual([]);
      }
    };

    let component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            name: 'field',
            className: 'field',
            component: 'input',
            type: 'checkbox',
            value: 'field',
            key: 1,
            onChange,
          }),
          createElement(Field, {
            name: 'field',
            className: 'field1',
            component: 'input',
            type: 'checkbox',
            value: 'field1',
            key: 2,
            onChange,
          }),
        ]),
      ),
    );

    expect(global.store.getState().form.fields.field.value).toEqual([]);

    const event = checked => ({
      nativeEvent: new Event('change'),
      target: { checked },
    });
    component.find('input.field').simulate('change', event(true));
    component.find('input.field1').simulate('change', event(true));

    component.find('input.field').simulate('change', event(false));
    component.find('input.field1').simulate('change', event(false));
  });

  it('get field value in radio components', () => {
    expect.assertions(2);
    let checked = 0;

    const onChange = (data, value) => {
      checked++;

      if (checked === 1) {
        expect(value).toEqual('field');
      } else {
        expect(value).toEqual('');
      }
    };

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            type: 'radio',
            value: 'field',
            onChange,
          }),
        ),
      ),
    );

    const event = checked => ({
      nativeEvent: new Event('change'),
      target: { checked },
    });
    component.find('input').simulate('change', event(true));
    component.find('input').simulate('change', event(false));
  });

  it('get field value in checked radio component', () => {
    mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            type: 'radio',
            checked: true,
            value: 'field',
          }),
        ),
      ),
    );

    expect(global.store.getState().form.fields.field.value).toBe('field');
  });

  it('validate on onBlur if field was not touched', done => {
    const validate = value => {
      if (!value.length) return 'Required!';
    };
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            validate,
          }),
        ),
      ),
    );

    const input = component.find('input');
    const event = { nativeEvent: new Event('blur') };
    input.simulate('blur', event);

    setImmediate(() => {
      expect(global.store.getState().form.fields.field.errors).toEqual(['Required!']);

      setImmediate(() => {
        input.simulate('change', { nativeEvent: new Event('change'), target: { value: 'test' } });

        setImmediate(() => {
          expect(global.store.getState().form.fields.field.errors).toEqual([]);
          done();
        });
      });
    });
  });

  it('normalize value on onInit', () => {
    expect.assertions(3);

    const normalize = jest.fn();
    normalize.mockReturnValue('TEST');

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            value: 'test',
            normalize,
          }),
        ),
      ),
    );

    expect(normalize).toBeCalledWith('test', '', {}, 'onInit', 'field');
    expect(global.store.getState().form.fields.field.value).toBe('TEST');
    expect(component.find('input').prop('value')).toBe('TEST');
  });

  it('normalize value on onBlur', () => {
    const normalize = jest.fn();
    normalize.mockReturnValue('TEST');

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            normalize,
          }),
        ),
      ),
    );

    const event = { nativeEvent: new Event('blur'), target: { value: 'test' } };
    const input = component.find('input');

    input.simulate('blur', event);

    expect(normalize).lastCalledWith(
      'test',
      'TEST',
      {
        field: {
          disabled: false,
          errors: [],
          touched: false,
          valid: true,
          hidden: false,
          changed: false,
          value: 'TEST',
        },
      },
      'onBlur',
      'field',
    );
  });

  it('component with custom onBlur', () => {
    const onBlur = jest.fn();
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            onBlur,
          }),
        ),
      ),
    );
    const event = { nativeEvent: new Event('blur') };

    component.find('input').simulate('blur', event);

    expect(onBlur).toBeCalledWith(expect.anything(), {
      disabled: false,
      errors: [],
      changed: false,
      touched: false,
      hidden: false,
      valid: true,
      value: '',
    });
  });

  it('component with custom onFocus', () => {
    const onFocus = jest.fn();
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            onFocus,
          }),
        ),
      ),
    );
    const event = { nativeEvent: new Event('focus') };

    component.find('input').simulate('focus', event);

    expect(onFocus).toBeCalledWith(expect.anything(), {
      disabled: false,
      errors: [],
      changed: false,
      hidden: false,
      touched: false,
      valid: true,
      value: '',
    });
  });

  it('normalize value on onFocus', () => {
    const normalize = jest.fn();
    normalize.mockReturnValue('TEST');

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'input',
            normalize,
          }),
        ),
      ),
    );

    const event = { nativeEvent: new Event('focus') };
    const input = component.find('input');

    input.simulate('focus', event);

    expect(normalize).lastCalledWith(
      'TEST',
      'TEST',
      {
        field: {
          disabled: false,
          changed: false,
          touched: false,
          hidden: false,
          errors: [],
          valid: true,
          value: 'TEST',
        },
      },
      'onFocus',
      'field',
    );
  });

  it('custom component props', () => {
    const customComponent = () => {
      return 'test';
    };
    const refFunciton = jest.fn();
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            innerRef: refFunciton,
            component: customComponent,
          }),
        ),
      ),
    );
    const input = component.find(customComponent);

    expect(Object.keys(input.props())).toEqual([
      'reactReduxContextGetState',
      'reactReduxContextSubscribe',
      'reformReduxContextGetFieldCount',
      'reformReduxContextSetFieldTouched',
      'reformReduxContextSetFieldChanged',
      'reformReduxContextChangeFieldValue',
      'reformReduxContextSetFieldErrors',
      'reformReduxContextFormName',
      'reformReduxContextFormPath',
      'reformReduxContextFormUnregisterField',
      'reformReduxContextFormRegisterField',
      'reformReduxContextCoreUpdateStackFieldValue',
      'value',
      'hidden',
      'onChange',
      'onBlur',
      'onFocus',
      'disabled',
      'formName',
      'errors',
      'changed',
      'touched',
    ]);
  });

  it('simple input component props', () => {
    expect.assertions(2);

    const refFunciton = jest.fn();
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            ref: refFunciton,
            component: 'input',
          }),
        ),
      ),
    );
    const input = component.find('input');

    expect(Object.keys(input.props())).toEqual([
      'value',
      'hidden',
      'onChange',
      'onBlur',
      'onFocus',
      'disabled',
    ]);
    expect(refFunciton).toBeCalledWith(expect.anything());
  });

  it('component select with prop multiple must have value with type array', () => {
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            component: 'select',
            multiple: true,
          }),
        ),
      ),
    );

    const select = component.find('select');
    expect(select.prop('value')).toEqual([]);
  });

  it('in not string components exists formName and errors props', () => {
    mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, {
            name: 'field',
            innerRef: () => {},
            component: props => {
              expect(Object.keys(props)).toEqual(expect.arrayContaining(['formName', 'errors']));
              return 'test';
            },
          }),
        ),
      ),
    );
  });

  it("check that passed value doesn't change value of field if you have few components with same name", () => {
    expect.assertions(2);

    const component = ({ value1, value2 }) =>
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            name: 'field',
            component: 'input',
            type: 'checkbox',
            checked: true,
            value: value1,
            key: 0,
          }),
          createElement(Field, {
            name: 'field',
            component: 'input',
            type: 'checkbox',
            checked: true,
            value: value2,
            key: 1,
          }),
        ]),
      );

    const mountedComponent = mount(createElement(component, { value1: 1, value2: 2 }));

    expect(global.store.getState().form.fields.field.value).toEqual([1, 2]);

    mountedComponent.setProps({ value1: 'test' });

    expect(global.store.getState().form.fields.field.value).toEqual([1, 2]);
  });

  it('checkbox value should be bool if prop does not exists', () => {
    expect.assertions(4);

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            name: 'field',
            component: 'input',
            type: 'checkbox',
            key: 0,
          }),
        ]),
      ),
    );

    expect(global.store.getState().form.fields.field.value).toBeFalsy();

    const event = { nativeEvent: new Event('change'), target: { checked: true } };
    const input = component.find('input');
    expect(component.find('input').props().checked).toBeFalsy();

    input.simulate('change', event);

    expect(component.find('input').props().checked).toBeTruthy();
    expect(global.store.getState().form.fields.field.value).toBeTruthy();
  });

  it('checked prop in two checkboxes with same name', () => {
    expect.assertions(2);

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            name: 'field',
            component: 'input',
            type: 'checkbox',
            checked: true,
            value: 'field1',
            key: 0,
          }),
          createElement(Field, {
            name: 'field',
            component: 'input',
            type: 'checkbox',
            className: 'field2',
            value: 'field2',
            key: 1,
          }),
        ]),
      ),
    );

    expect(component.find('Field.field2').instance().state.field.value).toEqual(['field1']);

    global.store.dispatch(changeFieldValue('form', 'field', ['field2']));

    expect(component.find('Field.field2').instance().state.field.value).toEqual(['field2']);
  });

  it('hidden state works correctly', done => {
    expect.assertions(2);

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            name: 'field',
            component: 'input',
            type: 'checkbox',
            checked: true,
            value: 'field1',
            key: 0,
          }),
        ]),
      ),
    );

    expect(component.find('input').length).toBe(1);

    global.store.dispatch(setFieldHidden('form', 'field', true));
    component.update();

    setImmediate(() => {
      expect(component.find('input').length).toBe(0);

      done();
    });
  });

  it('value in few checkboxes with same name', () => {
    const component1 = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            name: 'field1',
            component: 'input',
            type: 'checkbox',
            checked: true,
            value: 'field1',
            key: 0,
          }),
          createElement(Field, {
            name: 'field1',
            component: 'input',
            checked: true,
            type: 'checkbox',
            className: 'field3',
            value: 'field2',
            key: 1,
          }),
        ]),
      ),
    );

    expect(component1.find('Field.field3').instance().state.field.value).toEqual([
      'field1',
      'field2',
    ]);
  });

  it('in radio or checkbox components exists checked and value props', () => {
    expect.assertions(2);

    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            name: 'field',
            component: 'input',
            type: 'radio',
            key: 0,
          }),
          createElement(Field, {
            name: 'field1',
            component: 'input',
            type: 'checkbox',
            key: 1,
          }),
        ]),
      ),
    );

    const radio = component.find('input[type="radio"]');
    const checkbox = component.find('input[type="checkbox"]');
    expect(Object.keys(radio.props())).toEqual(expect.arrayContaining(['checked', 'value']));
    expect(Object.keys(checkbox.props())).toEqual(expect.arrayContaining(['checked', 'value']));
  });

  it('mount and unmount list of checkboxes with default value with removeOnUnmount props', () => {
    expect.assertions(3);
    jest.useFakeTimers();

    const wrapper = ({ visible = true }) => {
      return createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          visible
            ? [
                createElement(Field, {
                  key: 0,
                  name: 'field',
                  component: 'input',
                  value: 1,
                  removeOnUnmount: true,
                  checked: true,
                  type: 'checkbox',
                }),
                createElement(Field, {
                  key: 1,
                  name: 'field',
                  value: 2,
                  removeOnUnmount: true,
                  component: 'input',
                  type: 'checkbox',
                }),
              ]
            : null,
        ),
      );
    };

    const component = mount(createElement(wrapper));

    expect(global.store.getState().form.fields.field.value).toEqual([1]);

    component.setProps({ visible: false });

    expect(global.store.getState().form.fields).toEqual({});

    component.setProps({ visible: true });

    jest.runAllTimers();

    expect(global.store.getState().form.fields.field.value).toEqual([1]);
  });

  it('mount and unmount list of checkboxes with default value without removeOnUnmount props', () => {
    expect.assertions(3);
    jest.useFakeTimers();

    const wrapper = ({ visible = true }) => {
      return createElement(
        Provider,
        { store: global.store },
        createElement(
          Form,
          { path: 'form' },
          visible
            ? [
                createElement(Field, {
                  key: 0,
                  name: 'field',
                  component: 'input',
                  value: 1,
                  checked: true,
                  type: 'checkbox',
                }),
                createElement(Field, {
                  key: 1,
                  name: 'field',
                  value: 2,
                  checked: true,
                  component: 'input',
                  type: 'checkbox',
                }),
              ]
            : null,
        ),
      );
    };

    const component = mount(createElement(wrapper));

    expect(global.store.getState().form.fields.field.value).toEqual([1, 2]);

    component.setProps({ visible: false });

    expect(global.store.getState().form.fields).toEqual({
      field: {
        changed: false,
        disabled: false,
        hidden: false,
        errors: [],
        touched: false,
        valid: true,
        value: [1, 2],
      },
    });

    component.setProps({ visible: true });

    jest.runAllTimers();

    expect(global.store.getState().form.fields.field.value).toEqual([1, 2]);
  });

  it('dont reset values on form update', () => {
    expect.assertions(4);
    jest.useFakeTimers();

    const wrapper = ({ visible = false, change = false }) => {
      return createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          visible
            ? createElement(Field, {
                key: 0,
                name: 'field',
                component: 'input',
                value: 1,
                checked: true,
                type: 'checkbox',
              })
            : null,
          createElement(Field, {
            key: 1,
            name: 'field',
            value: 2,
            checked: true,
            component: 'input',
            type: 'checkbox',
          }),
          createElement(Field, {
            key: 3,
            name: 'field2',
            value: change ? 'field2 value' : '',
            component: 'input',
            type: 'text',
          }),
        ]),
      );
    };

    const component = mount(createElement(wrapper));

    expect(global.store.getState().form.fields.field.value).toBe(2);
    expect(global.store.getState().form.fields.field2.value).toBe('');

    component.setProps({ change: true });

    expect(global.store.getState().form.fields.field2.value).toBe('field2 value');

    component.setProps({ visible: true });

    jest.runAllTimers();

    expect(global.store.getState().form.fields).toEqual({
      field: {
        changed: false,
        disabled: false,
        errors: [],
        touched: false,
        hidden: false,
        valid: true,
        value: [2, 1],
      },
      field2: {
        changed: false,
        disabled: false,
        hidden: false,
        errors: [],
        touched: false,
        valid: true,
        value: 'field2 value',
      },
    });
  });
});
