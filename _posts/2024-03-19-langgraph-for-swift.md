---
layout: post
title:  AI Agent on IOS with LangGraph for Swift
date:   2024-03-21
description: "Brings the power of LangGraph, for making cyclical graphs, to the Swift language. "
categories: ai

---
![cover](../../../../assets/langgraph-swift/langgraph-swift-cover.png)
<br>


##  LangChain from python to other languages  

[Langchain] framework (Python) has rapidly gained success in the open source community because has been one of the first to provide a structured approach (the chain) to develop LLM powered and context-aware reasoning applications. This success is also evidenced by the number of ports to other programming languages like: 

* [Langchain.js] (_developed by the same company behind langchain_) 
* [Langchain4j]
* [Langchain-swift]  


## LangGraph comes to the play 

On the jan 2024, [langchain has announced LangGraph][langgraph.blog] a module built on top of LangChain to better enable creation of cyclical graphs, often needed for agent runtimes.  
> LangGraph allows to build agents cooperation in a very simple and meaningful way enabling a new level of smart application based upon agent cooperation. 

## Why LangGraph for Swift 

Since I’m developing IOS app powered by LLM that needs Agents cooperation, I’ve decided to develop and alter-ego of original [LangGraph]  project in [Swift].

I've published a first stable version of [LangGraph for Swift][langgraph.swift] that follows the original [LangGraph] project's design as closely as possible. Like the original, [LangGraph for Swift][langgraph.swift] is meant to work together with "[LangChain for Swift][Langchain-swift]" to give AI developers a simple way to make cyclical graphs, especially for AI agents collaborations scenarios.  

 
## LangGraph for Swift and LangChain for Swift 

As said [LangGraph for Swift][langgraph.swift] is designed to work seamlessly with [LangChain for Swift][Langchain-swift], and to proof that , I’ve ported the original [AgentExecutor] from LangChain for Swift to LangGraph where We can see the versatility and the powerful of this new approach. A meaningful code summary is presented below, for the complete code [take look here 👀][AgentExecutor.new]. 

### Create a Graph instance
```Swift
let workflow = GraphState {
        AgentExecutorState()
    }
```

### Define (and add) Nodes

```Swift
try workflow.addNode("call_agent" ) { state in
    
    guard let input = state.input else {
        throw executionError("'input' argument not found in state!")
    }
    guard let intermediate_steps = state.intermediate_steps else {
        throw executionError("'intermediate_steps' property not found in state!")
    }

    let step = await agent.plan(input: input, intermediate_steps: intermediate_steps)
    switch( step ) {
    case .finish( let finish ):
        return [ "agent_outcome": AgentOutcome.finish(finish) ]
    case .action( let action ):
        return [ "agent_outcome": AgentOutcome.action(action) ]
    default:
        throw executionError( "Parsed.error" )
    }
}

try workflow.addNode("call_action" ) { state in
    
    guard let agentOutcome = state.agentOutcome else {
        throw executionError("'agent_outcome' property not found in state!")
    }
    guard case .action(let action) = agentOutcome else {
        throw executionError("'agent_outcome' is not an action!")
    }
    let result = try await toolExecutor( action )
    return [ "intermediate_steps" : (action, result) ]
}
```

### Define (and add) Edges

```Swift
try workflow.addConditionalEdge( sourceId: "call_agent", condition: { state in
    
    guard let agentOutcome = state.agentOutcome else {
        throw executionError("'agent_outcome' property not found in state!")
    }

    return switch agentOutcome {
        case .finish:
            "finish"
        case .action:
            "continue"
        }

}, edgeMapping: [
    "continue" : "call_action",
    "finish": END])

try workflow.addEdge(sourceId: "call_action", targetId: "call_agent")

```

### Compile & Run Graph

```Swift
try workflow.setEntryPoint("call_agent")

let runner = try workflow.compile()

let result = try await runner.invoke(inputs: [ "input": input, "chat_history": [] ])

print( result )
```

## Conclusion 

In conclusion, [LangGraph for Swift][langgraph.swift] is an exciting new project that brings the power and flexibility of the original [LangGraph] project to IOS platform. By working jointly with [LangChain for Swift][Langchain-swift], developers can easily create cyclical graphs and build advanced AI systems. We encourage [Swift] developers to explore this new project and contribute to its growth and development. In the meanwhile, enjoy coding! 👋 

[AgentExecutor.new]: https://github.com/bsorrentino/LangGraph-Swift/blob/main/LangChainDemo/LangChainDemo/AgentExecutor.swift
[AgentExecutor]: https://github.com/buhe/langchain-swift/blob/main/Sources/LangChain/agents/Agent.swift
[langgraph.swift]: https://github.com/bsorrentino/LangGraph-Swift
[Swift]: https://www.swift.org
[LangGraph]: https://python.langchain.com/docs/langgraph 
[langgraph.blog]: https://blog.langchain.dev/langgraph/
[langchain]: https://python.langchain.com/docs/get_started/introduction
[langchain.js]: https://js.langchain.com/docs/get_started/introduction
[Langchain4j]: https://github.com/langchain4j
[Langchain-swift]: https://github.com/buhe/langchain-swift