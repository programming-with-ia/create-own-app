import { envVariablesInstaller } from "~/installers/envVars.js";
import { nextAuthInstaller } from "~/installers/nextAuth.js";
import { prismaInstaller } from "~/installers/prisma.js";
import { shadcnInstaller, tailwindInstaller } from "~/installers/styling.js";
import { trpcInstaller } from "~/installers/trpc.js";
import { type PackageManager } from "~/utils/getUserPkgManager.js";
import { dbContainerInstaller } from "./dbContainer.js";
import { drizzleInstaller } from "./drizzle.js";
import { dynamicEslintInstaller } from "./eslint.js";

// Turning this into a const allows the list to be iterated over for programmatically creating prompt options
// Should increase extensibility in the future
export const availablePackages = [
  "nextAuth",
  "prisma",
  "drizzle",
  "tailwind",
  "shadcn",
  "trpc",
  "envVariables",
  "eslint",
  "dbContainer",
] as const;
export type AvailablePackages = (typeof availablePackages)[number];

export const databaseProviders = [
  "mysql",
  "postgres",
  "sqlite",
  "planetscale",
] as const;

// type InstallerPackages = {
//   styling: "tailwind" | "shadcn" | "none";
// };

export type DatabaseProvider = (typeof databaseProviders)[number];
export type StylingType = "tailwind" | "shadcn" | "none"; // none == without tailwind

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages: PkgInstallerMap;
  appRouter: boolean;
  projectName: string;
  scopedAppName: string;
  databaseProvider: DatabaseProvider;
}

export type Installer<T = {}> = (opts: InstallerOptions & T) => void;

export type PkgInstallerMap = {
  [pkg in AvailablePackages]: {
    inUse: boolean;
    installer: Installer;
  };
};

export const buildPkgInstallerMap = (
  packages: AvailablePackages[],
  databaseProvider: DatabaseProvider
): PkgInstallerMap => ({
  nextAuth: {
    inUse: packages.includes("nextAuth"),
    installer: nextAuthInstaller,
  },
  prisma: {
    inUse: packages.includes("prisma"),
    installer: prismaInstaller,
  },
  drizzle: {
    inUse: packages.includes("drizzle"),
    installer: drizzleInstaller,
  },
  tailwind: {
    inUse: packages.includes("tailwind"),
    installer: tailwindInstaller,
  },
  shadcn: {
    inUse: packages.includes("shadcn"),
    installer: shadcnInstaller,
  },
  trpc: {
    inUse: packages.includes("trpc"),
    installer: trpcInstaller,
  },
  dbContainer: {
    inUse: ["mysql", "postgres"].includes(databaseProvider),
    installer: dbContainerInstaller,
  },
  envVariables: {
    inUse: true,
    installer: envVariablesInstaller,
  },
  eslint: {
    inUse: true,
    installer: dynamicEslintInstaller,
  },
});
