import { Component, createElement } from 'react';
import { shallow, mount } from 'enzyme';
import { getIn, List, Map, is } from 'immutable';
import { Field } from '../../immutable';
import { formInitialisation } from '../../actions/Form';
import { changeFieldValue } from '../../actions/Field';

describe('components / Field.immutable', () => {
  it('snapshot', () => {
    const snapshot = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, { component: 'input', name: 'test' }),
      ),
    );
    expect(snapshot).toMatchSnapshot();
  });

  it('if component is not in Form component then throw error', () => {
    console.error = jest.fn(); // eslint-disable-line
    expect(() => mount(createElement(Field))).toThrow(
      'Component `Field` must be in `Form` component.',
    );
  });

  it('if component with prop type=select and prop=multiple and value with type not array then throw error', () => {
    expect(() =>
      mount(
        createElement(
          global.Provider,
          {},
          createElement(Field, {
            name: 'test',
            component: 'select',
            multiple: true,
            value: 'test',
          }),
        ),
      ),
    ).toThrow(
      'The `value` prop supplied to Field with type "select" must be an array if `multiple` is true.',
    );
  });

  it('if you pass disabled and value props then this props will in state.field.value and state.field.disabled.', () => {
    expect.assertions(4);

    let component = shallow(
      createElement(Field, {
        name: 'test',
        component: 'input',
        value: 'test',
        disabled: true,
      }),
      {
        context: global.immutableContext,
      },
    );

    expect(getIn(component.dive().state('field'), ['value'])).toBe('test');
    expect(getIn(component.dive().state('field'), ['disabled'])).toBeTruthy();

    component = shallow(
      createElement(Field, {
        name: 'test',
        component: 'input',
      }),
      {
        context: global.immutableContext,
      },
    );

    expect(getIn(component.dive().state('field'), ['value'])).toBe('');
    expect(getIn(component.dive().state('field'), ['disabled'])).toBeFalsy();
  });

  it('if component type is checkbox or radio value must be an empty string.', () => {
    expect.assertions(2);

    let component = shallow(
      createElement(Field, {
        name: 'test',
        component: 'input',
        value: 'test',
        type: 'checkbox',
      }),
      {
        context: global.immutableContext,
      },
    );

    expect(getIn(component.dive().state('field'), ['value'])).toBe('');

    component = shallow(
      createElement(Field, {
        name: 'test',
        component: 'input',
        value: 'test',
        type: 'radio',
      }),
      {
        context: global.immutableContext,
      },
    );

    expect(getIn(component.dive().state('field'), ['value'])).toBe('');
  });

  it('if in redux store exists field data then take it from redux store and write to field state.', () => {
    global.immutableStore.dispatch(
      formInitialisation(
        'form',
        Map({
          field: {
            value: '',
            errors: List(),
            valid: true,
            disabled: false,
          },
        }),
      ),
    );

    const component = shallow(
      createElement(Field, {
        name: 'field',
        component: 'input',
        value: 'test',
        type: 'checkbox',
      }),
      {
        context: global.immutableContext,
      },
    );

    expect(getIn(component.dive().state('field'), ['value'])).toBe('');
  });

  it('component onChange', () => {
    expect.assertions(2);

    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
        }),
      ),
    );

    component
      .find('input')
      .simulate('change', { nativeEvent: new Event('change'), target: { value: 'test' } });

    expect(component.find('input').prop('value')).toBe('test');
    expect(getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'value'])).toBe(
      'test',
    );
  });

  it('component with custom onChange', () => {
    const onChange = jest.fn();
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          onChange,
        }),
      ),
    );
    const value = 'test';
    const event = { nativeEvent: new Event('change'), target: { value } };

    component.find('input').simulate('change', event);

    expect(onChange).toBeCalledWith(expect.anything(), value);
  });

  it('validate on onChange after onBlur', done => {
    expect.assertions(2);

    const validate = value => {
      if (value.length > 3) return 'Must be 3 characters or less.';
    };
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          validate,
        }),
      ),
    );

    const input = component.find('input');
    input.simulate('blur');

    const getEvent = value => ({ nativeEvent: new Event('change'), target: { value } });
    input.simulate('change', getEvent('test'));

    setImmediate(() => {
      expect(
        is(
          getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'errors']),
          List(['Must be 3 characters or less.']),
        ),
      ).toBeTruthy();

      input.simulate('change', getEvent('tes'));

      setImmediate(() => {
        expect(
          getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'errors']).size,
        ).toBe(0);

        done();
      });
    });
  });

  it('normalize value on onChange', done => {
    const normalize = value => value && value.toUpperCase();
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          normalize,
        }),
      ),
    );

    const event = { nativeEvent: new Event('change'), target: { value: 'test' } };
    const input = component.find('input');

    input.simulate('change', event);

    setImmediate(() => {
      expect(getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'value'])).toBe(
        'TEST',
      );
      done();
    });
  });

  it('normalize function was called with right arguments', () => {
    const normalize = jest.fn();
    normalize.mockReturnValue('TEST');

    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          normalize,
        }),
      ),
    );

    const event = { nativeEvent: new Event('change'), target: { value: 'test' } };
    const input = component.find('input');

    input.simulate('change', event);

    expect(normalize).lastCalledWithImmutable(
      'test',
      'TEST',
      Map({
        field: Map({
          disabled: false,
          changed: false,
          touched: false,
          errors: List(),
          valid: true,
          value: 'TEST',
        }),
      }),
      'onChange',
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
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: Input,
          onChange,
        }),
      ),
    );

    const event = { nativeEvent: new Event('change'), target: { value: 'test' } };
    component.find('input').simulate('change', event);
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
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: Input,
          onChange,
        }),
      ),
    );

    const event = { nativeEvent: new Event('change'), target: { value: 'test' } };
    component.find('input').simulate('change', event);
  });

  it('get field value in select component with prop=multiple', () => {
    const onChange = (data, value) => expect(is(value, List(['test2', 'test1']))).toBeTruthy();
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
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
      expect(value).toBe('');
    };
    const onChangeSecond = (data, value) => {
      checked++;
      expect(value).toBe(checked < 3 ? 'test' : '');
    };

    let component = mount(
      createElement(global.Provider, { immutable: true }, [
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
        expect(is(value, List(['field']))).toBeTruthy();
      } else if (checked === 2) {
        expect(is(value, List(['field', 'field1']))).toBeTruthy();
      } else if (checked === 3) {
        expect(is(value, List(['field1']))).toBeTruthy();
      } else {
        expect(is(value, List())).toBeTruthy();
      }
    };

    let component = mount(
      createElement(global.Provider, { immutable: true }, [
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
    );

    expect(
      is(getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'value']), List()),
    ).toBeTruthy();

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
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          type: 'radio',
          value: 'field',
          onChange,
        }),
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
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          type: 'radio',
          checked: true,
          value: 'field',
        }),
      ),
    );

    expect(getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'value'])).toBe(
      'field',
    );
  });

  it('validate on onBlur if field was not touched', done => {
    const validate = value => {
      if (!value.length) return 'Required!';
    };
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          validate,
        }),
      ),
    );

    const input = component.find('input');
    const event = { nativeEvent: new Event('blur') };
    input.simulate('blur', event);

    setImmediate(() => {
      expect(
        is(
          getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'errors']),
          List(['Required!']),
        ),
      ).toBeTruthy();

      setImmediate(() => {
        input.simulate('change', { nativeEvent: new Event('change'), target: { value: 'test' } });

        setImmediate(() => {
          expect(
            is(
              getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'errors']),
              List(),
            ),
          ).toBeTruthy();
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
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          value: 'test',
          normalize,
        }),
      ),
    );

    expect(normalize).lastCalledWithImmutable('test', '', Map(), 'onInit');
    expect(getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'value'])).toBe(
      'TEST',
    );
    expect(component.find('input').prop('value')).toBe('TEST');
  });

  it('normalize value on onBlur', () => {
    const normalize = jest.fn();
    normalize.mockReturnValue('TEST');

    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          normalize,
        }),
      ),
    );

    const event = { nativeEvent: new Event('blur'), target: { value: 'test' } };
    const input = component.find('input');

    input.simulate('blur', event);

    expect(normalize).lastCalledWithImmutable(
      'TEST',
      'TEST',
      Map({
        field: Map({
          disabled: false,
          changed: false,
          touched: false,
          errors: List(),
          valid: true,
          value: 'TEST',
        }),
      }),
      'onBlur',
    );
  });

  it('component with custom onBlur', () => {
    const onBlur = jest.fn();
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          onBlur,
        }),
      ),
    );
    const event = { nativeEvent: new Event('blur') };

    component.find('input').simulate('blur', event);

    expect(onBlur).lastCalledWithImmutable(
      expect.anything(),
      Map({
        disabled: false,
        errors: List(),
        valid: true,
        touched: false,
        changed: false,
        value: '',
      }),
    );
  });

  it('component with custom onFocus', () => {
    const onFocus = jest.fn();
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          onFocus,
        }),
      ),
    );
    const event = { nativeEvent: new Event('focus') };

    component.find('input').simulate('focus', event);

    expect(onFocus).lastCalledWithImmutable(
      expect.anything(),
      Map({
        disabled: false,
        errors: List(),
        changed: false,
        touched: false,
        valid: true,
        value: '',
      }),
    );
  });

  it('normalize value on onFocus', () => {
    const normalize = jest.fn();
    normalize.mockReturnValue('TEST');

    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
          normalize,
        }),
      ),
    );

    const event = { nativeEvent: new Event('focus') };
    const input = component.find('input');

    input.simulate('focus', event);

    expect(normalize).lastCalledWithImmutable(
      'TEST',
      'TEST',
      Map({
        field: Map({
          disabled: false,
          changed: false,
          touched: false,
          errors: List(),
          valid: true,
          value: 'TEST',
        }),
      }),
      'onFocus',
    );
  });

  it('simple input component props', () => {
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'input',
        }),
      ),
    );
    const input = component.find('input');

    expect(Object.keys(input.props())).toEqual([
      'value',
      'onChange',
      'onBlur',
      'onFocus',
      'disabled',
    ]);
  });

  it('component select with prop multiple must have value with type array', () => {
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: 'select',
          multiple: true,
        }),
      ),
    );

    const select = component.find('select');
    expect(select.prop('value')).toEqual([]);
  });

  it('in not string components exists formName and errors props', () => {
    mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field',
          component: props => {
            expect(Object.keys(props)).toEqual(expect.arrayContaining(['formName', 'errors']));
            return 'test';
          },
        }),
      ),
    );
  });

  it('checked prop in two checkboxes with same name', () => {
    expect.assertions(2);

    const component = mount(
      createElement(global.Provider, { immutable: true }, [
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
    );

    expect(
      is(getIn(component.find('Field.field2').instance().state.field, ['value']), List(['field1'])),
    ).toBeTruthy();

    global.immutableStore.dispatch(changeFieldValue('form', 'field', List(['field2'])));

    expect(
      is(getIn(component.find('Field.field2').instance().state.field, ['value']), List(['field2'])),
    ).toBeTruthy();
  });

  it('value in few checkboxes with same name', () => {
    const component1 = mount(
      createElement(global.Provider, { immutable: true }, [
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
    );

    expect(
      is(
        getIn(component1.find('Field.field3').instance().state.field, ['value']),
        List(['field1', 'field2']),
      ),
    ).toBeTruthy();
  });

  it('in radio or checkbox components exists checked and value props', () => {
    expect.assertions(2);

    const component = mount(
      createElement(global.Provider, { immutable: true }, [
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
    );

    const radio = component.find('input[type="radio"]');
    const checkbox = component.find('input[type="checkbox"]');
    expect(Object.keys(radio.props())).toEqual(expect.arrayContaining(['checked', 'value']));
    expect(Object.keys(checkbox.props())).toEqual(expect.arrayContaining(['checked', 'value']));
  });
});
