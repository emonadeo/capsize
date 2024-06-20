"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function normaliseOptions(options) {
  if ("leading" in options && "lineGap" in options) {
    throw new Error(
      "Only a single line height style can be provided. Please pass either `lineGap` OR `leading`."
    );
  }
  if ("capHeight" in options && "fontSize" in options) {
    throw new Error("Please pass either `capHeight` OR `fontSize`, not both.");
  }
  const { fontMetrics } = options;
  const capHeightScale = fontMetrics.capHeight / fontMetrics.unitsPerEm;
  let specifiedFontSize;
  let specifiedCapHeight;
  if ("capHeight" in options) {
    specifiedFontSize = options.capHeight / capHeightScale;
    specifiedCapHeight = options.capHeight;
  } else if ("fontSize" in options) {
    specifiedFontSize = options.fontSize;
    specifiedCapHeight = options.fontSize * capHeightScale;
  } else {
    throw new Error("Please pass either `capHeight` OR `fontSize`.");
  }
  let specifiedLineHeight;
  if ("lineGap" in options) {
    specifiedLineHeight = specifiedCapHeight + options.lineGap;
  } else if ("leading" in options) {
    specifiedLineHeight = options.leading;
  }
  return {
    fontSize: specifiedFontSize,
    lineHeight: specifiedLineHeight,
    fontMetrics
  };
}
const round = (value) => parseFloat(value.toFixed(4));
function precomputeValues(options) {
  const { fontSize, lineHeight, fontMetrics } = normaliseOptions(options);
  const absoluteDescent = Math.abs(fontMetrics.descent);
  const capHeightScale = fontMetrics.capHeight / fontMetrics.unitsPerEm;
  const descentScale = absoluteDescent / fontMetrics.unitsPerEm;
  const ascentScale = fontMetrics.ascent / fontMetrics.unitsPerEm;
  const lineGapScale = fontMetrics.lineGap / fontMetrics.unitsPerEm;
  const contentArea = fontMetrics.ascent + fontMetrics.lineGap + absoluteDescent;
  const lineHeightScale = contentArea / fontMetrics.unitsPerEm;
  const lineHeightNormal = lineHeightScale * fontSize;
  const allowForLineHeight = (trim) => {
    if (lineHeight) {
      const specifiedLineHeightOffset = (lineHeightNormal - lineHeight) / 2;
      return trim - specifiedLineHeightOffset / fontSize;
    }
    return trim;
  };
  const capHeightTrim = allowForLineHeight(ascentScale - capHeightScale + lineGapScale / 2) * -1;
  const baselineTrim = allowForLineHeight(descentScale + lineGapScale / 2) * -1;
  return {
    fontSize: `${round(fontSize)}px`,
    lineHeight: lineHeight ? `${round(lineHeight)}px` : "normal",
    capHeightTrim: `${round(capHeightTrim)}em`,
    baselineTrim: `${round(baselineTrim)}em`
  };
}
const _createStyleObject = ({
  lineHeight,
  fontSize,
  capHeightTrim,
  baselineTrim
}) => {
  return {
    fontSize,
    lineHeight,
    "::before": {
      content: "''",
      marginBlockEnd: capHeightTrim,
      display: "table"
    },
    "::after": {
      content: "''",
      marginBlockStart: baselineTrim,
      display: "table"
    }
  };
};
function createStyleObject(args) {
  if ("capHeightTrim" in args) {
    return _createStyleObject(args);
  }
  return _createStyleObject(precomputeValues(args));
}
function createStyleString(ruleName, options) {
  const {
    "::before": beforePseudo,
    "::after": afterPseudo,
    ...rootStyles
  } = createStyleObject(options);
  const objToCSSRules = (stylesObj, psuedoName) => `
.${ruleName}${psuedoName ? `::${psuedoName}` : ""} {
${Object.keys(stylesObj).map(
    (property) => `  ${property.replace(/[A-Z]/g, "-$&").toLowerCase()}: ${stylesObj[property].replace(/'/g, '"')}`
  ).join(";\n")};
}`;
  return [
    objToCSSRules(rootStyles),
    objToCSSRules(beforePseudo, "before"),
    objToCSSRules(afterPseudo, "after")
  ].join("\n");
}
const getCapHeight = ({
  fontSize,
  fontMetrics
}) => round(fontSize * fontMetrics.capHeight / fontMetrics.unitsPerEm);
const toPercentString = (value) => `${round(value * 100)}%`;
const fromPercentString = (value) => parseFloat(value) / 100;
const toCssProperty = (property) => property.replace(/([A-Z])/g, (property2) => `-${property2.toLowerCase()}`);
const resolveLocalFallbackSource = (metrics) => {
  const sources = [];
  if (metrics.fullName) {
    sources.push(`local('${metrics.fullName}')`);
  }
  if (metrics.postscriptName && metrics.postscriptName !== metrics.fullName) {
    sources.push(`local('${metrics.postscriptName}')`);
  }
  if (sources.length > 0) {
    return sources.join(", ");
  }
  return `local('${metrics.familyName}')`;
};
const resolveXWidthAvg = (metrics, subset) => {
  var _a;
  if ("subsets" in metrics && ((_a = metrics == null ? void 0 : metrics.subsets) == null ? void 0 : _a[subset])) {
    return metrics.subsets[subset].xWidthAvg;
  }
  if (subset !== "latin") {
    throw new Error(
      `The subset "${subset}" is not available in the metrics provided for "${metrics.familyName}"`
    );
  }
  return metrics.xWidthAvg;
};
const calculateOverrideValues = ({
  metrics,
  fallbackMetrics,
  subset,
  sizeAdjust: sizeAdjustOverride
}) => {
  const preferredFontXAvgRatio = resolveXWidthAvg(metrics, subset) / metrics.unitsPerEm;
  const fallbackFontXAvgRatio = resolveXWidthAvg(fallbackMetrics, subset) / fallbackMetrics.unitsPerEm;
  const calculatedSizeAdjust = preferredFontXAvgRatio && fallbackFontXAvgRatio ? preferredFontXAvgRatio / fallbackFontXAvgRatio : 1;
  const sizeAdjust = sizeAdjustOverride ? fromPercentString(sizeAdjustOverride) : calculatedSizeAdjust;
  const adjustedEmSquare = metrics.unitsPerEm * sizeAdjust;
  const ascentOverride = metrics.ascent / adjustedEmSquare;
  const descentOverride = Math.abs(metrics.descent) / adjustedEmSquare;
  const lineGapOverride = metrics.lineGap / adjustedEmSquare;
  const fallbackAscentOverride = fallbackMetrics.ascent / adjustedEmSquare;
  const fallbackDescentOverride = Math.abs(fallbackMetrics.descent) / adjustedEmSquare;
  const fallbackLineGapOverride = fallbackMetrics.lineGap / adjustedEmSquare;
  const fontFace = {};
  if (ascentOverride && ascentOverride !== fallbackAscentOverride) {
    fontFace["ascentOverride"] = toPercentString(ascentOverride);
  }
  if (descentOverride && descentOverride !== fallbackDescentOverride) {
    fontFace["descentOverride"] = toPercentString(descentOverride);
  }
  if (lineGapOverride !== fallbackLineGapOverride) {
    fontFace["lineGapOverride"] = toPercentString(lineGapOverride);
  }
  if (sizeAdjust && sizeAdjust !== 1) {
    fontFace["sizeAdjust"] = toPercentString(sizeAdjust);
  }
  return fontFace;
};
const quoteIfNeeded = (name) => {
  var _a;
  const quotedMatch = name.match(/^['"](?<name>.*)['"]$/);
  if (quotedMatch && ((_a = quotedMatch.groups) == null ? void 0 : _a.name)) {
    return `"${quotedMatch.groups.name.split(`"`).join(`"`)}"`;
  }
  if (/^"/.test(name)) {
    const [, ...restName] = name;
    return `"${restName.map((x) => x === `"` ? `"` : x).join("")}"`;
  }
  if (!/^[a-zA-Z\d\-_]+$/.test(name)) {
    return `"${name.split(`"`).join(`"`)}"`;
  }
  return name;
};
const toCssString = (fontFaces) => {
  return fontFaces.map(({ "@font-face": { fontFamily, src, ...restFontFaceProperties } }) => {
    const fontFace = [
      "@font-face {",
      `  font-family: ${quoteIfNeeded(fontFamily)};`,
      `  src: ${src};`
    ];
    Object.keys(restFontFaceProperties).forEach((property) => {
      fontFace.push(
        `  ${toCssProperty(property)}: ${restFontFaceProperties[property]};`
      );
    });
    fontFace.push("}");
    return fontFace.join("\n");
  }).join("\n");
};
const resolveOptions = (options) => {
  const fontFaceFormat = (options == null ? void 0 : options.fontFaceFormat) ?? "styleString";
  const subset = (options == null ? void 0 : options.subset) ?? "latin";
  const { sizeAdjust, ...fontFaceProperties } = (options == null ? void 0 : options.fontFaceProperties) ?? {};
  return {
    fontFaceFormat,
    subset,
    fontFaceProperties,
    sizeAdjust
  };
};
function createFontStack([metrics, ...fallbackMetrics], optionsArg = {}) {
  const { fontFaceFormat, fontFaceProperties, sizeAdjust, subset } = resolveOptions(optionsArg);
  const { familyName } = metrics;
  const fontFamilies = [quoteIfNeeded(familyName)];
  const fontFaces = [];
  fallbackMetrics.forEach((fallback) => {
    const fontFamily = quoteIfNeeded(
      `${familyName} Fallback${fallbackMetrics.length > 1 ? `: ${fallback.familyName}` : ""}`
    );
    fontFamilies.push(fontFamily);
    fontFaces.push({
      "@font-face": {
        ...fontFaceProperties,
        fontFamily,
        src: resolveLocalFallbackSource(fallback),
        ...calculateOverrideValues({
          metrics,
          fallbackMetrics: fallback,
          subset,
          sizeAdjust
        })
      }
    });
  });
  fallbackMetrics.forEach((fallback) => {
    fontFamilies.push(quoteIfNeeded(fallback.familyName));
  });
  return {
    fontFamily: fontFamilies.join(", "),
    fontFaces: {
      styleString: toCssString(fontFaces),
      styleObject: fontFaces
    }[fontFaceFormat]
  };
}
exports.createFontStack = createFontStack;
exports.createStyleObject = createStyleObject;
exports.createStyleString = createStyleString;
exports.getCapHeight = getCapHeight;
exports.precomputeValues = precomputeValues;
