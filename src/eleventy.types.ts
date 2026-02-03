import type * as liquid             from 'liquidjs';
import type * as luxon              from 'luxon';
import type * as markdownIt         from 'markdown-it';

export { Liquid }                   from 'liquidjs';

export interface ExtensionConfig {
  outputFileExtension : string;
  useLayouts          : boolean;
  compile             : ( content: string, inputPath: string ) => (() => string) | undefined;
}

export interface LiquidPseudoScope {
  include       : Record<string, unknown>
  site          : Record<string, unknown>
  collections   : Record<string, {
    data: {
      icon    ? : string  // Eleventy front matter elements are here
      title   ? : string
    }
    icon      ? : string  // Jekyll front matter elements are expected here
    title     ? : string
    fileSlug  ? : string
  }[]>
}

export interface LiquidTag {
  parse     : ( tagToken: { args: string }, remainingTokens: object ) => void;
  render    : ( context: liquid.Context,  hash: string ) => string;
  args    ? : string;
}

export type PluginFunction = (eleventyConfig: UserConfig, options: object) => void;

export interface UserConfig {
  addDateParsing        : ( arg0: (dateValue ?: string) => luxon.DateTime | undefined ) => void;
  setUseGitIgnore       : ( arg0: boolean ) => void;
  setLiquidOptions      : ( arg0: object ) => void;
  addPassthroughCopy    : ( arg0: string ) => void;
  addPlugin             : ( arg0: PluginFunction ) => void;
  addTemplateFormats    : ( arg0: string ) => void;
  setLibrary            : ( arg0: string, lib: markdownIt ) => void;
  addExtension          : ( arg0: string, config: ExtensionConfig ) => void;
  addCollection         : ( arg0: string, callback: ( collection: { getFilteredByGlob: (glob: string) => unknown[] } ) => unknown ) => void;
  addDataExtension      : ( arg0: string, callback: ( contents ? : string, filePath  ? : string ) => unknown ) => void;
  addFilter             : ( arg0: string, callback: ( contents ? : string ) => string ) => void;
  addShortcode          : ( arg0: string, callback: ( contents ? : string ) => string ) => void;
  addLiquidTag          : ( arg0: string, callback: ( liquidEngine: liquid.Liquid ) => LiquidTag ) => void;
  addPreprocessor       : ( name: string, extensions: string|string[], callback: (data: { page: { fileSlug: string } }, content: string) => void ) => void;
}
