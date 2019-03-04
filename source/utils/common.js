import { LIBRARY_NAME } from '../constants/common';
import type { SearchKeyPath, Where } from '../types/common';
import type { DataFunctions } from '../types/dataFunctions';

export function getFormNameWihoutKey(formName: string): string {
  const formNameData = /^([^[\]]+)(\[(.*)\])?$/.exec(formName);
  const name = formNameData ? formNameData[1] : '';

  return name;
}

export function getFormNameKey(formName: string): string {
  const keyData = /.*\[(.*)\]/.exec(formName);
  const key = keyData ? keyData[1] : '';

  return key;
}

export function debounce(func: Function, wait: number, immediate?: boolean) {
  let timeout;

  return (...args: Array<any>) => {
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    // $FlowFixMe
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

export const asyncForEach: Function = async (
  array: Array<any>,
  callback: Function,
  dataFunctions: DataFunctions,
) => {
  const { listSize, getIn }: DataFunctions = dataFunctions;

  for (let index: number = 0; index < listSize(array); index++) {
    await callback(getIn(array, [index]), index, array);
  }
};

export function getReduxConst(constName: string): string {
  return `${LIBRARY_NAME}/${constName}`;
}

export function cloneDeep<Input: any>(o: Input): Input {
  let copy: any = o;

  if (o && typeof o === 'object') {
    copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
    for (let k in o) {
      // $FlowFixMe
      copy[k] = cloneDeep(o[k]);
    }
  }

  // $FlowFixMe
  return copy;
}

export function is(x: any, y: any): boolean {
  if (x === null || x === undefined || y === null || y === undefined) {
    return x === y;
  }
  if (x.constructor !== y.constructor) {
    return false;
  }
  if (x instanceof Function) {
    return x === y;
  }
  if (x instanceof RegExp) {
    return x === y;
  }
  if (x === y || x.valueOf() === y.valueOf()) {
    return true;
  }
  if (Array.isArray(x) && x.length !== y.length) {
    return false;
  }
  if (x instanceof Date) {
    return false;
  }
  if (!(x instanceof Object)) {
    return false;
  }
  if (!(y instanceof Object)) {
    return false;
  }

  const p = Object.keys(x);
  return Object.keys(y).every(i => p.indexOf(i) !== -1) && p.every(i => is(x[i], y[i]));
}

export function hasIn(where: any, searchKeyPath: SearchKeyPath): boolean {
  let current: any = where;

  for (let i: number = 0; i < searchKeyPath.length; i++) {
    if (current[searchKeyPath[i]] === undefined) return false;
    current = current[searchKeyPath[i]];
  }

  return true;
}

export function setIn<Input: any>(where: Input, searchKeyPath: SearchKeyPath, value: any): Input {
  let current: Input = where;
  let i: number;

  for (i = 0; i < searchKeyPath.length - 1; i++) {
    current = current[searchKeyPath[i]];
  }

  current[searchKeyPath[i]] = value;

  return cloneDeep(where);
}

export function deleteIn<Input: any>(where: Input, searchKeyPath: SearchKeyPath): Input {
  let current: Input = where;
  let i: number;

  for (i = 0; i < searchKeyPath.length - 1; i++) {
    current = current[searchKeyPath[i]];
  }

  delete current[searchKeyPath[i]];

  return where;
}

export function getIn(where: Where, searchKeyPath: SearchKeyPath, defaultValue: any): any {
  let current: any = where;

  for (let i: number = 0; i < searchKeyPath.length; i++) {
    if (current[searchKeyPath[i]] === undefined) return defaultValue || false;
    current = current[searchKeyPath[i]];
  }

  return cloneDeep(current);
}

export function merge<Input: any>(target: Input, source: Input): Input {
  return { ...target, ...source };
}

export function keys(input: Object): Array<string> {
  return Object.keys(input);
}

export function isList(input: Where): boolean {
  return Array.isArray(input);
}

export function listIncludes(list: Array<any>, item: any): boolean {
  return list.indexOf(item) > -1;
}

export function listSize(list: Array<any>): number {
  return list.length;
}

export function isImmutable(): boolean {
  return false;
}

export function toJS<Input: any>(input: Input): Input {
  return input;
}

const DOMProps: Array<string> = [
  'abbr',
  'accept',
  'acceptCharset',
  'accessKey',
  'action',
  'allowFullScreen',
  'allowTransparency',
  'alt',
  'async',
  'autoComplete',
  'autoFocus',
  'autoPlay',
  'cellPadding',
  'cellSpacing',
  'challenge',
  'charset',
  'checked',
  'cite',
  'class',
  'className',
  'cols',
  'colSpan',
  'command',
  'content',
  'contentEditable',
  'contextMenu',
  'controls',
  'coords',
  'crossOrigin',
  'data',
  'dateTime',
  'default',
  'defer',
  'dir',
  'disabled',
  'download',
  'draggable',
  'dropzone',
  'encType',
  'for',
  'form',
  'formAction',
  'formEncType',
  'formMethod',
  'formNoValidate',
  'formTarget',
  'frameBorder',
  'headers',
  'height',
  'hidden',
  'high',
  'href',
  'hrefLang',
  'htmlFor',
  'httpEquiv',
  'icon',
  'id',
  'inputMode',
  'isMap',
  'itemId',
  'itemProp',
  'itemRef',
  'itemScope',
  'itemType',
  'kind',
  'label',
  'lang',
  'list',
  'loop',
  'manifest',
  'max',
  'maxLength',
  'media',
  'mediaGroup',
  'method',
  'min',
  'minLength',
  'multiple',
  'muted',
  'name',
  'noValidate',
  'open',
  'optimum',
  'pattern',
  'ping',
  'placeholder',
  'poster',
  'preload',
  'radioGroup',
  'readOnly',
  'rel',
  'required',
  'role',
  'rows',
  'rowSpan',
  'sandbox',
  'scope',
  'scoped',
  'scrolling',
  'seamless',
  'selected',
  'shape',
  'size',
  'sizes',
  'sortable',
  'span',
  'spellCheck',
  'src',
  'srcDoc',
  'srcSet',
  'start',
  'step',
  'style',
  'tabIndex',
  'target',
  'title',
  'translate',
  'type',
  'typeMustMatch',
  'useMap',
  'value',
  'width',
  'wmode',
  'wrap',
  'onCopy',
  'onCut',
  'onPaste',
  'onLoad',
  'onError',
  'onWheel',
  'onScroll',
  'onCompositionEnd',
  'onCompositionStart',
  'onCompositionUpdate',
  'onKeyDown',
  'onKeyPress',
  'onKeyUp',
  'onFocus',
  'onBlur',
  'onChange',
  'onInput',
  'onSubmit',
  'onClick',
  'onContextMenu',
  'onDoubleClick',
  'onDrag',
  'onDragEnd',
  'onDragEnter',
  'onDragExit',
  'onDragLeave',
  'onDragOver',
  'onDragStart',
  'onDrop',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseOut',
  'onMouseOver',
  'onMouseUp',
  'onSelect',
  'onTouchCancel',
  'onTouchEnd',
  'onTouchMove',
  'onTouchStart',
  'onAnimationStart',
  'onAnimationEnd',
  'onAnimationIteration',
  'onTransitionEnd',
];
const DOMDataAttributes: RegExp = /data-.{1,}/;

export function filterReactDomProps(props: Object): Object {
  const filterProps: Object = {};

  for (const prop in props) {
    if (
      (props.hasOwnProperty(prop) && DOMProps.indexOf(prop) !== -1) ||
      DOMDataAttributes.test(prop)
    ) {
      filterProps[prop] = props[prop];
    }
  }

  return filterProps;
}
