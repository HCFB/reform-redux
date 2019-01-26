import { ReactReduxContext } from 'react-redux';
import { createElement, Component, forwardRef } from 'react';
import { is, cloneDeep } from '../utils/common';
import { ReformReduxContext } from '../components/Form';
import type { ComponentType, Element } from 'react';
import type { State } from '../types/formReducer';
import type { FieldsData, FieldName } from '../types/Field';
import type { DataFunctions } from '../types/dataFunctions';

export const createSelectFormData: Function = (dataFunctions: DataFunctions) => {
  const { getIn }: DataFunctions = dataFunctions;

  /**
   * Component wrapper which pass fields data to wrapped component through props.
   *
   * @callback selectFormData
   * @example
   * import { selectFormData } from 'reform-redux';
   *
   * selectFormData(
   *   fieldNames: Array<FieldName>,
   *   formPath?: string
   * )(ConnectedComponent: ComponentType<*>) => ComponentType<*>
   *
   * @param {FieldName[]} fieldNames Field names.
   * @param {string} [formPath] Form path.
   */
  const selectFormData = (fieldNames: Array<FieldName>, formPath?: string): Function => {
    return (ConnectedComponent: ComponentType<*>): ComponentType<*> => {
      class SelectFormData extends Component<*, FieldsData> {
        unsubscribeFromStore: Function = () => {};
        state: FieldsData;

        constructor(props) {
          super(props);

          if (!props.reformReduxContext) {
            throw new Error('Container `selectFormData` must be in `Form` component.');
          }

          const componentState: FieldsData = {};
          const state: State = props.reactReduxContext.store.getState();
          const currentFormData: State = getIn(state, props.reformReduxContext.form.path);

          fieldNames.forEach(fieldName => {
            componentState[fieldName] = getIn(currentFormData, ['fields', fieldName]) || {
              value: '',
              errors: [],
              valid: true,
              disabled: false,
            };
          });

          this.state = componentState;

          this.unsubscribeFromStore = props.reactReduxContext.store.subscribe(() => {
            const contextFormPath: Array<string> =
              (formPath && formPath.split('.')) || props.reformReduxContext.form.path;
            const state: State = props.reactReduxContext.store.getState();
            const fieldsData: FieldsData = {};

            fieldNames.forEach((fieldName: string) => {
              fieldsData[fieldName] = getIn(state, [...contextFormPath, 'fields', fieldName]);
            });

            if (!is(this.state, fieldsData)) {
              this.setState(cloneDeep(fieldsData));
            }
          });
        }

        shouldComponentUpdate() {
          return Boolean(Object.keys(this.state).length);
        }

        componentWillUnmount() {
          this.unsubscribeFromStore();
        }

        render(): Element<*> {
          const state = cloneDeep(this.state);

          return createElement(ConnectedComponent, {
            ...this.props,
            ...state,
          });
        }
      }

      return forwardRef((props, ref) =>
        createElement(ReactReduxContext.Consumer, {}, reactReduxContextValue =>
          createElement(ReformReduxContext.Consumer, {}, reformReduxContextValue =>
            createElement(SelectFormData, {
              ...props,
              reactReduxContext: reactReduxContextValue,
              reformReduxContext: reformReduxContextValue,
              innerRef: ref,
            }),
          ),
        ),
      );
    };
  };

  return selectFormData;
};
