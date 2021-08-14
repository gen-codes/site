import { CompilerPackageNames, TreeMode } from "../shared";
import { CompilerApi, Node, Program, ScriptKind, ScriptTarget, SourceFile, TypeChecker } from "../compiler";

export interface StoreState {
  code: string;
  options: OptionsState;
  apiLoadingState: ApiLoadingState;
  compiler: CompilerState | undefined;
}

export interface CompilerState {
  packageName: CompilerPackageNames;
  api: CompilerApi;
  sourceFile: SourceFile;
  selectedNode: Node;
  query?: string;
  results?: Node[];
  generators?: Record<string, string>;
  selectedGenerator?: string;
  generatedCode?: string;
  // this is deferred because binding may be disabled
  bindingTools: () => BindingTools;
}

export interface BindingTools {
  program: Program;
  typeChecker: TypeChecker;
}

export interface OptionsState {
  compilerPackageName: CompilerPackageNames;
  treeMode: TreeMode;
  scriptTarget: ScriptTarget;
  scriptKind: ScriptKind;
  bindingEnabled: boolean;
  showFactoryCode: boolean;
  showInternals: boolean;
}

export enum ApiLoadingState {
  Loading,
  Loaded,
  Error,
}
