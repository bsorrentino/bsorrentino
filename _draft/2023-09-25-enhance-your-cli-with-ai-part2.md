---
layout: post
title:  "Enhance your CLI with AI (Part 2)"
date:   2023-10-02
categories: ai
---

## Quick Recap of Part 1

In the first part of our series, we delved deep into the potential of AI-powered Command Line Interfaces (CLI). With the capabilities of Large Language Models like [GPT 3/4][GPT] in combination with [OpenAI's function calling][open_ai_functions] feature and [Langchain] framework, we have developed a CLI able to interpreter system commands expressed in natural language and executed them on the specific system environment.  
  
### The Key takeaways from Part 1 included:

1. The potential of AI-powered CLI to enhance productivity by providing appropriate command line instructions based on natural language queries.
2. The [Langchain] Framework offers standardized components and abstractions for developing data-aware applications.
3. The [OpenAI function Agent][openai_functions_agent] can comprehend function calls and generate necessary inputs using LLM models like [GPT 3/4][GPT].

## Add Custom Command CLI

As promised, in this article we're gonna dive deeper and explore how to add your own custom command line commands invocable using natural language requests. Imagine building your very own CLI shortcuts and commands that make your workflow smoother.

> The **challenge** here is to enable adding of new Custom Command dynamically without to be forced to add it within the original CLI project

## The proposed solution

The solution is to load langchain Tools managed by OpenAI function Agent using the [javascript Dynamic Module Loading][import] feature

### What is a Dynamic Module Loading in JavaScript ?

[Dynamic Module Loading][import] is a powerful feature in JavaScript, enabling developers to load modules at runtime rather than at the initial load. This means you can conditionally or on-demand load certain parts of your code, making applications more efficient and faster. This feature can be particularly useful for our CLI application, allowing us to add custom commands without having to restart or recompile the entire application.

### Put each Agent Tool in a separate module

Let’s examine how to organise Agent Tool modules

#### What is an Agent Tool

First let’s remember that the Langchain Agent tools simplify the Request-to-Action process by using natural language requests to create and execute custom commands thanks to [OpenAI's function calling][open_ai_functions] feature. This feature identifies functions and associated arguments from user queries.

Translated into programming language an Agent Tool is essentially a class that provide to [LLM]:

- An Identifier (`name`)
- Its main purpose (`description`)
- Required arguments (`schema`)

Moreover it encapsulate the logic to execute the command (`_call`) when [LLM] recognised a function from user query that match with Tool’s purpose.

#### Let create a Javascript Agent Tool module

Creating a JavaScript module is easy: Just create a JavaScript file containing a class that extends `StructuredTool`<`ZodSchema`>`{}` where `ZodSchema` is an object exported by the [Zod library][zod], a powerful and flexible JavaScript library for defining and validating schemas. [Langchain] has chosen [Zod] to define function calling schemas.

#### Example of a Javascript Agent Tool Module

Below an example of a Javascript Agent Tool that unpacks a  Dataverse Solution ZIP file to a folder using Power Platform Commmand Line Interface (PAC):

```typescript
/** 
 * Schema for the unpack tool arguments.
 * 
 * @typedef {Object} UnpackSchema
 * 
 * @property {string} file - The path to the ZIP file to unpack.
 * @property {string} folder - The path to unpack the contents to.
 */
const UnpackSchema = z.object({
  file: z.string().describe("the solution file name"),
  folder: z.string().describe("the target solution folder name"), 
});

/**
 * Langchain Tool 
 * Unpacks a Dataverse solution ZIP file into a folder.
 * 
 * sample prompts:
 * - unpack solution "solution_export.zip" from "/tmp" to WORKSPACES folder in home directory
 * 
 * @extends {StructuredTool}
 */  
export class UnpackSolutionTool extends StructuredTool<typeof UnpackSchema> {
  
    name = "unpack_solution"
    description = "unpack dataverse solution zip file to a folder"
    schema = UnpackSchema
    
    /**
     * Unpacks dataverse solution ZIP file.
     *
     * @param {Object} arg - The tool arguments.
     * @param {string} arg.file - Path to the ZIP file. 
     * @param {string} arg.folder - Path to extract the contents to.
     * @returns {Promise<string>} A confirmation message.
     */
    async _call(arg: z.output<typeof UnpackSchema>): Promise<string> {
      console.debug( "Unpack Solution:", arg)

      const { file, folder } = arg

      const solution = path.join( folder, path.basename(file, '.zip'))
   
      const code = await runCommand(`pac solution unpack --zipfile "${file}" --folder "${solution}" --allowDelete`)
      
      return `unpack executed! ${solution}`
  
    }
  }

// export the instance of Tool class
export default new UnpackSolutionTool()
```


### Dynamic load Agent Tool modules

To load dynamically the Agent Tool modules we need to scan folder designed to contains extension modules searching for each javascript file then import them using Dynamic Module Loading as shown in code below

```typescript
const scanFolderAndImportPackage = async (folderPath: string) => {
    // Ensure the path is absolute
    if (!path.isAbsolute(folderPath)) {
      folderPath = path.join(__dirname, folderPath);
  }

  // Check if directory exists
  const stats = await statAsync(folderPath);
  if (!stats.isDirectory()) {
      throw new Error('Provided path either does not exist or is not a directory.');
  }

  // Read directory
  const files = await readdirAsync(folderPath);

  // Filter only .js files and dynamically require them
  const modules = files
      .filter(file => path.extname(file) === '.js')
      .map(file => import(path.join(folderPath, file)));
  
  return Promise.all(modules);
}
```

The `scanFolderAndImportPackage` function takes a folder path as input and imports all the JavaScript files in that folder uses [dynamic import()][import] and returns a Promise resolving to an array of the imported modules.

After resolved the modules we pass Tool instances to [Langchain Agent][langchain_agents] and as consequence we instruct [LLM] about new command to process at runtime.


```typescript
    
// sscan folder and import modules
const modules = await scanFolderAndImportPackage( 'commands');

// load any valid tools from imported modules
const loadedTools = modules
                    .map( m => m?.default )
                    .filter( m => m && m.name && m.description && m.schema )

// collect all available tools      
const tools = [ 
      new SystemCommandTool(),
      ...loadedTools
     ];
  
// setup the agent
const agent = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "openai-functions"
    });
```

et voila! We have now dynamically loaded our custom Agent Tool modules and initialized the Langchain Agent with the tools to enable function calling capabilities. The user can now interact with the CLI using natural language prompts to invoke these custom commands.

user : Here are a few examples:
```
> unpack solution "solution_export.zip" from "/tmp" to WORKSPACES folder in home directory
```

what is incredible is that lang chai Agent is able to create a command pipeline based on the natural language request. Let's break down the request:

```
> unpack solution "solution_export.zip" from "/tmp" to WORKSPACES folder in home directory and delete it after completion
```

## Conclusion

In conclusion, we have explored the potential of an AI-powered Command Line Interface (CLI) to enhance our productivity. By leveraging the Langchain Framework and OpenAI's function calling features, we can streamline our workflows and save time. We have learned about the benefits of incorporating custom CLI commands using natural language requests, allowing us to personalize and improve our CLI experience. With the JavaScript Dynamic Module Loading feature, we can dynamically add new commands without the need to restart or recompile our entire application. Overall, this article has shown us how AI can revolutionize our CLI experience and boost our efficiency as developers.


[LLM]: https://en.wikipedia.org/wiki/Large_language_model
[GPT]: https://en.wikipedia.org/wiki/GPT-3
[GPT4]: https://en.wikipedia.org/wiki/GPT-4
[ReACT]: https://www.promptingguide.ai/techniques/react
[langchain]: https://docs.langchain.com/docs/
[langchain.js]: https://js.langchain.com/docs/get_started/introduction/
[LangSmith]: https://smith.langchain.com
[OpenAI]: https://openai.com
[project]: https://github.com/bsorrentino/copilot-cli-agent
[openai_functions_agent]: https://js.langchain.com/docs/modules/agents/agent_types/openai_functions_agent
[open_ai_functions]: https://platform.openai.com/docs/guides/gpt/function-calling
[langchain_agents]: https://docs.langchain.com/docs/components/agents/
[zod]: https://zod.dev/
[import]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import