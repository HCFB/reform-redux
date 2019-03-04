import Adapter from 'enzyme-adapter-react-16';
import { Provider as ReactReduxProvider } from 'react-redux';
import { configure } from 'enzyme';
import { createStore, combineReducers } from 'redux';
import { Component, createElement } from 'react';
import { formReducerCreator, Form, changeFieldValue } from '../source';

// Enzyme configuring

configure({ adapter: new Adapter() });

class Provider extends Component {
  render() {
    return createElement(
      ReactReduxProvider,
      { store: global.store },
      createElement(Form, { path: 'form' }, this.props.children),
    );
  }
}

global.Provider = Provider;

// Jest methods

beforeEach(() => {
  global.store = createStore(
    combineReducers({
      form: formReducerCreator('form'),
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
});
