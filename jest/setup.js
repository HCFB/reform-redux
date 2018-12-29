import Adapter from 'enzyme-adapter-react-16';
import { Provider as ReactReduxProvider } from 'react-redux';
import { configure } from 'enzyme';
import { createStore, combineReducers } from 'redux';
import { Component, createElement } from 'react';
import { is } from 'immutable';
import { formReducerCreator, Form, changeFieldValue } from '../source';
import {
  Form as ImmutableForm,
  formReducerCreator as immutableFormReducerCreator,
} from '../source/immutable';

// Enzyme configuring

configure({ adapter: new Adapter() });

class Provider extends Component {
  render() {
    return createElement(
      ReactReduxProvider,
      { store: this.props.immutable ? global.immutableStore : global.store },
      createElement(
        this.props.immutable ? ImmutableForm : Form,
        { path: 'form' },
        this.props.children,
      ),
    );
  }
}

global.Provider = Provider;

// Extend jest expect

expect.extend({
  lastCalledWithImmutable(fn, ...expected) {
    const actual = fn.mock.calls[fn.mock.calls.length - 1];
    const pass = actual.every(
      (actualParam, index) =>
        expected[index].$$typeof === Symbol.for('jest.asymmetricMatcher') ||
        is(actualParam, expected[index]),
    );

    const message = () =>
      pass
        ? `expected ${actual} to be not equal to ${expected}`
        : `expected ${actual} to be equal to ${expected}`;

    return { message, pass };
  },
});

// Jest methods

beforeEach(() => {
  global.store = createStore(
    combineReducers({
      form: formReducerCreator('form'),
    }),
  );

  global.immutableStore = createStore(
    combineReducers({
      form: immutableFormReducerCreator('form'),
    }),
  );

  global.context = {
    store: global.store,
    _reformRedux: {
      form: {
        path: ['form'],
        registerField: () => {},
        updateForm: () => {},
      },
      field: {
        getFieldCount: () => 1,
        changeFieldValue: (fieldName, fieldValue) =>
          global.store.dispatch(changeFieldValue('form', fieldName, fieldValue)),
      },
    },
  };

  global.immutableContext = {
    store: global.immutableStore,
    _reformRedux: global.context._reformRedux,
  };
});
