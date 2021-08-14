/* eslint-disable jsx-a11y/alt-text */
import { constants } from "./shared";
import { useAppContext } from "AppContext";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { memo, useEffect, useState } from "react";
import SplitPane from "react-split-pane";
import "./App.css";
import { getDescendantAtRange, getStartSafe } from "./compiler";
import * as components from "./components";
import { CodeEditor, ResultViewer } from "./components";
import logo from "./logo.png";
import { ApiLoadingState } from "./types";

const defaultCode = `const context = {} as any;
const {q,toParam} = context;
/**
 AST node type: ForStatement (see common node types)
 wildcard: *
 attribute existence: [attr]
 attribute value: [attr="foo"] or [attr=123]
 attribute regex: [attr=/foo.*\\/]
 attribute conditons: [attr!="foo"], [attr>2], [attr<3], [attr>=2], or [attr<=3]
 nested attribute: [attr.level2="foo"]
 field: FunctionDeclaration > Identifier.id
 First or last child: :first-child or :last-child
 nth-child (no ax+b support): :nth-child(2)
 nth-last-child (no ax+b support): :nth-last-child(1)
 descendant: ancestor descendant
 child: parent > child
 following sibling: node ~ sibling
 adjacent sibling: node + adjacent
 negation: :not(ForStatement)
 matches-any: :matches([attr] > :first-child, :last-child)
 has: IfStatement:has([name="foo"])
 class of AST node: :statement, :expression, :declaration, :function, or :pattern
*/
const imports = q\`
ImportDeclaration
\`.map(
  i=>({
    clauses: q(i, 'ImportClause Identifier'),
    path: q(i, 'StringLiteral', 0)
  })
)

export default {
  imports
}`;
const QueryEditor = memo(function QueryEditorFunc({ query: queryCode, dispatch }: any) {
  const [query, setQuery] = useState<any>(queryCode || defaultCode);
  console.log("--------------------------");
  localStorage.setItem("query-code", query);
  return (
    <>
      <CodeEditor
        onChange={code => setQuery(code || "")}
        text={query}
        onSave={function() {
          dispatch({ type: "SET_QUERY", query: query });
        }}
        showInfo={true}
        renderWhiteSpace={true}
      />
    </>
  );
});
const GeneratorEditor = function GeneratorEditorFunc({ code: generatorCodeInitial, name, dispatch }: any) {
  const [generatorCode, setGeneratorCode] = useState<any>(`const context = {} as any;
  const {q,data,paramCase,refReplaceFactory} = context;
  `);
  const handleSave = () => {
    dispatch({ type: "SET_GENERATOR", code: generatorCode });
  };
  useEffect(() => {
    setGeneratorCode(generatorCodeInitial);
  }, [generatorCodeInitial]);
  localStorage.setItem("generator-code-" + name, generatorCode);
  return (
    <>
      <CodeEditor
        onChange={text => {
          setGeneratorCode(text);
        }}
        text={generatorCode}
        onSave={handleSave}
        showInfo={true}
        renderWhiteSpace={true}
      />
    </>
  );
};
const CreateGeneratorInput = memo(({ dispatch }: any) => {
  const [value, setValue] = useState("");
  return (
    <>
      <input value={value} onChange={e => setValue(e.target.value)}></input>
      <button
        onClick={() => {
          dispatch({ type: "CREATE_GENERATOR", name: value });
          setValue("");
        }}
      >
        Create Generator
      </button>
    </>
  );
});
const SelectGeneratorInput = memo(({ dispatch, generators, selectedGenerator }: any) => {
  console.log(selectedGenerator);
  return (
    <>
      <label>
        Select Generator
        <select
          onChange={e => {
            dispatch({ type: "SELECT_GENERATOR", name: e.target.value });
          }}
          value={selectedGenerator}
        >
          <option></option>
          {generators.map((g: any) => <option value={g}>{g}</option>)}
        </select>
      </label>
    </>
  );
});
function renderFunctionModule(code: string, name: string): string {
  return `
import { tsquery } from '@phenomnomnominal/tsquery';
const q = (str: string[], ...args: string[]) => {
  let data = state.compiler?.sourceFile;
  let index = -1;
  if (!Array.isArray(str) || str.some(p => typeof p !== 'string')) {
    //@ts-ignore
    data = str as ts.SourceFile;
    str = args.splice(0, 1);
  }
  if (typeof args[args.length - 1] === 'number') {
    //@ts-ignore
    index = args.pop();
  }
  const queryString = str.map((part, idx) => \`\${part.replace(/\n/g, '') || ''}\${args[idx] || ''}\`).filter(p => p).join('');
  if (index !== -1) {
    return data && queryAst(data, queryString)[index];
  }
  return data && queryAst(data, queryString);
};
export default function ${name}(){

  ${
    code.replace(`const context = {} as any;`, "")
      .replace("export default", "return")
  }
}
`;
}
export function App() {
  const { state, dispatch } = useAppContext();
  const compiler = state.compiler;
  if (compiler == null || state.apiLoadingState === ApiLoadingState.Loading)
    return <components.Spinner />;

  console.log(compiler.generators);
  return (
    <div className="App">
      <SplitPane split="horizontal" minSize={50} defaultSize="50%">
        <SplitPane split="horizontal" defaultSize={50} allowResize={false}>
          <header className="AppHeader clearfix">
            <div>
              <img style={{ width: "180px" }} src={logo}></img>
            </div>
            <div>
              <CreateGeneratorInput dispatch={dispatch} />
              <SelectGeneratorInput
                dispatch={dispatch}
                selectedGenerator={compiler.selectedGenerator}
                generators={Object.keys(compiler.generators || {})}
              />
              <button
                onClick={() => {
                  const projectName = window.prompt("Enter project name:");
                  const projectDescription = window.prompt("Enter project description:");
                  const zip = new JSZip();
                  zip.file(
                    "package.json",
                    JSON.stringify({
                      name: projectName,
                      description: projectDescription,
                      scripts: {
                        generate: "ts-node src/index.ts",
                      },
                      dependencies: {
                        "@phenomnomnominal/tsquery": "^4.1.1",
                        "change-case": "^4.1.2",
                        "typescript": "4.3.2",
                        "zx": "2.1.0",
                      },
                    }),
                  );
                  const src = zip.folder("src");

                  const folder = src && src.folder("generators");
                  if (folder) {
                    Object.keys(localStorage).forEach(key => {
                      if (key.startsWith("generator-code-")) {
                        const genName = key.replace("generator-code-", "");
                        folder.file(
                          genName + ".ts",
                          renderFunctionModule(localStorage.getItem(key) || "", genName),
                        );
                      }
                    });
                  }
                  src && src.file("parser.ts", localStorage.getItem("query-code") || "");
                  src && src.file("index.ts", `require('./generator')`);
                  zip.generateAsync({ type: "blob" })
                    .then(function(content) {
                      // see FileSaver.js
                      saveAs(content, projectName + ".zip");
                    });
                }}
              >
                Download
              </button>
            </div>

            <components.Options
              api={compiler == null ? undefined : compiler.api}
              options={state.options}
              onChange={options =>
                dispatch({
                  type: "SET_OPTIONS",
                  options,
                })}
            />
          </header>
          <SplitPane split="vertical" minSize={50} defaultSize="33%">
            {getCodeEditorArea()}
            {getCompilerDependentPanes()}
          </SplitPane>
        </SplitPane>
        <SplitPane split="vertical" minSize={50} defaultSize="25%">
          <SplitPane split="vertical" minSize={50} defaultSize="60%">
            <QueryEditor query={compiler.query} dispatch={dispatch} />

            <ResultViewer
              api={compiler.api}
              sourceFile={compiler.sourceFile}
              selectedNode={compiler.selectedNode}
              onSelectNode={node => dispatch({ type: "SET_SELECTED_NODE", node })}
              results={compiler.results}
              mode={state.options.treeMode}
            />
          </SplitPane>

          <SplitPane split="vertical" minSize={50} defaultSize="60%">
            {state.compiler?.selectedGenerator && state.compiler.generators
              && (
                <GeneratorEditor
                  dispatch={dispatch}
                  code={state.compiler?.generators[state.compiler.selectedGenerator]}
                  name={state.compiler.selectedGenerator}
                />
              )}
            {state.compiler?.generatedCode && (
              <CodeEditor
                text={state.compiler.generatedCode}
                showInfo={true}
                renderWhiteSpace={true}
                readOnly
              />
            )}
          </SplitPane>
        </SplitPane>
      </SplitPane>
      <div>
        <select>
          <option>
            angular
          </option>
        </select>
      </div>
    </div>
  );

  function getCodeHighlightRange() {
    if (compiler == null)
      return undefined;

    const { selectedNode, sourceFile } = compiler;
    return selectedNode === sourceFile ? undefined : {
      start: getStartSafe(selectedNode, sourceFile),
      end: selectedNode.end,
    };
  }

  function getCodeEditorArea() {
    if (state.options.showFactoryCode) {
      return (
        <SplitPane split="horizontal" defaultSize={window.innerHeight * 0.70}>
          {getCodeEditor()}
          {getFactoryCodeEditor()}
        </SplitPane>
      );
    }
    else {
      return getCodeEditor();
    }

    function getFactoryCodeEditor() {
      if (compiler == null || state.apiLoadingState === ApiLoadingState.Loading)
        return <components.Spinner />;

      return (
        <components.ErrorBoundary getResetHash={() => state.code}>
          <components.FactoryCodeEditor compiler={compiler} />
        </components.ErrorBoundary>
      );
    }

    function getCodeEditor() {
      return (
        <components.CodeEditor
          id={constants.css.mainCodeEditor.id}
          onChange={code => dispatch({ type: "SET_CODE", code })}
          onClick={range => {
            if (compiler == null)
              return;
            const descendant = getDescendantAtRange(
              state.options.treeMode,
              compiler.sourceFile,
              range,
              compiler.api,
            );
            dispatch({ type: "SET_SELECTED_NODE", node: descendant });
          }}
          text={state.code}
          highlight={getCodeHighlightRange()}
          showInfo={true}
          renderWhiteSpace={true}
          editorDidMount={codeEditorDidMount}
        />
      );
    }
  }

  function getCompilerDependentPanes() {
    if (compiler == null || state.apiLoadingState === ApiLoadingState.Loading)
      return <components.Spinner />;
    else if (state.apiLoadingState === ApiLoadingState.Error) {
      return (
        <div className={"errorMessage"}>
          Error loading compiler API. Please refresh the page to try again.
        </div>
      );
    }

    return (
      <components.ErrorBoundary>
        <SplitPane split="vertical" minSize={50} defaultSize="100%">
          <SplitPane split="vertical" minSize={50} defaultSize="50%">
            <components.TreeViewer
              api={compiler.api}
              selectedNode={compiler.selectedNode}
              // @ts-ignore
              sourceFile={compiler.sourceFile}
              onSelectNode={node => dispatch({ type: "SET_SELECTED_NODE", node })}
              mode={state.options.treeMode}
            />
            <components.PropertiesViewer
              compiler={compiler}
              selectedNode={compiler.selectedNode}
              sourceFile={compiler.sourceFile}
              bindingTools={compiler.bindingTools}
              bindingEnabled={state.options.bindingEnabled}
              showInternals={state.options.showInternals}
            />
          </SplitPane>
        </SplitPane>
      </components.ErrorBoundary>
    );
  }

  function codeEditorDidMount(editor: import("monaco-editor").editor.IStandaloneCodeEditor) {
    // For some reason a slight delay is necessary here. Otherwise it won't let the user type.
    setTimeout(() => editor.focus(), 100);

    // global method for cypress
    (window as any).setMonacoEditorText = (text: string) => {
      const editorModel = editor.getModel();
      if (editorModel == null)
        return;

      editor.executeEdits("my-source", [{
        range: editorModel.getFullModelRange(),
        text,
      }]);
    };
  }
}
