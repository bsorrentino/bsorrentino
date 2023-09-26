
# Enhance your CLI with AI (Part 2)

## Quick Recap of Part 1

In the first part of our series, we delved deep into the potential of AI-powered Command Line Interfaces (CLI). With the capabilities of Large Language Models like GPT 3.5/4 in combination with OpenAI's function calling feature and Langchain framework, we have developed a CLI able to interpreter system commands expressed in natural language and executed them on the specific system environment.

## Add Custom Command CLI

As promised in this article we're gonna dive deeper and explore how to add your own custom command line commands invocable using natural language request. Imagine building your very own CLI shortcuts and commands that make your workflow smoother. 

The challenge here is to enable adding of new Custom Command dynamically without to be forced to add it within the original CLI project 

## The proposed solution

The solution is to load langchain Tools managed by OpenAI function Agent using the javascript Dynamic Module Loading  feature

### What is a Dynamic Module Loading in JavaScript ?

Dynamic Module Loading is a powerful feature in JavaScript, enabling developers to load modules at runtime rather than at the initial load. This means you can conditionally or on-demand load certain parts of your code, making applications more efficient and faster. This feature can be particularly useful for our CLI application, allowing us to add custom commands without having to restart or recompile the entire application.

### Put each Agent Tool in a separate module

The scanFolderAndImportPackage async function takes a folder path as input and imports all the JavaScript files in that folder dynamically.

It first makes the path absolute if it isn't already. Then it checks that the path exists and is a directory.

It reads the directory contents, filters to only .js files, and uses dynamic import() to import each file as a module.

The Promise.all() call waits for all imports to complete before returning an array of the imported modules.

So in summary, this scans a folder, imports all the .js files in it, and returns a Promise resolving to an array of the imported modules. It allows dynamically importing a folder of modules.

```javascript
const scanFolderAndImportPackage = async (folderPath: string) => {
    // Ensure the path is absolute
    if (!path.isAbsolute(folderPath)) {
      folderPath = path.join(__dirname, folderPath);
  }

  console.debug( 'scan folder', folderPath )

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

```javascript
const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo-0613", temperature: 0});

const tools = [ new SystemCommandTool() ];

const agent = await initializeAgentExecutorWithOptions(tools, model, 
                                                        { agentType: "openai-functions" } );
```

```javascript

class SystemCommandTool extends Tool {

    name ="system_cmd"
    description = "all system commands" // description instruct LLM on Tool's purpose

    protected async _call(arg: any): Promise<string> {

        console.debug( "System Command:", arg)

        const code = await runCommand( arg ) // exec command in target environment

        return `command executed: ${code ?? ''}`

    }
}
```


....

## Wrap Up

In this part, we explored the potential of dynamic module loading in JavaScript and how it can be employed to enhance our CLI application. This capability not only improves the efficiency of the application but also offers a seamless way to extend its functionalities.

## Conclusion

With the combined power of AI and dynamic module loading, we are paving the way for more versatile and efficient CLIs. The future holds immense possibilities, and we're just scratching the surface. Stay tuned for more advancements in this exciting journey!
