import { AtRule } from 'csstype';

declare const _default: {
    latin: {
        "0": number;
        "1": number;
        "2": number;
        "3": number;
        "4": number;
        "5": number;
        "6": number;
        "7": number;
        "8": number;
        "9": number;
        ",": number;
        " ": number;
        t: number;
        h: number;
        e: number;
        o: number;
        f: number;
        P: number;
        p: number;
        l: number;
        "'": number;
        s: number;
        R: number;
        u: number;
        b: number;
        i: number;
        c: number;
        C: number;
        n: number;
        a: number;
        d: number;
        y: number;
        w: number;
        B: number;
        r: number;
        z: number;
        G: number;
        j: number;
        T: number;
        ".": number;
        L: number;
        k: number;
        m: number;
        "]": number;
        J: number;
        F: number;
        v: number;
        g: number;
        A: number;
        N: number;
        "-": number;
        H: number;
        D: number;
        M: number;
        I: number;
        E: number;
        "\"": number;
        S: number;
        "(": number;
        ")": number;
        x: number;
        W: number;
        Q: number;
        Y: number;
        q: number;
        V: number;
        á: number;
        K: number;
        U: number;
        "=": number;
        "[": number;
        O: number;
        é: number;
        $: number;
        ":": number;
        "|": number;
        "/": number;
        "%": number;
        Z: number;
        ";": number;
        X: number;
    };
    thai: {
        ส: number;
        ว: number;
        น: number;
        บ: number;
        จ: number;
        า: number;
        ก: number;
        เ: number;
        ร: number;
        ม: number;
        ค: number;
        ำ: number;
        ข: number;
        อ: number;
        ป: number;
        ด: number;
        ใ: number;
        ภ: number;
        ท: number;
        พ: number;
        ฤ: number;
        ษ: number;
        ศ: number;
        ะ: number;
        ช: number;
        แ: number;
        ล: number;
        ง: number;
        ย: number;
        ห: number;
        ฝ: number;
        ต: number;
        โ: number;
        ญ: number;
        ณ: number;
        ผ: number;
        ไ: number;
        ฯ: number;
        ฟ: number;
        ธ: number;
        ถ: number;
        ฐ: number;
        ซ: number;
        ฉ: number;
        ฑ: number;
        ฆ: number;
        ฬ: number;
        ฏ: number;
        ฎ: number;
        ฒ: number;
        ๆ: number;
        ฮ: number;
        "\u0E52": number;
        "\u0E55": number;
    };
};

type SupportedSubset = keyof typeof _default;
interface FontMetrics {
    /** The font’s family name as authored by font creator */
    familyName: string;
    /** The font’s full name as authored by font creator */
    fullName: string;
    /** The font’s unique PostScript name as authored by font creator */
    postscriptName: string;
    /**
     * The style of the font: serif, sans-serif, monospace, display, or handwriting.
     *
     * (Optional as only availble for metrics from the `@capsizecss/metrics` package. Value not extractable from font data tables.)
     */
    category?: string;
    /** The height of the ascenders above baseline */
    ascent: number;
    /** The descent of the descenders below baseline */
    descent: number;
    /** The amount of space included between lines */
    lineGap: number;
    /** The size of the font’s internal coordinate grid */
    unitsPerEm: number;
    /** The height of capital letters above the baseline */
    capHeight: number;
    /** The height of the main body of lower case letters above baseline */
    xHeight: number;
    /**
     * The average width of character glyphs in the font for the Latin unicode subset.
     *
     * Calculated based on character frequencies in written text.
     * */
    xWidthAvg: number;
    /** A lookup of the `xWidthAvg` metric by unicode subset */
    subsets?: Record<SupportedSubset, {
        xWidthAvg: number;
    }>;
}
type ComputedValues = {
    fontSize: string;
    lineHeight: string;
    capHeightTrim: string;
    baselineTrim: string;
};
type NotComputedValues = {
    [V in keyof ComputedValues]?: never;
};
type FontMetricsForTrim = Pick<FontMetrics, 'ascent' | 'descent' | 'capHeight' | 'lineGap' | 'unitsPerEm'>;
type CapHeightWithLeading = {
    capHeight: number;
    leading?: number;
    fontMetrics: FontMetricsForTrim;
} & NotComputedValues;
type CapHeightWithLineGap = {
    capHeight: number;
    lineGap: number;
    fontMetrics: FontMetricsForTrim;
} & NotComputedValues;
type FontSizeWithLeading = {
    fontSize: number;
    leading?: number;
    fontMetrics: FontMetricsForTrim;
} & Omit<NotComputedValues, 'fontSize'>;
type FontSizeWithLineGap = {
    fontSize: number;
    lineGap: number;
    fontMetrics: FontMetricsForTrim;
} & Omit<NotComputedValues, 'fontSize'>;
type CapsizeOptions = CapHeightWithLineGap | CapHeightWithLeading | FontSizeWithLineGap | FontSizeWithLeading;

declare function createStyleObject(args: CapsizeOptions | ComputedValues): {
    fontSize: string;
    lineHeight: string;
    '::before': {
        content: string;
        marginBlockEnd: string;
        display: string;
    };
    '::after': {
        content: string;
        marginBlockStart: string;
        display: string;
    };
};

declare function createStyleString(ruleName: string, options: Parameters<typeof createStyleObject>[0]): string;

declare function precomputeValues(options: CapsizeOptions): ComputedValues;

declare const getCapHeight: ({ fontSize, fontMetrics, }: {
    fontSize: number;
    fontMetrics: Pick<FontMetrics, 'capHeight' | 'unitsPerEm'>;
}) => number;

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
type FontStackMetrics = Optional<Pick<FontMetrics, 'familyName' | 'fullName' | 'postscriptName' | 'ascent' | 'descent' | 'lineGap' | 'unitsPerEm' | 'xWidthAvg' | 'subsets'>, 'fullName' | 'postscriptName'>;
type FontFace = {
    '@font-face': Omit<AtRule.FontFace, 'src' | 'fontFamily'> & Required<Pick<AtRule.FontFace, 'src' | 'fontFamily'>>;
};
type AdditionalFontFaceProperties = Omit<AtRule.FontFace, 'src' | 'fontFamily' | 'ascentOverride' | 'descentOverride' | 'lineGapOverride'>;
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
declare function createFontStack(fontStackMetrics: FontStackMetrics[], options?: CreateFontStackOptions & FontFaceFormatString): {
    fontFamily: string;
    fontFaces: string;
};
declare function createFontStack(fontStackMetrics: FontStackMetrics[], options?: CreateFontStackOptions & FontFaceFormatObject): {
    fontFamily: string;
    fontFaces: FontFace[];
};

export { type FontMetrics, createFontStack, createStyleObject, createStyleString, getCapHeight, precomputeValues };
