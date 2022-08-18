import { TreeNode } from "@seanchas116/paintkit/src/util/TreeNode";
import * as babel from "@babel/types";
import { clone } from "lodash-es";
import { JSXTextNode } from "./JSXTextNode";
import { JSXOtherNode } from "./JSXOtherNode";
import { Style } from "../Style";
import { JSXElementUtil } from "../JSXElementUtil";
import { makeObservable, observable } from "mobx";
import { NodeBase } from "./NodeBase";

export class JSXElementNode extends NodeBase<
  JSXElementNode,
  JSXElementNode,
  JSXElementNode | JSXTextNode | JSXOtherNode
> {
  constructor(ast: babel.JSXElement) {
    super();
    this.originalAST = ast;
    this.loadAST(ast);
  }

  originalAST: babel.JSXElement;
  readonly style = new Style();
  readonly computedStyle = new Style();

  loadAST(ast: babel.JSXElement) {
    const children = ast.children.map((child) => {
      if (child.type === "JSXText") {
        return new JSXTextNode(child);
      } else if (child.type === "JSXElement") {
        return new JSXElementNode(child);
      } else {
        return new JSXOtherNode(child);
      }
    });

    this.originalAST = ast;
    this.clear();
    this.append(...children);
    this.style.loadTailwind(
      JSXElementUtil.getAttribute(ast.openingElement, "className") ?? ""
    );
  }

  toAST(): babel.JSXElement {
    const element = babel.cloneNode(this.originalAST, false);
    element.children = this.children.map((child) => child.toAST());
    element.openingElement = babel.cloneNode(this.originalAST.openingElement);

    JSXElementUtil.setAttribute(
      element.openingElement,
      "className",
      this.style.toTailwind()
    );
    return element;
  }

  get tagName(): string {
    if (this.originalAST.openingElement.name.type === "JSXIdentifier") {
      return this.originalAST.openingElement.name.name;
    } else {
      return "div";
    }
  }
}
