"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const css = require("@vanilla-extract/css");
const core = require("@capsizecss/core");
const styles_capsize_css_cjs = require("./styles/capsize.css.cjs");
const createVanillaStyle = ({
  values,
  mediaQueries,
  debugId
}) => {
  const vars = {
    vars: css.assignVars(styles_capsize_css_cjs.capsizeVars, values)
  };
  if (typeof mediaQueries !== "undefined") {
    const mqs = {};
    Object.entries(mediaQueries["@media"]).forEach(([mq, val]) => {
      const builtValues = "capHeightTrim" in val ? val : core.precomputeValues(val);
      mqs[mq] = { vars: css.assignVars(styles_capsize_css_cjs.capsizeVars, builtValues) };
    });
    vars["@media"] = mqs;
  }
  return css.style([styles_capsize_css_cjs.capsizeStyle, css.style(vars, debugId)]);
};
function createTextStyle(...args) {
  const hasMediaQueries = typeof args[1] !== "undefined" && typeof args[1] !== "string";
  const debugId = hasMediaQueries ? args[2] : args[1];
  const mediaQueries = hasMediaQueries ? args[1] : void 0;
  if ("capHeightTrim" in args[0]) {
    return createVanillaStyle({
      values: args[0],
      mediaQueries,
      debugId
    });
  }
  return createVanillaStyle({
    values: core.precomputeValues(args[0]),
    mediaQueries,
    debugId
  });
}
Object.defineProperty(exports, "precomputeValues", {
  enumerable: true,
  get: () => core.precomputeValues
});
exports.createTextStyle = createTextStyle;
