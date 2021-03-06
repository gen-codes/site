import { checkType, forAllCompilerVersions, selectNode, setEditorText, setVersion, visitSite } from "../helpers";

forAllCompilerVersions(packageName => {
  describe(`selecting a node with a symbol (${packageName})`, () => {
    before(() => {
      visitSite();
      setVersion(packageName);
      setEditorText("class Test { prop: string; } let v: Test;");
      selectNode("VariableStatement", "TypeReference");
    });

    // todo: more tests in the future
    checkType({
      name: "Test",
    });
  });
});
