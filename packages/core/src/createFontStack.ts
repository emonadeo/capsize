import type { AtRule } from 'csstype';
import { round } from './round';
import type { FontMetrics, SupportedSubset } from './types';

const toPercentString = (value: number) => `${round(value * 100)}%`;
const fromPercentString = (value: string) => parseFloat(value) / 100;

export const toCssProperty = (property: string) =>
  property.replace(/([A-Z])/g, (property) => `-${property.toLowerCase()}`);

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
/*
Making `fullName` and `postscriptName` optional for the `createFontStack` API.
MDN recommends using these when accessing local fonts to ensure the best
matching across platforms. This also enables selecting a single font face
within a larger family, e.g. `Arial Bold` or `Arial-BoldMT` within `Arial`.

See MDN for details: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src#localfont-face-name

Falling back to `familyName` (original behaviour) if these are not available,
which will default to the `regular` font face within the family.
*/
type FontStackMetrics = Optional<
  Pick<
    FontMetrics,
    | 'familyName'
    | 'fullName'
    | 'postscriptName'
    | 'ascent'
    | 'descent'
    | 'lineGap'
    | 'unitsPerEm'
    | 'xWidthAvg'
    | 'subsets'
  >,
  'fullName' | 'postscriptName'
>;

const resolveLocalFallbackSource = (metrics: FontStackMetrics) => {
  const sources: string[] = [];

  if (metrics.fullName) {
    sources.push(`local('${metrics.fullName}')`);
  }

  if (metrics.postscriptName && metrics.postscriptName !== metrics.fullName) {
    sources.push(`local('${metrics.postscriptName}')`);
  }

  if (sources.length > 0) {
    return sources.join(', ');
  }

  return `local('${metrics.familyName}')`;
};

// Support old metrics pre-`subsets` alongside the newer core package with `subset` support.
const resolveXWidthAvg = (
  metrics: FontStackMetrics,
  subset: SupportedSubset,
) => {
  if ('subsets' in metrics && metrics?.subsets?.[subset]) {
    return metrics.subsets[subset].xWidthAvg;
  }

  if (subset !== 'latin') {
    throw new Error(
      `The subset "${subset}" is not available in the metrics provided for "${metrics.familyName}"`,
    );
  }

  return metrics.xWidthAvg;
};

interface OverrideValuesParams {
  metrics: FontStackMetrics;
  fallbackMetrics: FontStackMetrics;
  subset: SupportedSubset;
  sizeAdjust?: AtRule.FontFace['sizeAdjust'];
}
const calculateOverrideValues = ({
  metrics,
  fallbackMetrics,
  subset,
  sizeAdjust: sizeAdjustOverride,
}: OverrideValuesParams): AtRule.FontFace => {
  // Calculate size adjust
  const preferredFontXAvgRatio =
    resolveXWidthAvg(metrics, subset) / metrics.unitsPerEm;
  const fallbackFontXAvgRatio =
    resolveXWidthAvg(fallbackMetrics, subset) / fallbackMetrics.unitsPerEm;

  const calculatedSizeAdjust =
    preferredFontXAvgRatio && fallbackFontXAvgRatio
      ? preferredFontXAvgRatio / fallbackFontXAvgRatio
      : 1;

  const sizeAdjust = sizeAdjustOverride
    ? fromPercentString(sizeAdjustOverride)
    : calculatedSizeAdjust;

  const adjustedEmSquare = metrics.unitsPerEm * sizeAdjust;

  // Calculate metric overrides for preferred font
  const ascentOverride = metrics.ascent / adjustedEmSquare;
  const descentOverride = Math.abs(metrics.descent) / adjustedEmSquare;
  const lineGapOverride = metrics.lineGap / adjustedEmSquare;

  // Calculate metric overrides for fallback font
  const fallbackAscentOverride = fallbackMetrics.ascent / adjustedEmSquare;
  const fallbackDescentOverride =
    Math.abs(fallbackMetrics.descent) / adjustedEmSquare;
  const fallbackLineGapOverride = fallbackMetrics.lineGap / adjustedEmSquare;

  // Conditionally populate font face properties and format to percent
  const fontFace: AtRule.FontFace = {};
  if (ascentOverride && ascentOverride !== fallbackAscentOverride) {
    fontFace['ascentOverride'] = toPercentString(ascentOverride);
  }
  if (descentOverride && descentOverride !== fallbackDescentOverride) {
    fontFace['descentOverride'] = toPercentString(descentOverride);
  }
  if (lineGapOverride !== fallbackLineGapOverride) {
    fontFace['lineGapOverride'] = toPercentString(lineGapOverride);
  }
  if (sizeAdjust && sizeAdjust !== 1) {
    fontFace['sizeAdjust'] = toPercentString(sizeAdjust);
  }

  return fontFace;
};

export const quoteIfNeeded = (name: string) => {
  const quotedMatch = name.match(/^['"](?<name>.*)['"]$/);
  if (quotedMatch && quotedMatch.groups?.name) {
    // Escape double quotes in middle of name
    return `"${quotedMatch.groups.name.split(`"`).join(`\"`)}"`;
  }

  if (/^"/.test(name)) {
    // Complete double quotes if incomplete and escape double quotes in middle
    const [, ...restName] = name;
    return `"${restName.map((x) => (x === `"` ? `\"` : x)).join('')}"`;
  }

  if (!/^[a-zA-Z\d\-_]+$/.test(name)) {
    // Wrap in quotes if contains any characters that are not letters,
    // numbers, hyphens or underscores
    return `"${name.split(`"`).join(`\"`)}"`;
  }

  return name;
};

type FontFace = {
  '@font-face': Omit<AtRule.FontFace, 'src' | 'fontFamily'> &
    Required<Pick<AtRule.FontFace, 'src' | 'fontFamily'>>;
};
const toCssString = (fontFaces: FontFace[]) => {
  return fontFaces
    .map(({ '@font-face': { fontFamily, src, ...restFontFaceProperties } }) => {
      const fontFace = [
        '@font-face {',
        `  font-family: ${quoteIfNeeded(fontFamily)};`,
        `  src: ${src};`,
      ];

      Object.keys(restFontFaceProperties).forEach((property) => {
        fontFace.push(
          `  ${toCssProperty(property)}: ${
            restFontFaceProperties[
              property as keyof typeof restFontFaceProperties
            ]
          };`,
        );
      });

      fontFace.push('}');

      return fontFace.join('\n');
    })
    .join('\n');
};

type AdditionalFontFaceProperties = Omit<
  AtRule.FontFace,
  | 'src'
  | 'fontFamily'
  | 'ascentOverride'
  | 'descentOverride'
  | 'lineGapOverride'
>;
type CreateFontStackOptions = {
  /**
   * Additional properties to add to the generated `@font-face` declarations.
   *
   * Accepts all valid `@font-face` properties except the following which are
   * generated by Capsize: `src`, `fontFamily`, `ascentOverride`,
   * `descentOverride`, `lineGapOverride`, although allows `size-adjust` to
   * support explicit overrides.
   */
  fontFaceProperties?: AdditionalFontFaceProperties;
  /**
   * The unicode subset to generate the fallback font for.
   *
   * The fallback font is scaled according to the average character width,
   * calculated from weighted character frequencies in written text that
   * uses the specified subset, e.g. `latin` from English, `thai` from Thai.
   *
   * Default: `latin`
   */
  subset?: SupportedSubset;
};
type FontFaceFormatString = {
  /**
   * Choose between returning CSS as a string for stylesheets or `style` tags,
   * or as a style object for CSS-in-JS integration.
   *
   * Default: `styleString`
   */
  fontFaceFormat?: 'styleString';
};
type FontFaceFormatObject = {
  fontFaceFormat?: 'styleObject';
};

const resolveOptions = (options: Parameters<typeof createFontStack>[1]) => {
  const fontFaceFormat = options?.fontFaceFormat ?? 'styleString';
  const subset = options?.subset ?? 'latin';
  const { sizeAdjust, ...fontFaceProperties } =
    options?.fontFaceProperties ?? {};

  return {
    fontFaceFormat,
    subset,
    fontFaceProperties,
    sizeAdjust,
  } as const;
};

export function createFontStack(
  fontStackMetrics: FontStackMetrics[],
  options?: CreateFontStackOptions & FontFaceFormatString,
): { fontFamily: string; fontFaces: string };
export function createFontStack(
  fontStackMetrics: FontStackMetrics[],
  options?: CreateFontStackOptions & FontFaceFormatObject,
): { fontFamily: string; fontFaces: FontFace[] };
export function createFontStack(
  [metrics, ...fallbackMetrics]: FontStackMetrics[],
  optionsArg: CreateFontStackOptions = {},
) {
  const { fontFaceFormat, fontFaceProperties, sizeAdjust, subset } =
    resolveOptions(optionsArg);
  const { familyName } = metrics;

  const fontFamilies: string[] = [quoteIfNeeded(familyName)];
  const fontFaces: FontFace[] = [];

  fallbackMetrics.forEach((fallback) => {
    const fontFamily = quoteIfNeeded(
      `${familyName} Fallback${
        fallbackMetrics.length > 1 ? `: ${fallback.familyName}` : ''
      }`,
    );

    fontFamilies.push(fontFamily);
    fontFaces.push({
      '@font-face': {
        ...fontFaceProperties,
        fontFamily,
        src: resolveLocalFallbackSource(fallback),
        ...calculateOverrideValues({
          metrics,
          fallbackMetrics: fallback,
          subset,
          sizeAdjust,
        }),
      },
    });
  });

  // Include original fallback font families after generated fallbacks
  fallbackMetrics.forEach((fallback) => {
    fontFamilies.push(quoteIfNeeded(fallback.familyName));
  });

  return {
    fontFamily: fontFamilies.join(', '),
    fontFaces: {
      styleString: toCssString(fontFaces),
      styleObject: fontFaces,
    }[fontFaceFormat],
  };
}
