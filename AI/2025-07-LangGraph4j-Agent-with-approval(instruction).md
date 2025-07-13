I would write an article about "how to implements Human-in-the-loop using langgraph4j library", in particular i would like focus on how to evolve the classical Agent executor (aka ReACT Agent) implementation (refers to @langchain4j/langchain4j-agent/src/main/java/org/bsc/langgraph4j/agentexecutor/AgentExecutor.java) to support human approval before an action (refers to @langchain4j/langchain4j-agent/src/main/java/org/bsc/langgraph4j/agentexecutor/AgentExecutorEx.java). 

Key takeways

- How to evolve classical Agent Executor implementation (refer to Diagram1) to support human approval flow
    1. move from standard agent loop to extended agent loop supporting action dispatcher and a node for each action (refers to Diagram2)
    2. wrap action with an approval node (refers to Diagram3)
- An implementation example using langgraph4j and langchain4j (refers to @langchain4j/langchain4j-agent/src/test/java/org/bsc/langgraph4j/agentexecutor/app/DemoConsoleController.java). I need details on "A Practical Example" with adding of code snippets focusing on usage of @langgraph4j-core/src/main/java/org/bsc/langgraph4j/action/InterruptionMetadata.java usage that is explained in @src/site/mkdocs/core/low_level.md in the breakpoints section

## diagram1
```mermaid
---
title: classical ReAct Agent
---
flowchart TD
	__START__((start))
	__END__((stop))
	agent("agent")
	action("actions
    (tools)")
	__START__:::__START__ --> agent:::agent
	agent:::agent -.->|continue| action:::action
	agent:::agent -.->|end| __END__:::__END__
	action:::action --> agent:::agent
```    

## Diagram2
```mermaid
---
title: ReAct Agent with action dispatcher
---
flowchart TD
	__START__((start))
	__END__((stop))
	model("model")
	action_dispatcher("action_dispatcher")
	threadCount("action1
    (tool1)")
	execTest("action2
    (tool2)")
	__START__:::__START__ --> model:::model
	model:::model -.->|continue| action_dispatcher:::action_dispatcher
	model:::model -.->|end| __END__:::__END__
	threadCount:::threadCount --> action_dispatcher:::action_dispatcher
	execTest:::execTest --> action_dispatcher:::action_dispatcher
	action_dispatcher:::action_dispatcher -.-> model:::model
	action_dispatcher:::action_dispatcher -.-> __END__:::__END__
	action_dispatcher:::action_dispatcher -.-> threadCount:::threadCount
	action_dispatcher:::action_dispatcher -.-> execTest:::execTest


``` 

## Diagram3
```mermaid
---
title: ReAct Agent with approval workflow
---
flowchart TD
	__START__((start))
	__END__((stop))
	model("model")
	action_dispatcher("action_dispatcher")
	threadCount("action1
    (tool1)")
	approval_execTest("approval_action2")
	execTest("action2
    (tool2)")
	__START__:::__START__ --> model:::model
    action_dispatcher:::action_dispatcher
	model:::model -.->|continue| action_dispatcher:::action_dispatcher
	model:::model -.->|end| __END__:::__END__
	threadCount:::threadCount --> action_dispatcher:::action_dispatcher
	approval_execTest:::approval_execTest -.->|REJECTED| model:::model
    execTest:::execTest
	approval_execTest:::approval_execTest -.->|APPROVED| execTest:::execTest
	execTest:::execTest --> action_dispatcher:::action_dispatcher
	action_dispatcher:::action_dispatcher -.-> model:::model
	action_dispatcher:::action_dispatcher -.-> __END__:::__END__
	action_dispatcher:::action_dispatcher -.-> threadCount:::threadCount
	approval_execTest:::approval_execTest
	action_dispatcher:::action_dispatcher -.-> approval_execTest:::approval_execTest


``` 