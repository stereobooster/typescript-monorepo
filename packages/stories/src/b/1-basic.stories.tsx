import { storiesOf } from "@storybook/react";
import { withInfo } from "@storybook/addon-info";
import * as React from "react";
import { d } from "@stereobooster/d";
import { B } from "@stereobooster/b";

storiesOf("@stereobooster/b/1. Basic", module).add(
  "first",
  withInfo({ inline: false })(() => {
    return <B>{d()}</B>;
  })
);
