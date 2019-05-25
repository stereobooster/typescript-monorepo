// Link.react.test.js
import React from "react";
import renderer from "react-test-renderer";

import { B } from "../B";

describe("B", () => {
  test("Link changes the class when hovered", () => {
    const component = renderer.create(<B />);
    let tree = component.toJSON();
    expect(tree).toEqual({ type: 'div', props: {}, children: [ 'B: ' ] });
  });
});
