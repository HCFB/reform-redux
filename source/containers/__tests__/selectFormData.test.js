import { createElement, Component } from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { Field, selectFormData, Form } from '../../index';

describe('containers / selectFormData', () => {
  it('if container is not in Form component then throw error', () => {
    console.error = jest.fn(); // eslint-disable-line
    expect(() => mount(createElement(selectFormData()('')))).toThrow(
      'Container `selectFormData` must be in `Form` component.',
    );
  });

  it('container behavior', () => {
    expect.assertions(2);

    class CustomElement extends Component {
      componentDidUpdate() {
        expect(this.props.field1.value).toBe('test');
        expect(this.props.field2.value).toBe('test2');
      }

      render() {
        return '';
      }
    }

    mount(
      createElement(
        Provider,
        { store: global.store },
        createElement(Form, { path: 'form' }, [
          createElement(Field, {
            name: 'field1',
            value: 'test',
            component: 'input',
            key: 0,
          }),
          createElement(Field, {
            name: 'field2',
            value: 'test2',
            key: 1,
            component: 'input',
          }),
          createElement(selectFormData(['field1', 'field2'], 'form')(CustomElement), { key: 2 }),
        ]),
      ),
    );
  });
});
