import { setFileScope, endFileScope } from "@vanilla-extract/css/fileScope";
import { createThemeContract, style } from "@vanilla-extract/css";
import { createStyleObject } from "@capsizecss/core";
setFileScope("src/capsize.css.ts", "@capsizecss/vanilla-extract");
const capsizeVars = createThemeContract({
  fontSize: null,
  lineHeight: null,
  capHeightTrim: null,
  baselineTrim: null
});
const capsizeStyle = style(createStyleObject({
  fontSize: capsizeVars.fontSize,
  lineHeight: capsizeVars.lineHeight,
  capHeightTrim: capsizeVars.capHeightTrim,
  baselineTrim: capsizeVars.baselineTrim
}), "capsizeStyle");
endFileScope();
export {
  capsizeStyle,
  capsizeVars
};
