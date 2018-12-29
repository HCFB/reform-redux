import { createElement } from 'react';
import { getIn } from 'immutable';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import { Button, Form } from '../../immutable';
import { formInitialisation, setFormSubmitting } from '../../actions/Form';
import { changeFieldValue } from '../../actions/Field';

describe('components / Button.immutable', () => {
  it('snapshot', () => {
    const snapshot = shallow(
      createElement(global.Provider, { immutable: true }, createElement(Button)),
    );

    expect(snapshot).toMatchSnapshot();
  });

  it('component with type=reset will reset form on onClick', () => {
    const component = mount(
      createElement(global.Provider, { immutable: true }, createElement(Button, { type: 'reset' })),
    );

    global.immutableStore.dispatch(
      formInitialisation('form', {
        field: {
          value: '',
          errors: [],
          valid: true,
          disabled: false,
        },
      }),
    );

    global.immutableStore.dispatch(changeFieldValue('form', 'field', 'test'));
    component.find('button').simulate('click');

    expect(getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'value'])).toBe('');
  });

  it('component with type=submit will just trigger onClick', () => {
    expect.assertions(2);

    const onClick = jest.fn();
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Button, { type: 'submit', onClick }),
      ),
    );

    global.immutableStore.dispatch(
      formInitialisation('form', {
        field: {
          value: '',
          errors: [],
          valid: true,
          disabled: false,
        },
      }),
    );

    global.immutableStore.dispatch(changeFieldValue('form', 'field', 'test'));

    component.find('button').simulate('click');

    expect(getIn(global.immutableStore.getState(), ['form', 'fields', 'field', 'value'])).not.toBe(
      '',
    );
    expect(onClick).toBeCalledWith(expect.anything());
  });

  it('disabled property', () => {
    const component = mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Button, { disabled: true }),
      ),
    );
    expect(component.find('button').props().disabled).toBeTruthy();
  });

  it('after change form property "submitting", component property "disabled" and state "submitting" will the same', () => {
    expect.assertions(2);

    const component = mount(
      createElement(global.Provider, { immutable: true }, createElement(Button)),
    );
    let buttonComponent = component.find('Button').instance();
    let button = component.find('button');

    expect(button.prop('disabled') && buttonComponent.state.submitting).toBeFalsy();

    global.immutableStore.dispatch(setFormSubmitting('form', true));
    component.update();
    buttonComponent = component.find('Button').instance();
    button = component.find('button');

    expect(button.prop('disabled') && buttonComponent.state.submitting).toBeTruthy();
  });

  it('if component was unmounted then after change form property "submitting", component property "disabled" and state "submitting" will not the same', () => {
    const component = mount(
      createElement(
        Provider,
        { store: global.immutableStore },
        createElement(Form, { path: 'form' }, createElement(Button)),
      ),
    );
    component.unmount();

    global.immutableStore.dispatch(setFormSubmitting('form', true));

    component.mount();

    expect(component.prop('disabled') && component.state('submitting')).toBeFalsy();
  });
});
