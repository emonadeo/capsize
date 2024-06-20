import { createStyleObject } from '@capsizecss/core';
export { precomputeValues } from '@capsizecss/core';

type CreateStyleObjectParameters = Parameters<typeof createStyleObject>[0];

interface MediaQueries {
    '@media': Record<string, CreateStyleObjectParameters>;
}
declare function createTextStyle(args: CreateStyleObjectParameters, debugId?: string): string;
declare function createTextStyle(args: CreateStyleObjectParameters, mediaQueries?: MediaQueries, debugId?: string): string;

export { createTextStyle };
