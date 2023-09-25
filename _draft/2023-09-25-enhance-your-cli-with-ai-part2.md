
# Enhance your CLI with AI (Part 2)

## Quick Recap of Part 1

In the first part of our series, we delved deep into the potential of AI-powered Command Line Interfaces (CLI). With the capabilities of Large Language Models like GPT 3.5/4, the CLI can be enhanced to suggest appropriate commands based on user queries. The idea of leveraging OpenAI's function calling features to integrate AI into the CLI was also introduced.

## Add Custom Command CLI

As promised in this article we're gonna dive deeper and explore how to add your own custom command line commands invocable using natural language request. Imagine building your very own CLI shortcuts and commands that make your workflow smoother. 

The challenge here is to enable adding of new Custom Command dynamically without to be forced to add it within the original CLI project 

## The proposed solution

The solution is to use the Dynamic Module Loading javascript feature

### What is a Dynamic Module Loading in JavaScript ?

Dynamic Module Loading is a powerful feature in JavaScript, enabling developers to load modules at runtime rather than at the initial load. This means you can conditionally or on-demand load certain parts of your code, making applications more efficient and faster. This feature can be particularly useful for our CLI application, allowing us to add custom commands without having to restart or recompile the entire application.

....

## Wrap Up

In this part, we explored the potential of dynamic module loading in JavaScript and how it can be employed to enhance our CLI application. This capability not only improves the efficiency of the application but also offers a seamless way to extend its functionalities.

## Conclusion

With the combined power of AI and dynamic module loading, we are paving the way for more versatile and efficient CLIs. The future holds immense possibilities, and we're just scratching the surface. Stay tuned for more advancements in this exciting journey!
