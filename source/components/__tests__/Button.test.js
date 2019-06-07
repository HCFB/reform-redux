import { createElement } from 'react';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import { Button, Form } from '../../index';
import { formInitialisation, setFormSubmitting } from '../../actions/Form';
import { changeFieldValue } from '../../actions/Field';

describe('components / Button', () => {
  it('snapshot', () => {
    const snapshot = shallow(
      createElement(Provider, { store: global.store }, createElement(Button)),
    );
    expect(snapshot).toMatchSnapshot();
  });

  it('if component is not in Form component then throw error', () => {
    console.error = jest.fn(); // eslint-disable-line
    expect(() =>
      mount(createElement(Provider, { store: global.store }, createElement(Button))),
    ).toThrow('Component `Button` must be in `Form` component.');
  });

  it('component with type=reset will reset form on onClick', () => {
    const component = mount(
      createElement(global.Provider, {}, createElement(Button, { type: 'reset' })),
    );

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

    global.store.dispatch(changeFieldValue('form', 'field', 'test'));
    component.find('button').simulate('click');

    expect(global.store.getState().form.fields.field.value).toBe('');
  });

  it('component with type=submit will just trigger onClick', () => {
    expect.assertions(2);

    const onClick = jest.fn();
    const component = mount(
      createElement(global.Provider, {}, createElement(Button, { type: 'submit', onClick })),
    );

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

    global.store.dispatch(changeFieldValue('form', 'field', 'test'));

    component.find('button').simulate('click');

    expect(global.store.getState().form.fields.field.value).not.toBe('');
    expect(onClick).toBeCalledWith(expect.anything());
  });

  it('disabled property', () => {
    const component = mount(
      createElement(global.Provider, {}, createElement(Button, { disabled: true })),
    );
    expect(component.find('button').props().disabled).toBeTruthy();
  });

  it('after change form property "submitting", component property "disabled" and state "submitting" will the same', () => {
    expect.assertions(2);

    const component = mount(createElement(global.Provider, {}, createElement(Button)));
    let button = component.find('button');
    expect(button.prop('disabled')).toBeFalsy();

    global.store.dispatch(setFormSubmitting('form', true));
    component.update();
    button = component.find('button');
    expect(button.prop('disabled')).toBeTruthy();
  });

  it('if component was unmounted then after change form property "submitting", component property "disabled" and state "submitting" will not the same', () => {
    const component = mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, createElement(Button)),
      ),
    );
    component.unmount();

    global.store.dispatch(setFormSubmitting('form', true));

    component.mount();

    expect(component.prop('disabled') && component.state('submitting')).toBeFalsy();
  });
});
