"use strict";
const fileScope = require("@vanilla-extract/css/fileScope");
const css = require("@vanilla-extract/css");
const core = require("@capsizecss/core");
fileScope.setFileScope("src/capsize.css.ts", "@capsizecss/vanilla-extract");
const capsizeVars = css.createThemeContract({
  fontSize: null,
  lineHeight: null,
  capHeightTrim: null,
  baselineTrim: null
});
const capsizeStyle = css.style(core.createStyleObject({
  fontSize: capsizeVars.fontSize,
  lineHeight: capsizeVars.lineHeight,
  capHeightTrim: capsizeVars.capHeightTrim,
  baselineTrim: capsizeVars.baselineTrim
}), "capsizeStyle");
fileScope.endFileScope();
exports.capsizeStyle = capsizeStyle;
exports.capsizeVars = capsizeVars;
