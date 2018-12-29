import { getIn, Map, List, is } from 'immutable';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import { setImmediate } from 'timers';
import { createElement } from 'react';
import { Form, Field } from '../../immutable';

describe('components / Form.immutable', () => {
  it('snapshot', () => {
    const snapshot = shallow(
      createElement(
        Provider,
        { store: global.immutableStore },
        createElement(Form, { path: 'form' }, ''),
      ),
    );
    expect(snapshot).toMatchSnapshot();
  });

  it('if component has not "path" prop then throw error', () => {
    console.error = jest.fn(); // eslint-disable-line
    expect(() =>
      mount(createElement(Provider, { store: global.immutableStore }, createElement(Form, {}))),
    ).toThrow('The `path` prop is required.');
  });

  it('form initialisation in the store after component mount', () => {
    mount(
      createElement(
        Provider,
        { store: global.immutableStore },
        createElement(
          Form,
          { path: 'form' },
          createElement(Field, { name: 'test', component: 'input' }),
        ),
      ),
    );

    expect(
      is(
        getIn(global.immutableStore.getState(), ['form']),
        Map({
          fields: Map({
            test: Map({
              disabled: false,
              touched: false,
              changed: false,
              errors: List(),
              valid: true,
              value: '',
            }),
          }),
          submitted: false,
          touched: false,
          submitting: false,
          changed: false,
          valid: true,
        }),
      ),
    ).toBeTruthy();
  });

  it('form component has default prop onSubmit', () => {
    const component = mount(
      createElement(
        Provider,
        { store: global.immutableStore },
        createElement(Form, { path: 'form' }),
      ),
    );

    expect(typeof component.find('form').prop('onSubmit')).toBe('function');
  });

  it('form component onSubmit behavior', done => {
    expect.assertions(4);

    const validate = value => {
      expect(getIn(global.immutableStore.getState(), ['form', 'submitting'])).toBeTruthy();

      if (value.length < 2) {
        return 'Value must be at least 2 characters';
      }
    };
    const onSubmit = jest.fn();

    const component = mount(
      createElement(
        Provider,
        { store: global.immutableStore },
        createElement(Form, { path: 'form', onSubmit }, [
          createElement(Field, {
            key: 0,
            name: 'test1',
            value: '12',
            component: 'input',
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

    component.find('form').simulate('submit');

    setImmediate(() => {
      expect(getIn(global.immutableStore.getState(), ['form', 'submitting'])).toBeFalsy();
      expect(onSubmit).lastCalledWithImmutable(
        Map({
          test1: Map({
            disabled: false,
            errors: List(),
            touched: false,
            changed: false,
            valid: true,
            value: '12',
          }),
          test2: Map({
            disabled: false,
            touched: false,
            changed: false,
            errors: List(),
            valid: true,
            value: '12',
          }),
        }),
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
        { store: global.immutableStore },
        createElement(Form, { path: 'form', onSubmitFailed }, [
          createElement(Field, { key: 0, name: 'test1', value: '1', component: 'input', validate }),
          createElement(Field, { key: 1, name: 'test2', value: '1', component: 'input', validate }),
        ]),
      ),
    );

    component.find('form').simulate('submit');

    setImmediate(() => {
      expect(onSubmitFailed).lastCalledWithImmutable(
        Map({
          test1: Map({
            disabled: false,
            changed: false,
            errors: List(['Value must be at least 2 characters']),
            valid: false,
            touched: false,
            value: '1',
          }),
          test2: Map({
            disabled: false,
            changed: false,
            errors: List(['Value must be at least 2 characters']),
            touched: false,
            valid: false,
            value: '1',
          }),
        }),
        Map({
          test1: Map({
            disabled: false,
            changed: false,
            errors: List(['Value must be at least 2 characters']),
            touched: false,
            valid: false,
            value: '1',
          }),
          test2: Map({
            disabled: false,
            changed: false,
            errors: List(['Value must be at least 2 characters']),
            touched: false,
            valid: false,
            value: '1',
          }),
        }),
        expect.anything(),
      );
      done();
    });
  });
});
