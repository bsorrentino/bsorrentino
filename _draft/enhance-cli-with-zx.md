# Enhance CLI with ZX

As developer, usage of Command Line Interface (CLI) based tools are becoming more and more important in day by day works, especially now that devops practices is a first-citizen in development world.

In my day by day work I use a lot of cli either for interactive use and for batch processing to accomplish various and different tasks

In this article i'd like to focus on os-independent CLI development using [NodeJS] and in particular "**how to enhance a pre-existent CLI**" using [ZX] an amazing package provided by google.

Firstly a brief introduction to [ZX] project

### The ZX project

[ZX] describes itself as **A tool for writing better scripts** and below there is its description pick upped from the site:

>Bash is great, but when it comes to writing scripts, people usually choose a more convenient programming language. JavaScript is a perfect choice, but standard Node.js library requires additional hassle before using. The zx package provides useful wrappers around child_process, escapes arguments and gives sensible defaults.

#### The '$' command

Th `$`command executes a given string using the [spawn] function from the [child_process] package and returns

#### Built in functions

[ZX] comes with a list of built in functions useful to develop effective CLI and/or interactive. Below the complete list

function | description
--- | ---
`cd()` | Changes the current working directory.
`fetch()` | A wrapper around the [node-fetch] package.
`question()` | A wrapper around the [readline] package.
`sleep()`| A wrapper around the `setTimeout` function.
`nothrow()`| Changes behavior of `$` to not throw an exception on non-zero exit codes.
`quiet()` | Changes behavior of `$` to disable verbose output.

#### Built in packages

[ZX] comes with a list of built in packages useful to develop effective CLI and/or interactive. Below the complete list

  packages | description
 --- | ---
[chalk](https://www.npmjs.com/package/chalk) | Colorize output
[yaml](https://www.npmjs.com/package/yaml) | Parse/Serialize [yaml]
[fs-extra](https://www.npmjs.com/package/fs-extra) | File System utility
[globby](https://www.npmjs.com/package/globby) | User-friendly [glob] matching
[minimist](https://www.npmjs.com/package/minimist) | Argument options parser
[witch](https://www.npmjs.com/package/witch) | require/resolve for binaries

----

As you can see [ZX] bring a lot of standard-de-facto packages and provides utilities focused on accomplish main CLI needs.
For this reason I choosen it not only to develop new CLI but also to enrich the existent ones give them more interactivity and implementing common use cases.

### ZX - The Power Platform Use Case

Lately I actively work with [Power Platform] a Microsoft's low-code platform that for managing its ALM has delivered a powerful [CLI](https://docs.microsoft.com/en-us/power-apps/developer/data-platform/powerapps-cli#common-commands).
The goal here is not go in deep of Power Platform CLI but give you an idea of how I've used [ZX] to enhance and simplify its usage. The problem is that I need very often to export/import [Power Platform] solutions to/from a git repository and for performing such tasks I need to do the following steps:

#### Export Solution

1. Authenticate meself against platform environment
1. choose solution to export
  > deciding if it should be exported as a Managed or Unmanaged Solution
1. _Optionally_ publish all customization
1. Export solution from platform environment
1. Unpack Solution once exported on local file system

#### Import Solution

1. Authenticate meself against platform environment
1. choose local solution folder to import
1. Pack Solution
   > deciding if it should be packed as a Managed or Unmanaged Solution
1. Import Packed Solution to platform environment

## References

* [How to Write Shell Scripts in Node with Google’s zx Library](https://www.sitepoint.com/google-zx-write-node-shell-scripts/)

[NodeJS]: https://nodejs.org/en/
[ZX]:  https://www.npmjs.com/package/zx
[yaml]: https://yaml.org/spec/history/2001-12-10.html
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[node-fetch]: https://www.npmjs.com/package/node-fetch
[readline]: https://nodejs.org/api/readline.html
[child_process]: https://nodejs.org/api/child_process.html
[spawn]: https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
[Power Platform]: https://powerplatform.microsoft.com/en-us/
