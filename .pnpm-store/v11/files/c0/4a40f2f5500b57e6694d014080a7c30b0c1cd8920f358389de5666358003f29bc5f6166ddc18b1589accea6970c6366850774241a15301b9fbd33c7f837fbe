function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { serialize } from "allure-js-commons/sdk";
import { getConfig } from "./state.js";
export default value => {
  return isDomObject(value) ? stringifyAsDom(value) : serializeAsObject(value);
};
var isPlainObject = value => typeof value === "object" && value !== null && !Array.isArray(value);
var _stripAncestorRefs = function stripAncestorRefs(value) {
  var ancestors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  if (!isPlainObject(value)) {
    return value;
  }
  var result = {};
  ancestors.push(value);
  for (var [key, prop] of Object.entries(value)) {
    if (typeof prop === "object" && prop !== null) {
      if (ancestors.includes(prop)) {
        continue;
      }
      result[key] = _stripAncestorRefs(prop, ancestors);
    } else {
      result[key] = prop;
    }
  }
  ancestors.pop();
  return result;
};
export var serializeAsObject = value => {
  if (isPlainObject(value)) {
    var cleaned = _stripAncestorRefs(value);
    return serialize(_objectSpread({}, cleaned), getSerializeOptions());
  }
  return serialize(value, getSerializeOptions());
};
var getSerializeOptions = () => {
  var {
    stepsFromCommands: {
      maxArgumentDepth: maxDepth,
      maxArgumentLength: maxLength
    }
  } = getConfig();
  return {
    maxDepth,
    maxLength,
    nonNullReplacerWithDomSupport
  };
};
var isDomObject = value => typeof value === "object" && value !== null && Cypress.dom.isDom(value);

// @ts-ignore
var stringifyAsDom = value => Cypress.dom.stringify(value, "long");
var nonNullReplacerWithDomSupport = (_, value) => {
  if (typeof value === "object") {
    // Exclude null properties to make the result more compact.
    if (value === null) {
      return undefined;
    }
    if (Cypress.dom.isDom(value)) {
      // Window, document, and DOM element properties are serialized with Cypress.dom.stringify.
      return stringifyAsDom(value);
    }
  }

  // Use the implementation from allure-js-commons/sdk in all other cases.
  return value;
};
//# sourceMappingURL=serialize.js.map