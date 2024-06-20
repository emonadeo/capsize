import { assignVars, style } from "@vanilla-extract/css";
import { precomputeValues } from "@capsizecss/core";
import { precomputeValues as precomputeValues2 } from "@capsizecss/core";
import { capsizeVars, capsizeStyle } from "./styles/capsize.css.mjs";
const createVanillaStyle = ({
  values,
  mediaQueries,
  debugId
}) => {
  const vars = {
    vars: assignVars(capsizeVars, values)
  };
  if (typeof mediaQueries !== "undefined") {
    const mqs = {};
    Object.entries(mediaQueries["@media"]).forEach(([mq, val]) => {
      const builtValues = "capHeightTrim" in val ? val : precomputeValues(val);
      mqs[mq] = { vars: assignVars(capsizeVars, builtValues) };
    });
    vars["@media"] = mqs;
  }
  return style([capsizeStyle, style(vars, debugId)]);
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
    values: precomputeValues(args[0]),
    mediaQueries,
    debugId
  });
}
export {
  createTextStyle,
  precomputeValues2 as precomputeValues
};
