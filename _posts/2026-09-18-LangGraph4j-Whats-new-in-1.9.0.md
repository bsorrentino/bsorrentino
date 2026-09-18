---
layout: post
title: "LangGraph4j 1.9.0 is out: What's new and the roadmap"
date: 2026-09-18
description: |
  Explore LangGraph4j 1.9.0: custom node output, checkpoint saver improvements, a refreshed Studio, and the next steps for Java agentic workflows.
categories: ai

---
![LangGraph4j](../../../../assets/langgraph-java/1.9.0/cover.png)
<br>
<hr>
<br>

## LangGraph4j 1.9.0 is out!

**[LangGraph4j] 1.9.0 is out!** With the `1.8.x` release stream now in LTS, development moves forward on `1.9` with improvements to streaming, persistence, and the infrastructure for building agents in Java.

This release is an important step toward workflows that are easier to follow while they run and easier to inspect after they finish. A node can now report progress output before returning its result, checkpoint savers have a richer execution lifecycle, and Studio gets an UI refresh.

Let's look at what changes for an application built on `1.8.x`, with particular attention to **custom output from nodes** and **checkpoint management**. The [official migration guide][migration] provides details API reference for the changes discussed here.

## Emit custom output while a node is running

Imagine a node that retrieves documents, processes them, and prepares a response. The caller may want to show progress throughout that work. Waiting for the final node output gives the user minimal information about what is happening in the meantime.

In `1.9`, a node action can emit its own typed `NodeOutput` values through the active graph execution stream (`graph.stream(...)`). They arrive alongside the usual START, node, and END outputs, before the node has necessarily finished.

The mechanism is straightforward:

1. Define a subclass of `NodeOutput` carrying the information you want to expose.
2. Obtain a dispatcher from the node's `RunnableConfig`.
3. Dispatch custom outputs during execution.
4. Handle those types when consuming the graph stream.

Here is a small example.

```java
public final class ProgressOutput extends NodeOutput<AgentState> {
    private final String message;

    public ProgressOutput(String node, AgentState state, String message) {
        super(node, state);
        this.message = message;
    }

    public String message() {
        return message;
    }
}
```

Inside the node, the dispatcher publishes a message while the returned map still provides the normal state update:

```java
AsyncNodeActionWithConfig<AgentState> process = (state, config) -> {
    var dispatcher = config.<AgentState, ProgressOutput>customDispatcher();

    dispatcher.dispatchAsync(
        new ProgressOutput(config.nodeId(), state, "Processing documents"));

    // Perform the node's work here.

    return completedFuture(Map.of("result", "Documents processed"));
};
```

Once this action is registered in a compiled graph, the caller can recognize its progress messages:

```java

graph.stream(GraphInput.noArgs(), RunnableConfig.empty()).forEachAsync( output -> {
        if (output instanceof ProgressOutput progress) {
            System.out.println(progress.message());
        } else {
            System.out.println("Graph step: " + output.node());
        }
    });
```


This gives us a useful channel for progress notifications, intermediate results, and application-specific events. **Dispatching a custom output does not update graph state.** If a value must influence routing, be available to later nodes, or become part of a persisted result, include it in the node's returned state update.

There are two dispatch options. `dispatchSync(...)` waits until the stream accepts the value and can throw `InterruptedException`; `dispatchAsync(...)` submits without waiting. The dispatcher is available during node execution in an active graph stream, including the supported hook context. Keep its use within that lifecycle: accessing it outside has an unpredicable result.

Custom events are intended for `graph.stream(...)` consumers; they do not change the result returned by `graph.invoke(...)`. See the [custom-output tutorial][custom-output] for the complete contract and a **hook-based** example.

### The streaming engine behind it

This capability comes with a refactoring of the internal streaming engine around `AsyncGeneratorFlow` from [`async-generator 5.0`](https://github.com/bsorrentino/java-async-generator) project.

Ordinary iteration over `stream()` remains source-compatible. Applications extending directly streaming generators, supplying a `BlockingQueue`, or depending on `AsyncGenerator.WithResult` need migration work. 

**Note:** 👀
> This refactoring is a groundwork for Reactor Flow support in a future LangGraph4j `2.0`; that support is a future direction.

## Checkpoint Savers: A richer execution lifecycle

Checkpoint persistence is central to long-running agents and Human-in-the-Loop workflows. In `1.9`, the changes cover what happens when execution finishes, how released runs can be retrieved, how subgraph savers participate, and how interruptions and failures are recorded. These are the [checkpoint changes][migration] I would review first when upgrading an existing application.

### Completed runs release their thread by default

With a checkpoint saver configured, **a graph that completes normally now releases its active thread automatically**. Depending on the saver, release archives or tags its checkpoints and removes the active checkpoint set.

This matters if your application completes a graph, updates the same active thread's state, and executes it again. To retain the previous lifecycle, explicitly disable automatic release when compiling:

```java
var compileConfig = CompileConfig.builder()
    .checkpointSaver(saver)
    .releaseThread(false) // backward compatible option
    .build();

var graph = workflow.compile(compileConfig);
```

**An interruption or an exception does not automatically release the thread.** Interrupted runs remain available for Human-in-the-Loop continuation, and failed runs remain available for the application's recovery strategy. `graph.updateState(...)` continues to work in those situations as before.

The practical upgrade check is to examine what your code does *after successful completion*. Any inspection, replay, resume, or manual-release logic that assumes an active checkpoint set needs attention.


### Experimental versioning for released runs

Checkpoint tags gain optional version information. `BaseCheckpointSaver.Tag` exposes `threadId()`, `version()` as an `Optional<Integer>`, `checkpoints()`, and `lastCheckpoint()`.

Two lookup methods make released runs accessible:

```java
Optional<Tag> tag(RunnableConfig config, Integer version) throws Exception;

Optional<Tag> lastTag(RunnableConfig config) throws Exception;
```

The `version` argument to `tag(...)` is nullable. `lastTag(...)` retrieves the latest tag regardless of whether it is versioned.

`GraphResult.asLastCheckpointStateData()` now obtains its data through `Tag.lastCheckpoint()`, preserving its observable result. This is useful continuity for callers retrieving the final checkpoint state while the underlying release model evolves.

### Parent and Subgraph savers work together

Subgraphs increasingly carry real agent behavior, so their persistence lifecycle must follow the parent execution.

`BaseCheckpointSaver` now supports `putSubGraphSaver(...)` to register a subgraph saver and `listSubGraphSaver(...)` to retrieve registrations associated with a parent configuration. `SubCompiledGraphNodeAction` registers its saver with the parent; `AbstractCheckpointSaver.release(...)` then cascades release to the registered subgraph threads.

If you implement a custom saver, `AbstractCheckpointSaver` provides a reference implementation of the registration mechanism. Review that lifecycle when adapting your implementation, especially if your agents contain nested compiled graphs.

### Interruption and Error Metadata

The saver contract also exposes explicit lifecycle hooks:

```java
void registerInterruption(
    RunnableConfig config,
    InterruptionMetadata interruptionMetadata) throws Exception;

Tag releaseCheckpointsOnError(
    RunnableConfig config,
    Throwable error) throws Exception;
```

These allow a saver to retain interruption information and distinguish an error release from normal completion. `InterruptionMetadata` now also exposes the interruption reason. That gives later analysis more context about why an execution stopped.

The error-release hook does not change the default described above: an exception leaves the thread available, and the caller chooses its recovery or release strategy.
> We suggest to call `saver.releaseOnError(RunnableConfig, Throwable)` on catching exceptions to avoid to leave lot of 'dirty' records in underlyng checkpoint saver storage.
> We are evaluating in the future relase to call it automatically on whatever error catched by graph running engine.


The in-memory, file-system, Redis, Postgres, Oracle, MySQL, CockroachDB, DynamoDB, and Hazelcast savers have been aligned with this contract through default implementations. The amount of information retained remains a concern of the specific saver implementation.

### SQLite and PostgreSQL V2 savers

Both relational integrations add implementations backed by versioned SQL resources:

| Integration | New implementation | Existing implementation |
| --- | --- | --- |
| SQLite | `SQLiteSaverV2` | `SQLiteSaver`, for the V1 schema |
| PostgreSQL | `PostgresSaverV2` | `PostgresSaver`, for the V1 schema |

The V2 implementations align with the updated release, error, and interruption contract. The original classes remain available for their V1 schemas. Treat adoption of a V2 saver as a persistence change to review against your existing database; the release notes do not establish an automatic V1-to-V2 data migration.

## Other changes worth knowing before upgrading

### Explicit Graph Inputs

`GraphInput` becomes the preferred API for expressing whether an execution is starting or resuming:

```java
graph.stream(GraphInput.args(Map.of("input", "Hello")), config);
graph.stream(GraphInput.resume(), config);
graph.stream(GraphInput.resume(Map.of("approval", "APPROVED")), config);
```

Use `GraphInput.noArgs()` for a new execution without arguments. The older map-based stream and invoke overloads remain available in `1.9`, but are deprecated for removal. Moving away from a null map makes the intended operation explicit.

### Diagnostics and State Serialization

`RunnableConfig.nodePath()` supplies the current node path for regular nodes and subgraphs, replacing the older partial `graphPath()` usage. A node can also intentionally interrupt execution by raising `GraphInterruptException`.

State cloning remains enabled by default. `RunnableConfig.builder().disableCloneState()` opts out, which can help during early development with objects that are not yet serializable. Exposed state may then reflect later mutations, so consider how consumers retain or modify it.

`StateSerializer.declareTransientAttributes(...)` excludes named attributes from serialized data and restores them from the same serializer's in-memory transient storage. Those values do not survive a restart, a different process, or a new serializer instance. Keep anything needed for durable resume in persisted state. `GsonStateSerializer` is deprecated for removal; move toward Jackson-based serialization.

### Agent infrastructure

The experimental core skills API introduces `SkillSource`, `SkillPath`, and `SkillParser`. 

Spring AI builds on this with `SubAgent`, `CustomSubAgent`, `SkilledReactSubAgent`, and `SkillResource`, making compiled agents reusable as tools. I covered the pattern in [Skill-Based Sub-Agents with LangGraph4j and Spring AI][sub-agents].


## LangGraph4j Studio gets a visual refresh


### Studio 1.8

![LangGraph4j Studio 1.8 showing a dark graph panel and execution state](../../../../assets/langgraph-java/1.9.0/studio-1.8-demo.gif)

*Animation from the [Studio 1.8 documentation][studio-18].*


### Studio 1.9

![LangGraph4j Studio 1.9 showing the refreshed graph canvas and execution controls](../../../../assets/langgraph-java/1.9.0/studio-1.9-demo.gif)

*Animation from the [Studio 1.9 documentation][studio-19].*

In the new Studio the active node receives a blue highlight and a loading indicator, making execution easier to follow at a glance.


## LangGraph4j DSL

The release also adds `langgraph4j-dsl`, whose `JsonDslGenerator` exports graphs, including parallel nodes and nested subgraphs, as JSON:

```java
String json = compiledGraph.reduce(new JsonDslGenerator<>());
```

This representation has been used for the Studio refactoring toward [React Flow](https://reactflow.dev) library.

----

## What's Next for LangGraph4j

The next phase of development will focus on three areas. These are roadmap priorities, with scope and delivery to evolve as implementation progresses.

### Persist more of the execution context

I want to improve graph execution-context persistence so that it supports monitoring and post-processing analysis more effectively. The checkpoint lifecycle work in `1.9` is a step in that direction: understanding completed, interrupted, and failed runs is essential when agentic workflows move into production.

The aim is to make retained execution information more useful for understanding behavior and for subsequent analysis and processing.

### Redesign parallel node execution

Another priority is to redesign the parallel-node implementation, removing current limitations and improving efficiency. As workflows grow, parallel branches need to become easier to compose and manage.

This is upcoming work. Applications using `1.9` should continue to account for the currently documented parallel-execution limitations.

### Improve built-in Agents for Spring AI and LangChain4j

Finally, I want to enhance the built-in agent infrastructure for both **Spring AI** and **LangChain4j**. The skills and sub-agent work demonstrates how much can be built on top of graph execution; the goal is to make those building blocks more useful and easier to compose across both integrations.

## Try the Release

Update the LangGraph4j BOM to `1.9.0` to keep module versions aligned:

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.bsc.langgraph4j</groupId>
      <artifactId>langgraph4j-bom</artifactId>
      <version>1.9.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

## Conclusions

For an existing `1.8.x` application, start with the [migration guide][migration], review thread release and stored checkpoint compatibility, then exercise interruption, resume, and completion paths with your chosen saver.

I'm interested in feedback from real workflows, especially around custom progress output and checkpoint management. Check out [LangGraph4j], try the release, and let me know what would help your next agentic application. If you find the project useful, leave a star ⭐️ and... happy AI coding! 👋

[LangGraph4j]: https://github.com/langgraph4j/langgraph4j
[migration]: https://langgraph4j.github.io/langgraph4j/1.9/whats-new-v1.9
[custom-output]: https://langgraph4j.github.io/langgraph4j/1.9/core/emit-custom-output/
[studio-18]: https://langgraph4j.github.io/langgraph4j/1.8/studio/
[studio-19]: https://langgraph4j.github.io/langgraph4j/1.9/studio/
[sub-agents]: https://bsorrentino.github.io/bsorrentino/ai/2026/04/28/LangGraph4j-SubAgent.html
