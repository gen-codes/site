import { checkSymbol, forAllCompilerVersions, selectNode, setEditorText, setVersion, visitSite } from "../helpers";

forAllCompilerVersions(packageName => {
  describe(`selecting a node with a symbol (${packageName})`, () => {
    before(() => {
      visitSite();
      setVersion(packageName);
      setEditorText("class Test { prop: string; }");
      selectNode("ClassDeclaration");
    });

    // todo: more tests in the future
    checkSymbol({
      name: "Test",
    });
  });
});
