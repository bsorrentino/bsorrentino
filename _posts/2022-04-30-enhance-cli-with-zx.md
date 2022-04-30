---
layout: post
title:  "Enhance a CLI with ZX"
date:   2022-04-30 17:00:00 +0200
description: How to enhance a pre-existent CLI in Node with Google’s ZX Library
categories: NodeJS
---

# The importance of CLI usage

As developer, usage of Command Line Interface (CLI) based tools are becoming more and more important in day by day work, especially now that devops practices is a first-citizen in development world.

In my day by day work I use a lot of CLI either for interactive use and for batch processing to accomplish various and different tasks

In this article i'd like to focus on os-independent CLI development using [NodeJS] and in particular "**how to enhance a pre-existent CLI**" using [ZX] an amazing package provided by Google.

Firstly a brief introduction to [ZX] project

## The ZX project

[ZX] describes itself as **A tool for writing better scripts** and below there is its description pick upped from the site:

>Bash is great, but when it comes to writing scripts, people usually choose a more convenient programming language. JavaScript is a perfect choice, but standard Node.js library requires additional hassle before using. The zx package provides useful wrappers around child_process, escapes arguments and gives sensible defaults.

### The '$' command

Th `$`command executes a given string using the [spawn] function from the [child_process] package and returns

### Built in functions

[ZX] comes with a list of built in functions useful to develop effective and/or interactive CLI . Below the complete list

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

----

As you can see [ZX] bring a lot of standard-de-facto packages and provides utilities focused on accomplish main CLI needs.
For this reason I chose it not only to develop new CLI but also to enrich the existent ones give them more interactivity and implementing common use-cases/workflows.

## ZX - The Power Platform CLI ([PAC]) Use Cases

Lately I actively work with [Power Platform] a Microsoft's low-code platform that **for managing its ALM has delivered a powerful CLI ([PAC])** and since I need very often to export/import [Power Platform] solutions to/from a git repository I've decided to enhance the [PAC] CLI using [ZX] developing a new CLI [zx-powerapps-cli] that implememts the complete workflows involving such tasks.
The goal here is not go in deep of Power Platform CLI but give you an idea of how I've used [ZX] to enhance and simplify its usage.
Below the description of main steps that involving import/export tasks that I've implemented using [ZX].

### Export Solution

1. Authenticate against the platform environment
1. choose solution to export
  > deciding if it should be exported as a Managed or Unmanaged Solution
1. _Optionally_ publish all customization
1. Export solution from platform environment
1. Unpack Solution once exported to local git repository

### Import Solution

1. Authenticate against the platform environment
1. choose local solution folder to import
1. Packing Solution
   > deciding if it should be packed as a Managed or Unmanaged Solution
1. Import Packed Solution to platform environment

As you can see there are several steps and I wanted to ask the user to provide the requested information and confirmation for the optional steps.
So I have used the [ZX] `$` to execute the commands behind-the-scene and `question` for ask info or confirmation, moreover just-in-case, I've also provided command line arguments to skip asking for.

Below some function that I've develop to enrich [PAC] to give you an idea on how is simple use [ZX] to enhance (or implement) a CLI

#### Select Authentication Profile

In this example we use the [PAC AUTH] subcommand to `list` available authentication profiles and/or `select` one of them

```javascript
export const askForAuthProfile = async () => {
    // Since 'minimist' is integrated a 'argv' is available out-of-box
    if( argv.authindex ) {
      // If a 'authindex' is provided as argument
      // select the given authentication profile
      await $`pac auth select --index ${argv.authindex}`     
      return
    }
    // list all available authentication profile  
    await $`pac auth list`
    // interactively ask for a profile
    const choice = await question('choose profile index (enter for confirm active one): ')
    // select the given authentication profile    
    await $`pac auth select --index ${choice}`
}
```

#### Select Solution Folder

In this example we use the [fs-extra] and [chalk] built-in packages for asking a valid solution folder

```JavaScript
export const askForSolutionFolder = async () => {
    let solution
    // Since 'minimist' is integrated a 'argv' is available out-of-box
    if( argv.solution ) {
      // If a 'solution' is provided as argument use it
      solution = argv.solution
    }
    else {
      // otherwise ask for it
      solution = await question('solution folder: ')
    }

    // Since 'fs-extra' and 'chalk' are integrated 'fs' and 'chalk' are available out-of-box
    try {
        // Folder validation
        const stats = await fs.stat( solution )
        if( stats.isDirectory() )
            return solution

        console.log( chalk.red(`solution folder '${solution}' is not a directory!`))            
    }
    catch( e ) {
        console.log( chalk.red(`solution folder '${solution}' doesn't exist!`))
    }
}

```

#### Import a Solution in a Power Platform (Cloud) Environment

In this example we put all together providing a complete import workflow. We reuse the functions above and the [PAC SOLUTION] subcommand to `pack`ing and `import`ing solution into remote environment related to the selected authentication profile

```javascript
try {

    await askForAuthProfile()

    const solution = await askForSolutionFolder()

    // import Solution as 'Managed' into selected profile
    await $`pac solution pack --zipfile /tmp/${solution}_managed.zip -f ${solution} -p Managed -aw`  
    await $`pac solution import -p /tmp/${solution}_managed.zip -f -pc -a`        

} catch (p) {
    if (p.exitCode)
        console.log(`error occurred code: ${p.exitCode} error: ${p.stderr}`)
    else
        console.error(p)
}

```

# Conclusion

I consider [ZX] a good solution to implement or enhance multi-platform CLI based upon [NodeJS].

If you are interested in implementation detail the code is on [Github](https://github.com/bsorrentino/zx-powerapps-cli)  

I Hope that such article could help if you are dealing with CLI developing or enhancing. in the meanwhile happy coding and … enjoy [ZX]! 👋

# References

* [How to Write Shell Scripts in Node with Google’s ZX Library](https://www.sitepoint.com/google-zx-write-node-shell-scripts/)

[NodeJS]: https://nodejs.org/en/
[ZX]:  https://www.npmjs.com/package/zx
[yaml]: https://yaml.org/spec/history/2001-12-10.html
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[node-fetch]: https://www.npmjs.com/package/node-fetch
[readline]: https://nodejs.org/api/readline.html
[child_process]: https://nodejs.org/api/child_process.html
[spawn]: https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
[Power Platform]: https://powerplatform.microsoft.com/en-us/
[PAC]: https://docs.microsoft.com/en-us/power-apps/developer/data-platform/powerapps-cli#common-commands
[PAC AUTH]: https://docs.microsoft.com/en-us/power-apps/developer/data-platform/cli/reference/auth-command
[PAC SOLUTION]: https://docs.microsoft.com/en-us/power-apps/developer/data-platform/cli/reference/solution-command
[zx-powerapps-cli]: https://www.npmjs.com/package/@bsorrentino/zx-powerapps-cli
