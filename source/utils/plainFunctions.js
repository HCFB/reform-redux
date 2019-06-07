import {
  cloneDeep,
  hasIn,
  setIn,
  getIn,
  keys,
  merge,
  deleteIn,
  isList,
  listIncludes,
  is,
  listSize,
  isImmutable,
  toJS,
} from './common';

export default function plain() {
  return {
    fromJS: cloneDeep,
    map: cloneDeep,
    list: cloneDeep,
    hasIn,
    setIn,
    getIn,
    merge,
    deleteIn,
    is,
    keys,
    isList,
    listIncludes,
    listSize,
    isImmutable,
    toJS,
  };
}
