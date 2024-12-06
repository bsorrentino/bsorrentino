---
layout: post
title:  Develop an AI Agents on Java with LangGraph4j - Lesson 1
date:   2024-05-20
description: "Brings the power of LangGraph, for multi-agent LLM application with LLMs, to the Java language."
categories: ai

---
![cover]
<br>


##  Why use Langgraph4j ?

As said Langgraph4j is heavly inspired by Langgraph.js and essentilly the benefits are the same  
In the previous article [AI Agent on iOS with LangGraph for Swift][article1] I've introduced [LangGraph-Swift] an implementation of [LangGraph] a library, powered by [LangChain] for building stateful, multi-agent applications with LLMs that lets you coordinate and checkpoint multiple chains across cyclic computational steps using regular `python` or `Javascript` functions. 

As said, I developed [LangGraph-Swift] to reuse my knowledege around [LangGraph] and [LangChain] for building 
[LangChain] iOS apps powered by LLM.

## Why LangGraph for Java ❓

Since I work with companies which IT department is mainly based on Java technology and they would want explore and experiment LLM in their application, I've choose to use [LangChain4j] framework and, as consequence,  I've decided to develop [LangGraph4j] to reuse, again, my knowledge around both [LangGraph] and [LangChain].

## Use LangGraph4j with LangChain4j 

[LangGraph4j] can work seamlessly with [LangChain4j] and to proof that I've implemented a couple of use cases described below 

### Agent Executor

The agent executor is the runtime for an agent. This is what actually calls the agent, executes the actions it chooses, passes the action outputs back to the agent, and repeats. Below the diagram representing the implemented graph, for the complete code [take look here 👀][agentexecutor.code]

![Diagram01]

### Image To Diagram

I've also experimented LLM multi-modality capabilities developing a graph where, initially, an agent receives an image and is responsible for analyzing and describing its content, such description is then passed to a specialized agent equipped with the skills to translate the description into PlantUML code. 

Take note that to ensure precision in diagram generation, the type of diagram identified within the image dictates the selection of the appropriately skilled agent for the translation task.

Finally, in the case that there are errors in result of PlantUML code we have established a supplementary flow that provided a correction process consisting of iteration between both verification and rewrite steps. 
Below the diagram representing the implemented graph, for the complete code [take look here 👀][image_to_diagram.code]

![Diagram02]

## Conclusion 

[LangGraph4j] is a side project that try to brings flexibility of the original [LangGraph] to develop stateful, multi-agents applications with LLMs in Java. Currently, I haven't relased a stable version yet, only the developer one `1.0-SNAPSHOT`. Let me know if you are interest in its usage and evolution. In the meanwhile, enjoy coding! 👋 

[cover]: /bsorrentino/assets/langgraph-java/langgraph4j-cover-2.png
[Diagram01]: /bsorrentino/assets/langgraph-java/agentexecutor.puml.png
[Diagram02]: /bsorrentino/assets/langgraph-java/image_to_diagram_with_correction.puml.png

[article1]: https://bsorrentino.github.io/bsorrentino/ai/2024/03/21/langgraph-for-swift.html
[LangGraph-Swift]: https://github.com/bsorrentino/LangGraph-Swift
[LangGraph]: https://python.langchain.com/docs/langgraph 
[LangChain]: https://python.langchain.com/docs/get_started/introduction
[LangChain4j]: https://github.com/langchain4j
[LangGraph4j]: https://github.com/bsorrentino/langgraph4j
[agentexecutor.code]: https://github.com/bsorrentino/langgraph4j/tree/main/agents-jdk8/src/main/java/dev/langchain4j/agentexecutor
[image_to_diagram.code]: https://github.com/bsorrentino/langgraph4j/tree/main/agents-jdk8/src/main/java/dev/langchain4j/image_to_diagram


