import * as p from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";

import { CREATE_OWN_APP, DEFAULT_APP_NAME, IMPORTALIAS } from "~/consts.js";
import {
  databaseProviders,
  type AvailablePackages,
  type DatabaseProvider,
  type StylingType,
} from "~/installers/index.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { getVersion } from "~/utils/getVersion.js";
import { IsTTYError } from "~/utils/isTTYError.js";
import { logger } from "~/utils/logger.js";
import { mergeObjects } from "~/utils/merge.js";
import { validateAppName } from "~/utils/validateAppName.js";
import { validateImportAlias } from "~/utils/validateImportAlias.js";

interface CliFlags {
  noGit: boolean;
  noInstall: boolean;
  default: boolean;
  importAlias: string;

  /** @internal Used in CI. */
  tailwind: boolean;
  trpc: boolean;
  prisma: boolean;
  drizzle: boolean;
  nextAuth: boolean;
  appRouter: boolean;
  shadcn: boolean;
  dbProvider: DatabaseProvider;
}

interface CliResults {
  appName: string;
  packages: AvailablePackages[];
  flags: CliFlags;
  databaseProvider: DatabaseProvider;
}

const defaultOptions = {
  appName: DEFAULT_APP_NAME,
  packages: ["tailwind", "trpc", "nextAuth", "prisma"] as AvailablePackages[],
  flags: {
    noGit: false,
    noInstall: false,
    default: false,
    importAlias: IMPORTALIAS,
    appRouter: false,
    dbProvider: "sqlite",
    // doesn't matter
    tailwind: true,
    shadcn: false,
    trpc: true,
    prisma: true,
    drizzle: false,
    nextAuth: true,
  },
  databaseProvider: "sqlite",
} as const satisfies CliResults;

export const runCli = async (): Promise<CliResults> => {
  // const cliResults: CliResults = defaultOptions;
  const result: CliResults = { ...defaultOptions };
  result.packages = [];

  const isLogicalTrue = (value: string) => !!value && value !== "false";
  const isUndefined = (value: unknown): value is undefined =>
    value == undefined;
  const setFlags = (
    noGit: boolean | undefined,
    noInstall: boolean | undefined,
    appRouter: boolean | undefined,
    importAlias: string | undefined
  ) => {
    result.flags.noGit = noGit ?? result.flags.noGit;
    result.flags.noInstall = noInstall ?? result.flags.noInstall;
    result.flags.appRouter = appRouter ?? result.flags.appRouter;
    result.flags.importAlias = importAlias ?? result.flags.importAlias;
  };
  const addPackages = (
    shadcn: boolean | undefined,
    tailwind: boolean | undefined,
    trpc: boolean | undefined,
    nextAuth: boolean | undefined,
    prisma: boolean | undefined,
    drizzle: boolean | undefined
  ) => {
    if (shadcn) result.packages.push("shadcn");
    else if (tailwind) result.packages.push("tailwind");

    if (trpc) result.packages.push("trpc");
    if (nextAuth) result.packages.push("nextAuth");

    if (prisma) result.packages.push("prisma");
    else if (drizzle) result.packages.push("drizzle"); // duplicates already handled
  };

  /* #region CI program */
  const program = new Command()
    .name(CREATE_OWN_APP)
    .description("A CLI for creating web applications with the OWN stack")
    .argument(
      "[dir]",
      "The name of the application, as well as the name of the directory to create"
    )
    .option(
      "--noGit",
      "Explicitly tell the CLI to not initialize a new git repo in the project",
      isLogicalTrue
    )
    .option(
      "--noInstall",
      "Explicitly tell the CLI to not run the package manager's install command",
      isLogicalTrue
    )
    .option(
      "-y, --default",
      "Bypass the CLI and use all default options to bootstrap a new own-app",
      defaultOptions.flags.default
    )
    /** START CI-FLAGS */
    .option("--tailwind [boolean]", "Install Tailwind CSS", isLogicalTrue)
    .option("--shadcn [boolean]", "Install Tailwind CSS", isLogicalTrue)
    .option("--nextAuth [boolean]", "Install NextAuth.js", isLogicalTrue)
    .option("--prisma [boolean]", "Install Prisma", isLogicalTrue)
    .option("--drizzle [boolean]", "Install Drizzle", isLogicalTrue)
    .option("--trpc [boolean]", "Install tRPC", isLogicalTrue)
    .option("-i, --import-alias [alias]", "Custom import alias")
    .option(
      "--dbProvider [provider]",
      `Choose a database provider: ${databaseProviders.join(", ")}`
    )
    .option("--appRouter [boolean]", "Use Next.js app router", isLogicalTrue)
    /** END CI-FLAGS */
    .version(getVersion(), "-v, --version", "Display the version number")
    .addHelpText(
      "afterAll",
      `\n The own stack was inspired by ${chalk.hex("#E8DCFF")}\n`
    )
    .parse(process.argv);
  /* #endregion */

  // FIXME: TEMPORARY WARNING WHEN USING YARN 3. SEE ISSUE create-t3-app#57
  if (process.env.npm_config_user_agent?.startsWith("yarn/3")) {
    logger.warn(`  WARNING: It looks like you are using Yarn 3. This is currently not supported,
  and likely to result in a crash. Please run create-own-app with another
  package manager such as pnpm, npm, or Yarn Classic.
  See: https://github.com/t3-oss/create-t3-app/issues/57`);
  }

  // Needs to be separated outside the if statement to correctly infer the type as string | undefined
  const programOpts: CliFlags = program.opts();
  const cliProvidedName = program.args[0];

  //* CI Arguments Checking
  // App Name
  if (cliProvidedName && validateAppName(cliProvidedName)) {
    logger.warn("Invalid app Name");
    process.exit(0);
  }
  // ORM | DataBase
  if (programOpts.prisma && programOpts.drizzle) {
    // We test a matrix of all possible combination of packages in CI. Checking for impossible
    // combinations here and exiting gracefully is easier than changing the CI matrix to exclude
    // invalid combinations. We are using an "OK" exit code so CI continues with the next combination.
    logger.warn("Incompatible combination Prisma + Drizzle. Exiting.");
    process.exit(0);
  }
  // DB-Provider
  if (
    programOpts.dbProvider &&
    !databaseProviders.includes(programOpts.dbProvider)
  ) {
    logger.warn(
      `Incompatible database provided. Use: ${databaseProviders.join(", ")}. Exiting.`
    );
    process.exit(0);
  }
  result.appName = cliProvidedName ?? result.appName;
  result.databaseProvider =
    programOpts.dbProvider ?? defaultOptions.databaseProvider;

  addPackages(
    programOpts.shadcn,
    programOpts.tailwind,
    programOpts.trpc,
    programOpts.nextAuth,
    programOpts.prisma,
    programOpts.drizzle
  );
  setFlags(
    programOpts.noGit,
    programOpts.noInstall,
    programOpts.appRouter,
    programOpts.importAlias
  );
  result.flags = mergeObjects(defaultOptions.flags, programOpts);
  if (programOpts.default) {
    return result;
  }

  const pkgManager = getUserPkgManager();
  const prompts = {
    // name
    ...(!cliProvidedName && {
      name: () =>
        p.text({
          message: "What will your project be called?",
          defaultValue: cliProvidedName,
          validate: validateAppName,
        }),
    }),
    // language
    language: () => {
      return p.select({
        message: "Will you be using TypeScript or JavaScript?",
        options: [
          { value: "typescript", label: "TypeScript" },
          { value: "javascript", label: "JavaScript" },
        ],
        initialValue: "typescript",
      });
    },
    _: ({ results }) =>
      results.language === "javascript"
        ? p.note(chalk.redBright("Wrong answer, using TypeScript instead"))
        : undefined,
    // styling | tailwind
    ...(isUndefined(programOpts.shadcn ?? programOpts.tailwind) && {
      styling: () => {
        return p.select({
          message: "What Styling method would you like to use?",
          options: [
            { value: "none", label: "None" }, // without tailwind
            { value: "tailwind", label: "Tailwind CSS" },
            { value: "shadcn", label: "Tailwind CSS + Shadcn" },
          ],
          initialValue: "tailwind" as StylingType,
        });
      },
    }),
    // shadcn themes Maybe later
    // trpc
    ...(isUndefined(programOpts.trpc) && {
      trpc: () => {
        return p.confirm({
          message: "Would you like to use tRPC?",
          initialValue: false,
        });
      },
    }),
    // Authentication
    ...(programOpts.nextAuth ==
      undefined /*  && programOpts.clerk == undefined */ && {
      authentication: () => {
        return p.select({
          message: "What authentication provider would you like to use?",
          options: [
            { value: "none", label: "None" },
            { value: "next-auth", label: "NextAuth.js" },
            // Maybe later
            // { value: "clerk", label: "Clerk" },
          ],
          initialValue: "none",
        });
      },
    }),
    // database | ORMs
    ...(isUndefined(programOpts.prisma ?? programOpts.drizzle) && {
      database: () => {
        return p.select({
          message: "What database ORM would you like to use?",
          options: [
            { value: "none", label: "None" },
            { value: "prisma", label: "Prisma" },
            { value: "drizzle", label: "Drizzle" },
          ],
          initialValue: "none",
        });
      },
    }),
    // databaseProvider
    ...(isUndefined(programOpts.prisma ?? programOpts.drizzle) &&
    !programOpts.dbProvider
      ? {
          databaseProvider: ({ results }) => {
            if (isUndefined(results.database) || results.database === "none")
              return;
            return p.select({
              message: "What database provider would you like to use?",
              options: [
                { value: "sqlite", label: "SQLite (LibSQL)" },
                { value: "mysql", label: "MySQL" },
                { value: "postgres", label: "PostgreSQL" },
                { value: "planetscale", label: "PlanetScale" },
              ],
              initialValue: "sqlite" as DatabaseProvider,
            });
          },
        }
      : {}),
    // appRouter
    ...(isUndefined(programOpts.appRouter) && {
      appRouter: () => {
        return p.confirm({
          message: "Would you like to use Next.js App Router?",
          initialValue: true,
        });
      },
    }),
    // Git
    ...(isUndefined(programOpts.noGit) && {
      git: () => {
        return p.confirm({
          message:
            "Should we initialize a Git repository and stage the changes?",
          initialValue: !defaultOptions.flags.noGit,
        });
      },
    }),
    // importAlias
    ...(!programOpts.importAlias && {
      importAlias: () => {
        return p.text({
          message: "What import alias would you like to use?",
          defaultValue: defaultOptions.flags.importAlias,
          placeholder: defaultOptions.flags.importAlias,
          validate: validateImportAlias,
        });
      },
    }),
    // install
    ...(isUndefined(programOpts.noInstall) && {
      install: () => {
        return p.confirm({
          message:
            `Should we run '${pkgManager}` +
            (pkgManager === "yarn" ? `'?` : ` install' for you?`),
          initialValue: !defaultOptions.flags.noInstall,
        });
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as const satisfies p.PromptGroup<any>;

  if (Object.keys(prompts).length === 2) return result; // only typescript

  // Explained below why this is in a try/catch block
  try {
    if (process.env.TERM_PROGRAM?.toLowerCase().includes("mintty")) {
      logger.warn(`  WARNING: It looks like you are using MinTTY, which is non-interactive. This is most likely because you are
  using Git Bash. If that's that case, please use Git Bash from another terminal, such as Windows Terminal. Alternatively, you
  can provide the arguments from the CLI directly: https://own.oimmi.com/installation#experimental-usage to skip the prompts.`);

      throw new IsTTYError("Non-interactive environment");
    }

    const project = await p.group(prompts, {
      onCancel() {
        process.exit(1);
      },
    });

    result.appName = project.name ?? result.appName;
    result.databaseProvider =
      project.databaseProvider || result.databaseProvider;

    addPackages(
      project.styling == "shadcn",
      project.styling == "tailwind",
      project.trpc,
      project.authentication === "next-auth",
      project.database === "prisma",
      project.database === "drizzle"
    );

    setFlags(
      !project.git,
      !project.install,
      project.appRouter,
      project.importAlias
    );

    return result;
  } catch (err) {
    // If the user is not calling create-own-app from an interactive terminal, inquirer will throw an IsTTYError
    // If this happens, we catch the error, tell the user what has happened, and then continue to run the program with a default own app
    if (err instanceof IsTTYError) {
      logger.warn(
        `${CREATE_OWN_APP} needs an interactive terminal to provide options`
      );

      const shouldContinue = await p.confirm({
        message: `Continue scaffolding a default OWN app?`,
        initialValue: true,
      });

      if (!shouldContinue) {
        logger.info("Exiting...");
        process.exit(0);
      }

      logger.info(`Bootstrapping a default OWN app in ./${result.appName}`);
    } else {
      throw err;
    }
  }

  return result;
};
