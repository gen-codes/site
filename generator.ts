const context = {} as any;
const { q, paramCase } = context;

/**
 AST node type: ForStatement (see common node types)
 wildcard: *
 attribute existence: [attr]
 attribute value: [attr="foo"] or [attr=123]
 attribute regex: [attr=/foo.*\/]
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
const imports = q `
ImportDeclaration
`.map(
  i => ({
    clauses: q(i, "ImportClause Identifier.name"),
    path: q(i, "StringLiteral", 0),
    statement: i,
  }),
);

function getAttributes(el) {
  // return el.attributes
  const isHtml = !/^[A-Z]/.test(el.tagName.getFullText());
  if (el.attributes) {
    return el.attributes
      .properties
      .map(attr => {
        let attrType, value;
        let name = attr.name;

        if (q(attr, "JsxElement").length) {
          attrType = "slot";
          value = attr.initializer.expression.expression;
        }
        else if (attr.initializer.text) {
          attrType = "property";
          value = attr.initializer;
        }
        else if (isHtml) {
          if (name.getFullText().trim().startsWith("on")) {
            attrType = "event";
            value = attr.initializer;
          }
          else if (name.getFullText().trim() === "ref") {
            attrType = "ref";
            value = attr.initializer.expression;
          }
          else {
            attrType = "binding";
            value = attr.initializer;
          }
        }
        else {
          attrType = "binding";
          value = attr.initializer;
        }
        console.log(attrType);
        return {
          name: attr.name,
          type: attrType,
          value,
        };
      });
  }
  return el;
}
function getComponent(el) {
  // return el
  if (!el)
    return null;

  if (el.children) {
    return {
      name: el.openingElement.tagName,
      type: "element",
      props: getAttributes(el.openingElement),
      children: el.children.map(getComponent),
    };
  }
  else if (el.text) {
    return {
      type: "text",
      value: el,
    };
  }
  else if (el.tagName) {
    return {
      name: el.tagName,
      props: getAttributes(el),
      type: "element",
    };
  }
  else if (el.expression) {
    const expr = el.expression;
    if (expr.condition) {
      return {
        type: "condition",
        ifCondition: expr.condition,
        whenTrue: getComponent(expr.whenTrue),
        whenFalse: getComponent(expr.whenFalse),
      };
    }
    else if (expr.operatorToken) {
      return {
        type: "condition",
        ifCondition: expr.left,
        whenTrue: getComponent(expr.right),
      };
    }
    else if (expr.expression) {
      if (expr.arguments) {
        return {
          type: "loop",
          variable: expr.expression.expression,
          item: expr.arguments[0].parameters[0],
          index: expr.arguments[0].parameters[1],
          body: getComponent(expr.arguments[0].body),
        };
      }
      return {
        type: "expression",
        value: expr.expression,
      };
    }
    return el;
  }
}
function getVariableCallInitial(v) {
  return {
    name: v.name,
    value: v.initializer.arguments,
    type: v.initializer.typeArguments,
  };
}
function getRefs(func) {
  const allRefs = q(
    func,
    `
      VariableStatement:has(
        CallExpression:has(
          Identifier[escapedText="useRef"]
        )
      )`,
  );
  const refs = [];
  const elementRefs = allRefs.map(r => ({
    ...getVariableCallInitial(r.declarationList.declarations[0]),
  })).filter(ref => {
    const result = q `
    JsxAttribute JsxExpression>Identifier[
      escapedText="${ref.name.getText()}"
      ]
    `;

    if (!result.length)
      refs.push(ref);
    return result.length;
  });
  return {
    refs,
    elementRefs,
  };
}
const component = q `FunctionDeclaration:has(ExportKeyword):has(DefaultKeyword)`
  .map(func => ({
    name: func.name,
    inputProps: q(
      func,
      `
      FunctionDeclaration>Parameter BindingElement
    `,
    ).map(el => ({
      name: el.name,
      defaultValue: el.initializer,
    })),
    states: q(
      func,
      `
      VariableStatement:has(
        CallExpression:has(
          Identifier[escapedText="useState"]
        )
      )`,
    ).map(s => getVariableCallInitial(s.declarationList.declarations[0]))
      .map(s => ({
        ...s,
        name: s.name.elements[0].name,
        setter: s.name.elements[1].name,
      })),
    ...getRefs(func),

    methods: q(
      func,
      `
      FunctionDeclaration FunctionDeclaration
    `,
    ),
    render: getComponent(q(
      func,
      `
      ReturnStatement:has(JsxElement)
      >ParenthesizedExpression
      >JsxElement 
    `,
      0,
    )),
  }))[0];
const data = {
  componentsUsed: q `JsxOpeningElement
    >Identifier[escapedText=/^[A-Z]/]`
    .concat(q `JsxSelfClosingElement
    >Identifier[escapedText=/^[A-Z]/]`),
  component,
  imports,
};
const refReplaceFactory = (props, comp) => {
  return function(code) {
    for (const key in props) {
      comp[key].forEach(ref => {
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
const angular = ({ component: comp, ...context }) => {
  const angularProps = props => {
    return props.map(prop => {
      switch (prop.type) {
        case "event":
          return `(${
            prop.name.getFullText()
              .trim().replace(/^on/, "").toLowerCase()
          })="${prop.value.expression.getFullText()}"`;
        case "property":
          return `${prop.name.getFullText().trim()}${prop.value && `=${prop.value.getFullText()}`}`;
        case "binding":
          return `[${prop.name.getFullText().trim()}]${prop.value
            && `="${prop.value.expression.getFullText()}"`}`;
        case "ref":
          return `#${prop.value.getFullText()}`;
      }
    }).join(" ");
  };
  const blockToAngular = tree => {
    return tree.map(el => {
      switch (el.type) {
        case "element":
          if (el.children) {
            return `
          <${paramCase(el.name.getFullText())} ${angularProps(el.props)}>
            ${blockToAngular(el.children)}
          </${paramCase(el.name.getFullText())}>`;
          }
          else {
            return `<${paramCase(el.name.getFullText())} ${angularProps(el.props)}/>`;
          }
        case "text":
          return el.value.getFullText();
      }
    }).join("");
  };
  const refReplace = refReplaceFactory({
    elementRefs: {
      name: {
        find: n => n + ".current",
        replace: n => "this." + n + ".nativeElement",
      },
    },
    refs: {
      name: {
        find: n => n + ".current",
        replace: n => "this." + n,
      },
    },
    states: {
      name: {
        find: n => n,
        replace: n => "this." + n,
      },
      setter: {
        find: (n, ref) => `${n}\\((.*?)\\)`,
        replace: (n, ref) => `this.${ref.name.getFullText().trim()} = $1`,
      },
    },
    inputProps: {
      name: {
        find: n => n,
        replace: n => "this." + n,
      },
    },
  }, comp);

  return `import { Component } from "@angular/core";
${
    context.imports
      .filter(({ path }) => path.text !== "react")
      .filter(({ clauses }) => {
        console.log(clauses, context.componentsUsed);
        return !clauses.some(
          c =>
            !!context.componentsUsed.some(
              co => c.getFullText().trim() === co.getFullText().trim(),
            ),
        );
      })
      .map(i => i.statement.getFullText()).join("")
  }

@Component({
  selector: "${paramCase(comp.name.getText())}",
  template: \`
    ${blockToAngular([comp.render])}
  \`,
})
export class ${comp.name.getText()} {
  ${
    comp.elementRefs.map(({ name }) => `@ViewChild("${name.getFullText().trim()}") ${name.getFullText().trim()}: ElementRef | undefined;`)
      .join("\n")
  }
  ${
    comp.inputProps.map(({ name, defaultValue }) => `@Input() ${name.getFullText().trim()}: any ${defaultValue ? `= ${defaultValue.getFullText()}` : ""};`)
      .join("\n")
  }
  ${
    comp.states.map(({ name, value }) => {
      return `${name.getFullText()} ${value[0] && `= ${value[0].getFullText()}`}`;
    }).join("\n")
  }
  ${
    comp.methods.map(m =>
      refReplace(
        m.getFullText(),
      ).trim()
        .replace(/^function (.*?)\((.*?)\).*?{/, "$1 = ($2) => {")
    ).join("\n")
  }

}
`;
};
console.group();
console.info(angular(data));
console.groupEnd();

export default data;

/*
const context = {} as any;
const {q,data,paramCase,refReplaceFactory} = context;
const {component: comp, ...ctx} = data
  const angularProps = (props) => {
    return props.map(prop=>{
      switch(prop.type){
        case 'event':
          return `(${prop.name.getFullText()
          .trim().replace(/^on/,'').toLowerCase()})="${
            prop.value.expression.getFullText()
          }"`
        case 'property':
          return `${prop.name.getFullText().trim()}${prop.value && `=${prop.value.getFullText()}`}`
        case 'binding':
          return `[${prop.name.getFullText().trim()}]${prop.value && `="${prop.value.expression.getFullText()}"`}`
        case 'ref':
          return `#${prop.value.getFullText()}`
      }
    }).join(' ')
  }
  const blockToAngular = (tree)=>{
    return tree.map(el=>{
      switch(el.type){
        case 'element':
          if(el.children){
            return `
          <${paramCase(el.name.getFullText())} ${angularProps(el.props)}>
            ${blockToAngular(el.children)}
          </${paramCase(el.name.getFullText())}>`
          }else {
            return `<${paramCase(el.name.getFullText())} ${angularProps(el.props)}/>`

          }
        case 'text':
          return el.value.getFullText()
      }
    }).join('')
  }
  const refReplace = refReplaceFactory({
    elementRefs: {
      name: {
        find:(n)=>n+'.current',
        replace:(n)=>'this.'+n+'.nativeElement'
      }
    },
    refs: {
      name: {
        find:(n)=>n+'.current',
        replace:(n)=>'this.'+n
      }
    },
    states: {
      name: {
        find:(n)=>n,
        replace:(n)=>'this.'+n
      },
      setter: {
        find: (n, ref)=>`${n}\\((.*?)\\)`,
        replace:(n,ref)=>`this.${ref.name.getFullText().trim()} = $1`
      }
    },
    inputProps: {
      name: {
        find:(n)=>n,
        replace:(n)=>'this.'+n
      },
    }
  }, comp)


export default `import { Component } from "@angular/core";
${ctx.imports
.filter(({path})=>path.text!=='react')
.filter(({clauses})=>{
  console.log(clauses, ctx.componentsUsed)
  return !clauses.some(
  c=>!!ctx.componentsUsed.some(
    (co)=>c.getFullText().trim()===co.getFullText().trim()
  )
  )
})
.map(i=>i.statement.getFullText()).join('')}

@Component({
  selector: "${paramCase(comp.name.getText())}",
  template: \`
    ${blockToAngular([comp.render])}
  \`,
})
export class ${comp.name.getText()} {
  ${comp.elementRefs.map(({name})=>
   `@ViewChild("${name.getFullText().trim()}") ${
     name.getFullText().trim()}: ElementRef | undefined;`)
     .join('\n')}
  ${comp.inputProps.map(({name, defaultValue})=>
    `@Input() ${name.getFullText().trim()}: any ${defaultValue?`= ${defaultValue.getFullText()}`:''};`
  ).join('\n')}
  ${comp.states.map(({name, value})=>{
    return `${name.getFullText()} ${value[0]&&`= ${value[0].getFullText()}`}`}).join('\n')}
  ${comp.methods.map(m=>refReplace(
      m.getFullText()
    ).trim()
    .replace(/^function (.*?)\((.*?)\).*?{/, '$1 = ($2) => {')).join('\n')}

}
`
*/
