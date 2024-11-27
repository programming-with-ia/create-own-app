import gradient from "gradient-string";

import { TITLE_TEXT } from "~/consts.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";

// colors brought in from vscode poimandres theme
const poimandresTheme = [
  "#add7ff", // blue
  "#89ddff", // cyan
  "#5de4c7", // green
  "#fae4fc", // magenta
  "#d0679d", // red
  "#fffac2", // yellow
];

export const renderTitle = () => {
  const Gradient = gradient(poimandresTheme);

  // resolves weird behavior where the ascii is offset
  const pkgManager = getUserPkgManager();
  if (["yarn", "pnpm"].includes(pkgManager)) {
    console.log("");
  }
  console.log(Gradient.multiline(TITLE_TEXT));
};
