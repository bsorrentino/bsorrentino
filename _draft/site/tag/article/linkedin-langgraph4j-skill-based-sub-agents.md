I just published a new article about building skill-based sub-agents with LangGraph4j and Spring AI.

The core idea is simple: a `SKILL.md` file should not be only prompt text. It can become an executable, tool-backed sub-agent.

In the article I show how LangGraph4j can turn a skill into:

* a dedicated ReAct sub-agent
* a Spring AI tool exposed to a parent agent
* a scoped execution unit with its own allowed tools

This pattern helps keep multi-agent systems modular: the parent agent only needs to know when to call a specialized capability, while each sub-agent owns its instructions, tools, and execution logic.

It is especially useful when a single general-purpose agent starts becoming too large, too expensive in context, or too difficult to evolve.

Article:
https://dev.to/bsorrentino/skill-based-sub-agents-with-langgraph4j-and-spring-ai-52b0

#LangGraph4j #SpringAI #Java #AI #Agents #MultiAgent
