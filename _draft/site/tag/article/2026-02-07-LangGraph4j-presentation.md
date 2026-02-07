## 🚀 **Why LangGraph4j**

While ago when I started to involve myself in AI world  I choose for experimenting development of LLM powered apps using the powerful python library [LangChain] that was one of the first library enabling work effectively with the LLM using chain of responsibility approach.
When on the jan 2024, [langchain has announced LangGraph](https://blog.langchain.dev/langgraph/) a module built on top of LangChain enabling creation of cyclical graphs needed for agent runtimes I understood that that was the right way to develop Agent in a controlled and safe way. 

Since I work with companies which IT department is mainly based on Java technology and they would want explore and experiment LLM in their application, I've choose to use either [LangChain4j]/[Spring AI] frameworks and, as consequence,  I've decided to develop [LangGraph4j] to reuse, my knowledge around both [LangGraph] and [LangChain] to promote my preferred approach "Learn once apply everywhere"

So **LangGraph4j** is inspired by [LangGraph] and the goal was to bring this powerful framework to the Java ecosystem, enabling Java developers to build sophisticated AI-powered agents and applications. It's designed to work seamlessly with established Java LLM frameworks like [Langchain4j] and [Spring AI].

## 🔧 **How It Works**

LangGraph4j allows you to build **stateful, multi-agent applications** by defining cyclical graphs where different components (agents, tools, or custom logic) interact with a shared state. 

### ⭐ **Key Features**

1. **Stateful Execution** - Manage shared state across graph nodes for memory and context awareness
1. **Checkpoints**: Save and replay graph state at any point allow to implement long running workflow useful to implement Human In The Loop (HITL)
1. **Cyclical Graphs** - Support for loops needed in real agent-based architectures
1. **Explicit Control Flow** - Clear, definable paths and transitions
1. **Modularity** - Build complex systems from reusable Graphs ( i.e.  SubGraph )
1. **Flexibility** - Integrate with various LLM providers and custom Java logic
1. **Observability & Debugging** - Use hooks as interception points around node and edge execution. This is the ideal place to add logging, metrics, or traces without contaminating business logic.

## 🔗 **How to Get Involved**

- **Documentation**: Visit the [official documentation](https://langgraph4j.github.io/langgraph4j/)
- **DeepWiki**: Check out the community docs on [DeepWiki](https://deepwiki.com/langgraph4j/langgraph4j)
- **Latest Release**: Version `1.8.0` (Feb 2, 2026)
- **Requirements**: Minimum Java 17 supported
- **Community**: Join the [Discord community](https://discord.gg/szVVztSYKh)
- **Repository**: [GitHub - langgraph4j/langgraph4j](https://github.com/langgraph4j/langgraph4j)
- **Maven Central**: Available on [Maven Central](https://central.sonatype.com/)
- **License**: MIT - Open for contributions





[LangChain]: https://github.com/langchain-ai
[LangChain4j]: https://github.com/langchain4j
[LangGraph4j]: https://github.com/bsorrentino/langgraph4j
[Spring AI]: https://spring.io/projects/spring-ai