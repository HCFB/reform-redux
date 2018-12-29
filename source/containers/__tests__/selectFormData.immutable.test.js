import { createElement, Component } from 'react';
import { mount } from 'enzyme';
import { getIn } from 'immutable';
import { Field, selectFormData } from '../../immutable';

describe('containers / selectFormData.immutable', () => {
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
        expect(getIn(this.props.field1, ['value'])).toBe('test');
        expect(getIn(this.props.field2, ['value'])).toBe('test2');
      }

      render() {
        return '';
      }
    }

    mount(
      createElement(
        global.Provider,
        { immutable: true },
        createElement(Field, {
          name: 'field1',
          value: 'test',
          component: 'input',
        }),
        createElement(Field, {
          name: 'field2',
          value: 'test2',
          component: 'input',
        }),
        createElement(selectFormData(['field1', 'field2'], 'form')(CustomElement)),
      ),
    );
  });
});
