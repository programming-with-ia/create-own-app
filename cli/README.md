<p align="center">
  <a href="https://create-own-app.vercel.app/">
    <img src="https://raw.githubusercontent.com/programming-with-ia/public-files/0e77acf319696f37be023fe5134f174f319f0700/create-own-app/assets/create-own-app-logo.png" width="130" alt="own app">
  </a>
</p>

<h1 align="center">
  create-own-app
</h1>

## [Docs](https://create-own-app.vercel.app/)
visit: [create-own-app](https://create-own-app.vercel.app/)

## Installation

To get started with the project, run the following command to scaffold a new app:

```bash
npm create own-app@latest
```

```bash
pnpm create own-app@latest
```

```bash
yarn create own-app@latest
```

```bash
bun create own-app@latest
```

## Introduction

The foundation of the stack consists of [Next.js](https://nextjs.org) for building optimized applications and [TypeScript](https://www.typescriptlang.org) for enhanced development with type safety. [Tailwind CSS](https://tailwindcss.com)/[Shadcn](https://ui.shadcn.dev) is typically included for rapid, responsive design.

For backend development, consider adding:

- [tRPC](https://trpc.io) for seamless TypeScript integration.
- [Prisma](https://www.prisma.io) for efficient database interaction.
- [NextAuth.js](https://next-auth.js.org) for flexible authentication solutions.

---

## CI Flags

For our CI (Continuous Integration) setup, we offer experimental flags that allow you to scaffold an app without any interactive prompts. These flags are useful for automating the setup process.

**Note:** These flags are experimental and may change in future versions without following semantic versioning.

| **Flag**                  | **Description**                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| `[dir]`                   | Specify the project directory name.                                       |
| `-y, --default`           | Bypass prompts and scaffold with all [default options](#default-options). |
| `--trpc`                  | Add tRPC for type-safe API communication.                                 |
| `--prisma`                | Include Prisma ORM for type-safe database access.                         |
| `--drizzle`               | Include Drizzle ORM for modern database management.                       |
| `--nextAuth`              | Add NextAuth.js for flexible authentication solutions.                    |
| `--tailwind`              | Include Tailwind CSS for utility-first styling.                           |
| `--dbProvider [provider]` | Configure a database provider for the project.                            |
| `--appRouter`             | Use Next.js App Router for routing.                                       |
| `--noGit`                 | Skip initializing a Git repository for the project.                       |
| `--noInstall`             | Generate the project without installing dependencies.                     |

## Inspirations / Thanks

Special thanks to [t3-oss](https://github.com/t3-oss) for creating [create-t3-app](https://github.com/t3-oss/create-t3-app).
