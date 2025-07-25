---
layout: post
title:  Implementing Pause and Resume in Agentic Flows with LangGraph-Swift
date:   2025-07-25
description: "How to implement Human-in-the-Loop in LangGraph for Swift"
categories: ai

---
![cover](../../../../assets/langgraph-swift/langgraph-swift-cover.png)
<br>
<hr>
<br>

<!-- # Implementing Pause and Resume in Agentic Flows with LangGraph-Swift -->
## Introduction

Agentic workflows often require human intervention for tasks like approval, verification, or handling exceptions. [`LangGraph-Swift`][lg4swift], a library for building stateful, multi-agent applications, provides a powerful mechanism to pause and resume these workflows, enabling seamless **Human-in-the-Loop** (HITL) scenarios. 

This article explores how to implement this functionality using the library's capabilities.

## Key Concepts

The core of [`LangGraph-Swift`][lg4swift]'s pause and resume capability are the following key components:

* **`CheckpointSaver`**: 
  > This protocol defines the interface for saving and retrieving `Checkpoint`s that hold workflow states. The library provides an in-memory implementation, `MemoryCheckpointSaver`, which is perfect for getting started.
* **`CompileConfig`**: 
   > This struct allows you to configure the compilation of your `StateGraph`, including specifying a `CheckpointSaver` and defining interruption points.
* **`RunnableConfig`**:  
   > This struct provides a way to pass configuration information to a running graph, such as a thread ID (aka Session)or a `Checkpoint` ID to resume from.
* **`GraphInput`**: 
   > This enum represents the input to a graph, which can be either initial arguments (`.args`) or a resume signal (`.resume`).

## Enabling Workflow Interruptions

To enable interruptions, you need to configure your `StateGraph` with a `CheckpointSaver` and specify the nodes before which the workflow should pause. This is done using the `CompileConfig` struct when you compile the graph.

Let's look at an example. 
> The following code snippet is based on the `testRunningWithInterruption` method in [`LangGraphTests.swift`][LangGraphTests.swift].

First, we define a simple `StateGraph` with three nodes: `agent_1`, `agent_2`, and `sum`. `agent_1` and `agent_2` provide numbers, and `sum` calculates their sum.

```swift
@Test
func testRunningWithInterruption() async throws {
    
    // Build the workflow with an initial state
    let workflow = try StateGraph { BinaryOpState($0) }
    
    // Add node "agent_1" that returns "add1": 37
    .addNode("agent_1") { state in
        return ["add1": 37]
    }
    // Add node "agent_2" that returns "add2": 10
    .addNode("agent_2") { state in
        return ["add2": 10]
    }
    // Add node "sum" that sums add1 and add2
    .addNode("sum") { state in
        return ["result": state.add1 + state.add2 ]
    }
    // Define the edges between nodes
    .addEdge(sourceId: "agent_1", targetId: "agent_2")
    .addEdge(sourceId: "agent_2", targetId: "sum")
    .addEdge( sourceId: START, targetId: "agent_1")
    .addEdge(sourceId: "sum", targetId: END )
```

Now, we compile the graph with a `CompileConfig` that specifies our `MemoryCheckpointSaver` and tells the graph to interrupt before the `sum` node.

```swift
    // Create a memory-based checkpoint saver
    let saver = MemoryCheckpointSaver()

    // Compile the workflow, instructing it to interrupt before executing "sum"
    let app = try workflow.compile( config: .init(checkpointSaver: saver, interruptionsBefore: ["sum"]) )
```

When we run the graph, it will execute up to the point of the interruption and then pause.

```swift
    let runnableConfig = RunnableConfig()
    
    let initValue:( lastState:BinaryOpState?, nodes:[String]) = ( nil, [] )
    
    // Start workflow execution — it will stop before running "sum"
    let result = try await app.stream( .args([:]), config: runnableConfig )
                                .reduce( initValue, { partialResult, output in
                                    return ( output.state,  partialResult.1 + [output.node ] )
                                })
    
    // Verify that "add1" and "add2" are present but not "result"
    #expect( dictionaryOfAnyEqual( ["add1": 37, "add2": 10], result.lastState!.data ) )
```

At this point, the workflow is paused. The `MemoryCheckpointSaver` contains the state of the workflow, and we can inspect it to see that the `sum` node has not yet been executed.

## Resuming the Workflow

To resume the workflow, we need to get the last checkpoint from the `CheckpointSaver` and pass it to the graph's `stream` method with a `.resume` input.

```swift
    // Retrieve last checkpoint and verify its position
    let lastCheckpoint = try #require( saver.last(config: runnableConfig) )
    #expect( lastCheckpoint.nodeId == "agent_2" )
    #expect( lastCheckpoint.nextNodeId == "sum" )

    // Resume from last checkpoint and complete execution
    let runnableConfigToResume = runnableConfig.with { $0.checkpointId = lastCheckpoint.id }

    let initValue:( lastState:BinaryOpState?, nodes:[String]) = ( nil, [] )

    let result = try await app.stream( .resume, config: runnableConfigToResume )
                            .reduce( initValue, { partialResult, output in
                                return ( output.state,  partialResult.1 + [output.node ] )
                            })

    // Verify that "result" has now been computed
    #expect( dictionaryOfAnyEqual(  ["add1": 37, "add2": 10, "result":  47 ],
                                    result.lastState!.data) )
```

The workflow will now resume from where it left off and execute the `sum` node, producing the final result.

## Updating State During an Interruption

[`LangGraph-Swift`][lg4swift] also allows you to update the state of the workflow while it is paused. This is useful for scenarios where a human needs to provide additional information or modify the existing state before the workflow continues.

The `updateState` method on the compiled graph allows you to do this.

```swift
    // Resume the third run with updated state: change add2 from 10 to 13
    let lastCheckpoint = try #require( saver.last(config: runnableConfig) )

    var runnableConfigToResume = try await app.updateState(
                            config: runnableConfig.with { $0.checkpointId = lastCheckpoint4.id }, 
                            values: ["add2": 13] )
    
    // Resume and complete execution with updated value
    let initValue:( lastState:BinaryOpState?, nodes:[String]) = ( nil, [] )

    let result = try await app.stream( .resume, config: runnableConfigToResume )
                                .reduce( initValue, { partialResult, output in
                                    return ( output.state,  partialResult.1 + [output.node ] )
                                })
    
    // Verify that "result" now reflects the updated input
    #expect( dictionaryOfAnyEqual(  ["add1": 37, "add2": 13, "result": 50 ],
                                    result.lastState!.data) )
```

In this example, we update the value of `add2` to 13 before resuming the workflow. The final result will then be 50, reflecting the updated state.

## Conclusion

[`LangGraph-Swift`][lg4swift]'s pause and resume functionality is a powerful tool for building sophisticated agentic workflows that require human interaction. By using `CheckpointSaver`, `CompileConfig`, and `RunnableConfig`, you can easily implement HITL scenarios, such as approval flows, and give users the ability to interact with and control your agents.
We encourage Swift developers to explore this project and contribute to its growth and development. In the meanwhile, enjoy coding! 👋 

[lg4swift]: https://github.com/bsorrentino/LangGraph-Swift
[LangGraphTests.swift]: https://github.com/bsorrentino/LangGraph-Swift/blob/main/Tests/LangGraphTests/LangGraphTests.swift#L591