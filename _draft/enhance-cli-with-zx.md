# Enhance CLI with ZX

As developer, usage of Command Line Interface (CLI) based tools are becoming more and more important in day by day works, especially now that devops practices is a first-citizen in development world.

In my day by day work I use a lot of cli either for interactive use and for batch processing to accomplish various and different tasks

In this article i'd like to focus on os-independent CLI development using nodejs and in particular "how to enhance a pre-existent CLI" using [ZX] an amazing package provided by google.

## ZX project 

[ZX] describes itself as **A tool for writing better scripts** and below there is its description pick upped from the site:

>Bash is great, but when it comes to writing scripts, people usually choose a more convenient programming language. JavaScript is a perfect choice, but standard Node.js library requires additional hassle before using. The zx package provides useful wrappers around child_process, escapes arguments and gives sensible defaults.

### The '$' command

Th `$`command executes a given string using the [spawn] function from the [child_process] package and returns

### Built in functions

[ZX] comes with a list of built in functions useful to develop effective CLI and/or interactive. Below the complete list

function | description
--- | ---
`cd()` | Changes the current working directory.
`fetch()` | A wrapper around the [node-fetch] package.
`question()` | A wrapper around the [readline] package.
`sleep()`| A wrapper around the `setTimeout` function.
`nothrow()`| Changes behavior of `$` to not throw an exception on non-zero exit codes.
`quiet()` | Changes behavior of `$` to disable verbose output.

### Built in packages

[ZX] comes with a list of built in packages useful to develop effective CLI and/or interactive. Below the complete list

  packages | description
 --- | ---
[chalk](https://www.npmjs.com/package/chalk) | Colorize output
[yaml](https://www.npmjs.com/package/yaml) | Parse/Serialize [yaml]
[fs-extra](https://www.npmjs.com/package/fs-extra) | File System utility
[globby](https://www.npmjs.com/package/globby) | User-friendly [glob] matching
[minimist](https://www.npmjs.com/package/minimist) | Argument options parser
[witch](https://www.npmjs.com/package/witch) | require/resolve for binaries

## References

* [How to Write Shell Scripts in Node with Google’s zx Library](https://www.sitepoint.com/google-zx-write-node-shell-scripts/)

[ZX]:  https://www.npmjs.com/package/zx
[yaml]: https://yaml.org/spec/history/2001-12-10.html
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[node-fetch]: https://www.npmjs.com/package/node-fetch
[readline]: https://nodejs.org/api/readline.html
[child_process]: https://nodejs.org/api/child_process.html
[spawn]: https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
