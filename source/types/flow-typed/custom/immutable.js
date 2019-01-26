import type { CloneDeep } from '../../dataFunctions';
import type { HasIn, SetIn, GetIn, MergeDeep, DeleteIn, Is, IsImmutable } from '../../common';

declare module 'immutable' {
  declare export var fromJS: CloneDeep;
  declare export var Map: CloneDeep;
  declare export var hasIn: HasIn;
  declare export var setIn: SetIn;
  declare export var getIn: GetIn;
  declare export var mergeDeep: MergeDeep;
  declare export var deleteIn: DeleteIn;
  declare export var List: any;
  declare export var is: Is;
  declare export var isImmutable: IsImmutable;
}
