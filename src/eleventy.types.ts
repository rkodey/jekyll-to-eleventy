import type  { Liquid }             from 'liquidjs';
import type  * as luxon             from 'luxon';
import type  * as markdownIt        from 'markdown-it';


interface ExtensionConfig {
  outputFileExtension : string;
  useLayouts          : boolean;
  compile             : ( content: string, inputPath: string ) => (() => string) | undefined;
}

interface LiquidTag {
  parse   : ( tagToken: { args: string }, remainingTokens: object ) => void;
  render  : ( context: object,  hash: string ) => unknown;
  args?   : string;
}

export interface UserConfig {
  addDateParsing         : ( arg0: (dt ?: string) => luxon.DateTime | undefined ) => void;
  setLiquidOptions       : ( arg0: object ) => void;
  addPassthroughCopy     : ( arg0: string ) => void;
  addPlugin              : ( arg0: object ) => void;
  addTemplateFormats     : ( arg0: string ) => void;
  setLibrary             : ( arg0: string, lib: markdownIt ) => void;
  addExtension           : ( arg0: string, config: ExtensionConfig ) => void;
  addDataExtension       : ( arg0: string, callback: ( contents: string, filePath: string ) => unknown ) => void;
  addFilter              : ( arg0: string, callback: ( contents: string ) => string ) => void;
  addLiquidTag           : ( arg0: string, callback: ( liquidEngine: Liquid ) => LiquidTag ) => void;
  addShortcode           : ( arg0: string, callback: ( contents: string ) => string ) => void;
}
