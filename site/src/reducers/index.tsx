import { tsquery } from "@phenomnomnominal/tsquery";
import { CompilerPackageNames } from "@ts-ast-viewer/shared";
import { camelCase, capitalCase, constantCase, dotCase, headerCase, noCase, paramCase, pascalCase, pathCase, sentenceCase, snakeCase } from "change-case";
import ts from "typescript";
import { AllActions } from "../actions";
import { CompilerApi, convertOptions, createSourceFile } from "../compiler";
import { actions as actionNames } from "./../constants";
import { OptionsState, StoreState } from "../types";
import { UrlSaver } from "../utils";
const urlSaver = new UrlSaver();
function queryAst(ast: ts.SourceFile, query: string) {
  try {
    return tsquery(ast, query);
  } catch (err) {
    console.log(err);
    return [];
  }
}
function renderFunction(code: string): string {
  return `(
    function func(){
      try{
      ${
    code.replace(`const context = {} as any;`, "")
      .replace("export default", "return")
  }
      }catch(error){
        console.error(error)
      }
    }
  )`;
}
function compileFunction(code: string, context: any) {
  return eval(renderFunction(code));
}
const refReplaceFactory = (props: any, comp: any) => {
  return function(code: string) {
    for (const key in props) {
      comp[key].forEach((ref: any) => {
        Object.keys(props[key]).forEach(k => {
          if (ref[k]) {
            const name = ref[k].getFullText().trim();
            code = code.replace(
              new RegExp(props[key][k].find(name, ref), "g"),
              props[key][k].replace(name, ref),
            );
          }
        });
      });
    }
    return code;
  };
};

export function appReducer(state: StoreState, action: AllActions): StoreState {
  switch (action.type) {
    case actionNames.CREATE_GENERATOR: {
      if (state.compiler == null)
        return state;

      return {
        ...state,
        compiler: {
          ...state.compiler,
          selectedGenerator: action.name,
          generators: {
            [action.name]: "",
            ...state.compiler.generators,
          },
        },
      };
    }
    case actionNames.SELECT_GENERATOR: {
      if (state.compiler == null)
        return state;
      console.log(action.name);
      return {
        ...state,
        compiler: {
          ...state.compiler,
          selectedGenerator: action.name,
        },
      };
    }
    case actionNames.SET_GENERATOR: {
      if (state.compiler == null || typeof (state.compiler?.selectedGenerator) !== "string")
        return state;
      let generatedCode = " ";
      action.code = localStorage.getItem("generator-code-" + state.compiler.selectedGenerator) || action.code;

      try {
        const generatorFunc = compileFunction(action.code, {
          refReplaceFactory,
          q: createQ(state),
          paramCase,
          data: state.compiler.results,
        });
        generatedCode = generatorFunc();
      } catch (err) {
        console.log(err);
      }
      return {
        ...state,
        compiler: {
          ...state.compiler,
          generators: {
            ...state.compiler.generators,
            [state.compiler.selectedGenerator]: action.code,
          },
          generatedCode,
        },
      };
    }

    case actionNames.SET_QUERY: {
      if (state.compiler == null)
        return state;
      else {
        action.query = localStorage.getItem("query-code") || action.query;
        const q = createQ(state);
        let results;

        try {
          const queryFunc = compileFunction(action.query, {
            q,
            paramCase,
          });
          results = queryFunc();
        } catch (err) {
          console.log(err);
          results = {
            error: err,
          };
        }
        console.log(results);
        return {
          ...state,
          compiler: {
            ...state.compiler,
            query: action.query,
            results: results,
            ...results.length && {
              resultIndex: 0,
              selectedNode: results[0],
            },
          },
        };
      }
    }
    case actionNames.SET_SELECTED_NODE: {
      if (state.compiler == null)
        return state;

      return {
        ...state,
        compiler: {
          ...state.compiler,
          selectedNode: action.node,
        },
      };
    }
    case actionNames.SET_API_LOADING_STATE: {
      return {
        ...state,
        apiLoadingState: action.loadingState,
      };
    }
    case actionNames.REFRESH_SOURCEFILE: {
      const newState = {
        ...state,
        options: convertOptions(
          state.compiler == null ? undefined : state.compiler.api,
          action.api,
          state.options,
        ),
      };
      fillNewSourceFileState(
        newState.options.compilerPackageName,
        action.api,
        newState,
        state.code,
        state.options,
      );
      urlSaver.updateUrl(state.code);
      return newState;
    }
    case actionNames.SET_CODE: {
      return { ...state, code: action.code };
    }
    case actionNames.SET_OPTIONS: {
      return {
        ...state,
        options: {
          ...state.options,
          ...action.options,
        },
      };
    }
    default: {
      // eslint-disable-next-line
      const assertNever: never = action;
      return state;
    }
  }
}

function createQ(state: StoreState) {
  return (str: string[], ...args: string[]) => {
    let data = state.compiler?.sourceFile;
    let index = -1;
    if (!Array.isArray(str) || str.some(p => typeof p !== "string")) {
      // @ts-ignore
      data = str as ts.SourceFile;
      str = args.splice(0, 1);
    }
    if (typeof args[args.length - 1] === "number") {
      // @ts-ignore
      index = args.pop();
    }
    const queryString = str.map((part, idx) => `${part.replace(/\n/g, "") || ""}${args[idx] || ""}`).filter(p => p)
      .join("");
    if (index !== -1)
      return data && queryAst(data, queryString)[index];
    return data && queryAst(data, queryString);
  };
}

function fillNewSourceFileState(
  compilerPackageName: CompilerPackageNames,
  api: CompilerApi,
  state: StoreState,
  code: string,
  options: OptionsState,
) {
  const { sourceFile, bindingTools } = createSourceFile(api, code, options.scriptTarget, options.scriptKind);
  state.compiler = {
    packageName: compilerPackageName,
    api,
    sourceFile,
    bindingTools,
    selectedNode: sourceFile,
    query: localStorage.getItem("query-code") || "",
    generators: Object.keys(localStorage).filter(key => key.startsWith("generator-code-")).reduce((gens, gen) => {
      console.log(gen);
      const code = localStorage.getItem(gen);
      return {
        [gen.replace("generator-code-", "")]: code,
        ...gens,
      };
    }, {}),
  };
}
