## 🚀 Why LangGraph4j

A while ago, when I started working in AI, I chose [LangChain] to build LLM-powered apps because it made introduce LLM into applications practical and effective. Then, in January 2024, [LangChain announced LangGraph](https://blog.langchain.dev/langgraph/): a module built on top of LangChain that enables cyclical graphs for real-world agent runtimes. That was the missing piece for building agents in a controlled and safe way.

I work with teams whose IT stack is mainly Java, and they want to experiment with LLMs in production-grade systems. That’s why I built **[LangGraph4j]**: to bring the LangGraph approach to the Java ecosystem, leverage my experience with LangChain and LangGraph, and deliver on a simple promise: "**learn once, apply everywhere**".

**LangGraph4j** is inspired by [LangGraph] and designed to help Java developers build sophisticated AI-powered agents and applications. It integrates cleanly with established Java LLM frameworks like [LangChain4j] and [Spring AI].

### What you get

- **Controlled execution** with explicit graph paths and safe loops
- **Parity with LangGraph concepts**, without leaving the Java ecosystem
- **Drop-in integration** with Java LLM frameworks and existing codebases

## 🔧 How It Works

LangGraph4j allows you to build **stateful, multi-agent applications** by defining cyclical graphs where different components (agents, tools, or custom logic) interact with a shared state. 

### ⭐ **Key Features**

**Core Graph Model**
- **Stateful Execution** - Manage shared state across graph nodes for memory and context awareness
- **Cyclical Graphs** - Support for loops needed in real agent-based architectures
- **Explicit Control Flow** - Clear, definable paths and transitions

**Reliability & Long-Running Workflows**
- **Checkpoints** - Save and replay graph state at any point, enabling long-running workflows and Human-in-the-Loop (HITL)

**Integration & Modularity**
- **Modularity** - Build complex systems from reusable graphs (for example, a SubGraph)
- **Flexibility** - Integrate with various LLM providers and custom Java logic

**Observability**
- **Observability & Debugging** - Use hooks as interception points around node and edge execution to add logging, metrics, or traces without contaminating business logic

## 🔗 **How to Get Involved**

**Start here**: try the Quickstart in the docs and run your first graph in minutes.

- **Documentation**: Visit the [official documentation](https://langgraph4j.github.io/langgraph4j/)
- **DeepWiki**: Check out the community docs on [DeepWiki](https://deepwiki.com/langgraph4j/langgraph4j)
- **Latest Releases**: [Check the GitHub releases page](https://github.com/langgraph4j/langgraph4j/releases)
- **Requirements**: Minimum Java 17 supported
- **Community**: Join the [Discord community](https://discord.gg/szVVztSYKh)
- **Github Repository**: [langgraph4j/langgraph4j](https://github.com/langgraph4j/langgraph4j)
- **Maven Central**: Available on [Maven Central](https://central.sonatype.com/)
- **License**: MIT - Open for contributions

## Conclusion

f you're intrigued by this project and want to support me in putting effort into this development journey, checkout the project, try it out, and let me know your feedback. Don't forget to star it ⭐️🙏!
In the meantime, happy AI coding 👋



[LangChain]: https://github.com/langchain-ai
[LangChain4j]: https://github.com/langchain4j
[LangGraph4j]: https://github.com/bsorrentino/langgraph4j
[Spring AI]: https://spring.io/projects/spring-ai
