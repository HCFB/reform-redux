import { LIBRARY_NAME } from '../constants/common';

export function getFormNameWihoutKey(formName) {
  const formNameData = /^([^[\]]+)(\[(.*)\])?$/.exec(formName);
  const name = formNameData ? formNameData[1] : '';

  return name;
}

export function getFormNameKey(formName) {
  const keyData = /.*\[(.*)\]/.exec(formName);
  const key = keyData ? keyData[1] : '';

  return key;
}

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < listSize(array); index++) {
    await callback(getIn(array, [index]), index, array);
  }
};

export function getReduxConst(constName) {
  return `${LIBRARY_NAME}/${constName}`;
}

export function cloneDeep(o) {
  let copy = o;

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

export function is(x, y) {
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

export function hasIn(where, searchKeyPath) {
  let current = where;

  for (let i = 0; i < searchKeyPath.length; i++) {
    if (current[searchKeyPath[i]] === undefined) return false;
    current = current[searchKeyPath[i]];
  }

  return true;
}

export function setIn(where, searchKeyPath, value) {
  let current = where;
  let i;

  for (i = 0; i < searchKeyPath.length - 1; i++) {
    current = current[searchKeyPath[i]];
  }

  current[searchKeyPath[i]] = value;

  return cloneDeep(where);
}

export function deleteIn(where, searchKeyPath) {
  let current = where;
  let i;

  for (i = 0; i < searchKeyPath.length - 1; i++) {
    current = current[searchKeyPath[i]];
  }

  delete current[searchKeyPath[i]];

  return where;
}

export function getIn(where, searchKeyPath, defaultValue) {
  let current = where;

  for (let i = 0; i < searchKeyPath.length; i++) {
    if (current[searchKeyPath[i]] === undefined) return defaultValue || false;
    current = current[searchKeyPath[i]];
  }

  return cloneDeep(current);
}

export function merge(target, source) {
  return { ...target, ...source };
}

export function keys(input) {
  return Object.keys(input);
}

export function isList(input) {
  return Array.isArray(input);
}

export function listIncludes(list, item) {
  return list.indexOf(item) > -1;
}

export function listSize(list) {
  return list.length;
}

export function isImmutable() {
  return false;
}

export function toJS(input) {
  return input;
}

const DOMProps = [
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
  'children',
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
const DOMDataAttributes = /data-.{1,}/;

export function filterReactDomProps(props) {
  const filterProps = {};

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
