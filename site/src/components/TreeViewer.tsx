import { constants, TreeMode } from "../shared";
import CircularJson from "circular-json";
import React, { useEffect, useRef } from "react";
import TreeView from "react-treeview";
import { CompilerApi, getChildrenFunction, Node, SourceFile } from "../compiler";
import { getSyntaxKindName } from "../utils";

export interface TreeViewerProps {
  api: CompilerApi;
  sourceFile: SourceFile;
  selectedNode: Node;
  onSelectNode: (node: Node) => void;
  mode: TreeMode;
}
function TreeItem({ kindName, i, label, n, renderNode, getChildren, childrenArr, isSelected }: any) {
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isSelected)
      r.current && r.current.scrollIntoView();
  }, [isSelected]);
  if (childrenArr.length === 0)
    return <div ref={r} key={i++} className="endNode" data-name={kindName}>{label}</div>;
  return (
    <div ref={r} data-name={kindName} key={i++}>
      <TreeView nodeLabel={label}>
        {childrenArr.map((n: any) => renderNode(n, getChildren))}
      </TreeView>
    </div>
  );
}

export function TreeViewer(props: TreeViewerProps) {
  const { sourceFile, selectedNode, onSelectNode, mode, api } = props;
  let i = 0;

  return <div id={constants.css.treeViewer.id}>{renderNode(sourceFile, getChildrenFunction(mode, sourceFile))}</div>;

  function renderNode(node: Node, getChildren: (node: Node) => (Node[])): JSX.Element {
    const children = getChildren(node);
    const isSelected = node === selectedNode;

    const className = "nodeText" + (isSelected ? " " + constants.css.treeViewer.selectedNodeClass : "");
    const kindName = getSyntaxKindName(api, node.kind);
    const label = <div onClick={() => onSelectNode(node)} className={className}>{kindName}</div>;

    return (
      <TreeItem
        key={i++}
        isSelected={isSelected}
        kindName={kindName}
        i={i}
        label={label}
        renderNode={renderNode}
        childrenArr={children}
        getChildren={getChildren}
      />
    );
  }
}

export interface ResultViewerProps extends TreeViewerProps {
  results: any;
}
export function ResultViewer(props: ResultViewerProps) {
  const { sourceFile, results, selectedNode, onSelectNode, mode, api } = props;
  let i = 0;
  // return (<>sds</>)
  return <div id={constants.css.treeViewer.id}>{renderNode(results, getChildrenFunction(mode, sourceFile))}</div>;

  function renderNode(node: Node, getChildren: (node: Node) => (Node[])): JSX.Element {
    if (!node)
      return <>empty</>;
    if (node.kind) {
      // return (
      //   <>{node.kind}</>
      // )
      const children = getChildren(node);
      const className = "nodeText"
        + (node === selectedNode ? " " + constants.css.treeViewer.selectedNodeClass : "");
      const kindName = getSyntaxKindName(api, node.kind);
      const label = <div onClick={() => onSelectNode(node)} className={className}>{kindName}</div>;
      if (children.length === 0)
        return <div key={i++} className="endNode" data-name={kindName}>{label} {node.getFullText()}</div>;
      else {
        return (
          <div data-name={kindName} key={i++}>
            <TreeView nodeLabel={label} defaultCollapsed>
              {children.map((n: any) => renderNode(n, getChildren))}
            </TreeView>
          </div>
        );
      }
    }
    else if (typeof node === "object") {
      return (
        <>
          {Object.entries(node).map(([label, children]) => {
            // if(label==='parent'){
            //   return <></>
            // }
            // return <>{label}</>
            if (Array.isArray(children)) {
              return (
                <div key={i++}>
                  <TreeView nodeLabel={label}>
                    {children.map((n: any, idx: number) =>
                      // <TreeView nodeLabel={`${idx}`}>{
                      renderNode(n, getChildren)
                      // }</TreeView>
                    )}
                  </TreeView>
                </div>
              );
            }
            else {
              return (
                <div key={i++}>
                  <TreeView nodeLabel={label}>
                    {renderNode(children, getChildren)}
                  </TreeView>
                </div>
              );
            }
          })}
        </>
      );
    }
    else {
      return <div key={i++} className="endNode">{node}</div>;
    }
  }
}
