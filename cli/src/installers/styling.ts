import path from "path";
import fs from "fs-extra";
import { type PackageJson } from "type-fest";

import { PKG_ROOT } from "~/consts.js";
import { type Installer, type StylingType } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import {
  AvailableDependencies,
  shadcnDependencyVersionMap,
  type GetAvailablePackages,
} from "./dependencyVersionMap.js";

export const stylingInstaller: Installer<{ type: StylingType }> = ({
  projectDir,
  type,
}) => {
  const isShadcn = type == "shadcn";
  addPackageDependency({
    projectDir,
    dependencies: [
      "tailwindcss",
      "postcss",
      "prettier",
      "prettier-plugin-tailwindcss",
      "postcss-nesting",
      ...(isShadcn
        ? (Object.keys(
            shadcnDependencyVersionMap.devDeps
          ) as GetAvailablePackages<typeof shadcnDependencyVersionMap>[])
        : []),
    ],
    devMode: true,
  });
  addPackageDependency({
    projectDir,
    dependencies: isShadcn
      ? (Object.keys(shadcnDependencyVersionMap.deps) as GetAvailablePackages<
          typeof shadcnDependencyVersionMap
        >[])
      : [],
    devMode: false,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  const twCfgSrc = path.join(
    extrasDir,
    "config",
    isShadcn ? "shadcn.tailwind.config.ts" : "tailwind.config.ts"
  );
  const twCfgDest = path.join(projectDir, "tailwind.config.ts");

  const postcssCfgSrc = path.join(extrasDir, "config/postcss.config.js");
  const postcssCfgDest = path.join(projectDir, "postcss.config.js");

  const prettierSrc = path.join(extrasDir, "config/_prettier.config.js");
  const prettierDest = path.join(projectDir, "prettier.config.js");

  const cssSrc = path.join(
    extrasDir,
    "src/styles",
    isShadcn ? "shadcn.css" : "globals.css"
  );
  const cssDest = path.join(projectDir, "src/styles/globals.css");

  const twIndicatorSrc = path.join(
    extrasDir,
    "src/app/_components/tailwind-indicator.tsx"
  );
  const twIndicatorDest = path.join(
    projectDir,
    "src/components/tailwind-indicator.tsx"
  );

  const copySrcDest: [string, string][] = [
    [twCfgSrc, twCfgDest],
    [postcssCfgSrc, postcssCfgDest],
    [cssSrc, cssDest],
    [prettierSrc, prettierDest],
    [twIndicatorSrc, twIndicatorDest],
  ];

  if (isShadcn) {
    const utilsSrc = path.join(extrasDir, "src/utils/shadcn-utils.ts");
    const utilsDest = path.join(projectDir, "src/lib/utils.ts");

    const componentsSrc = path.join(extrasDir, "config/shadcn-components.json");
    const componentsDest = path.join(projectDir, "components.json");

    copySrcDest.push([utilsSrc, utilsDest], [componentsSrc, componentsDest]);
  }

  // add format:* scripts to package.json
  const packageJsonPath = path.join(projectDir, "package.json");

  const packageJsonContent = fs.readJSONSync(packageJsonPath) as PackageJson;
  packageJsonContent.scripts = {
    ...packageJsonContent.scripts,
    "format:write": 'prettier --write "**/*.{ts,tsx,js,jsx,mdx}" --cache',
    "format:check": 'prettier --check "**/*.{ts,tsx,js,jsx,mdx}" --cache',
  };

  // fs.copySync(twCfgSrc, twCfgDest);
  // fs.copySync(postcssCfgSrc, postcssCfgDest);
  // fs.copySync(cssSrc, cssDest);
  // fs.copySync(prettierSrc, prettierDest);
  // fs.copySync(twIndicatorSrc, twIndicatorDest);

  copySrcDest.forEach(([src, dest]) => {
    fs.copySync(src, dest);
  });

  fs.writeJSONSync(packageJsonPath, packageJsonContent, {
    spaces: 2,
  });
};

export const tailwindInstaller: Installer = (opts) => {
  stylingInstaller({ ...opts, type: "tailwind" });
};
export const shadcnInstaller: Installer = (opts) => {
  stylingInstaller({ ...opts, type: "shadcn" });
};
