---
layout: post
title: "LangGraph4j Annotations: Organize Graph Behavior with Action Catalogs"
date: 2026-10-21
description: |
  Build a LangGraph4j workflow with annotated Java methods, reusable action catalogs, and explicit conditional routing.
categories: ai

---
![LangGraph4j](../../../../assets/langgraph-java/annotations/cover.png)
<br>
<hr>
<br>

## From graph lambdas to action catalogs

When building a workflow with [LangGraph4j], I usually start with a few nodes and straightforward transitions. As the workflow grows, the graph definition can become crowded with action implementations, configuration access, and routing logic.

Moving those actions into separate classes helps. The new annotations provide a convenient way to organize them: **ordinary Java methods become node actions and edge conditions**, grouped into an **Action Catalog**.

Available from **LangGraph4j 1.9.6**, `@NodeAction` and `@EdgeCondition` belong to `langgraph4j-core`, in the `org.bsc.langgraph4j.annotation` package. This guide follows the [official annotations documentation][annotations].

## What an Action Catalog contains

An Action Catalog is a Java class implementing the `ActionCatalog` marker interface. Its public annotated methods describe the available behavior:

* `@NodeAction` identifies work that produces updates to graph state.
* `@EdgeCondition` identifies a routing decision, optionally accompanied by state updates.

`ActionCatalogRepository.of(catalog)` discovers those methods, including inherited public methods, and adapts them into actions that LangGraph4j can execute.

**The catalog owns behavior; the `StateGraph` definition owns the connections.** Registering a catalog does not automatically create a workflow. We still choose which actions become nodes, where execution starts, and how each routing result maps to a destination.

Both annotations support two optional attributes:

| Attribute | Purpose |
| --- | --- |
| `name` | Lookup name in the repository. An empty or blank value uses the Java method name. |
| `description` | Descriptive metadata; it does not control execution or routing. |

An explicit name is useful when the catalog should expose a stable action name even if its Java method is renamed. Give overloaded annotated methods distinct names. Keep names unique within the node actions and within the edge conditions; these are separate lookup maps.

## An example

Let's build a small document workflow: prepare some text, decide whether review is requested, and optionally mark it as reviewed. We intentionally keep it simple so no LLM or external service is needed than we can focus on how the catalog connects to the graph.

### Define the catalog

We create a new `DocumentCatalog` class assuming it uses the standard `AgentState`, so there is no custom state class to introduce first.

```java
public final class DocumentCatalog implements ActionCatalog {
    // Trims the supplied text and records the executing graph node.
    @NodeAction(name = "prepare", description = "Prepare the document text")
    public Map<String, Object> prepareDocument(
            AgentState state, RunnableConfig config) {
        // Missing text is allowed in this example and becomes an empty document.
        String text = state.<String>value("text").orElse("");

        // Return updates for the engine to merge before it evaluates routing.
        return Map.of("text", text.strip(), "preparedBy", config.nodeId());
    }

    // Selects a review route and records the decision without mutating state.
    @EdgeCondition(description = "Review only when requested")
    public Command route(AgentState state) {
        // Omitted needsReview means this example can finish after preparation.
        boolean needsReview = state.<Boolean>value("needsReview").orElse(false);
        String route = needsReview ? "reviewRequired" : "complete";

        // These are routing keys; the graph maps them to node IDs or END.
        return new Command(route, Map.of("reviewDecision", route));
    }

    // Marks the document as reviewed; this example performs no human interaction.
    @NodeAction
    public Map<String, Object> review(AgentState state) {
        return Map.of("reviewed", true);
    }
}
```

There are some details to notice here.
* The `@NodeAction` annotated methods returns a **partial state update** as required by LangGraph4j node actions classic.
* The `@EdgeCondition` annotated methods return a `Command` as required by  LangGraph4j classic edge conditions. 
* The method `prepareDocument` is registered as **`prepare`** because it has an explicit annotation name. The other methods use their Java names: `route` and `review`.
* The `route` returns a `Command` that lets the condition record `reviewDecision` as well as select the next route.
* The `review` action is deliberately a local marker. A real Human-in-the-Loop review would also need the appropriate interruption, persistence, and resume behavior.

### Resolve the catalog and connect the graph

Let's build the `DocumentWorkflow` class alongside the catalog:

```java
public final class DocumentWorkflow {
    // Builds the workflow and prints the final state for an input requiring review.
     public static void main(String[] args) throws Exception {
        // Register before resolving names; actions execute on this catalog instance.
        final var repository = ActionCatalogRepository.of(new DocumentCatalog());

        // Define the topology explicitly, mapping each possible routing result.
        final var graph = new StateGraph<>(AgentState::new)
                .add(repository.node("prepare"))
                .add(repository.node("review"))
                .addEdge(START, "prepare")
                .add(repository.edge("prepare", "route",
                        EdgeMappings.builder()
                                .to( "review", "reviewRequired" )
                                .toEND( "complete" )
                                .build()))
                .addEdge("review", END)
                .compile(); // Resolve action factories before executing the graph.

        // A fresh invocation requests review and supplies the text to prepare.
        graph.stream(
                    GraphInput.args(Map.of(
                            "text", "  A document to review.  ",
                            "needsReview", true)),
                    RunnableConfig.empty())
            .reduce( (a,b) -> b )
            .thenAccept( System.out::println );

    }

}
```

There are some details to notice here.
* `repository.node("prepare")` and `repository.node("review")` supplies a complete graph node whose ID and action lookup name are the same. 
* Similarly, `repository.edge(...)` supplies a complete conditional edge. Both work with `StateGraph.add(...)`.

This gives us a small example to make in evidence how graph definition change using annotations.

## Reuse an action under another node ID

Sometimes the graph should give a reusable action a name specific to its role in that workflow. `repository.nodeAction(...)` retrieves the action factory without assigning the node ID:

```java
// Alternative preparation node: graph identity differs from the catalog lookup name.
var workflow = new StateGraph<>(AgentState::new)
        .addNode("prepareIncomingDocument", repository.nodeAction("prepare"))
        .addEdge(START, "prepareIncomingDocument")
        .addEdge("prepareIncomingDocument", END);
```

This fragment replaces the earlier topology and uses the same repository. After compilation,  `prepareIncomingDocument` node would contain `prepare` action bound with `prepareDocument` method in action catalog.

That distinction is useful when an action appears in several workflows, or more than once within a graph. Catalog names identify reusable behavior; graph node IDs identify its position in a particular workflow.

The [official guide][annotations] also discusses a singular `edgeAction(...)` accessor with details on its usage

## Other supported method shapes

The example uses synchronous methods, but catalogs also support asynchronous work and node construction during compilation:

| Method role | Supported return types |
| --- | --- |
| Runtime node action | `Map<String, Object>` or `CompletableFuture<Map<String, Object>>` |
| Runtime edge condition | `String`, `Command`, or a `CompletableFuture` of either |
| Compile-time node method | `NodeActionWithConfig<State>` or `AsyncNodeActionWithConfig<State>` |

Runtime methods can receive your `AgentState` subclass, `RunnableConfig`, both in either order, or neither. Include only what the method needs. A returned future must complete before its updates or routing result can be applied; returning a future does not itself schedule background work.

A compile-time node method instead takes **one `CompileConfig` argument**. It runs when the graph creates its action during compilation and returns the action to execute later. This is useful when action construction depends on compilation settings. Edge conditions do not support `CompileConfig`. 

See the [signature examples][signatures] for the complete forms.

## Organize catalogs around related behavior

For a small workflow, a single catalog keeps related actions and conditions together. As the application grows, I would split catalogs by responsibility: document preparation in one, review policy in another, and delivery in a third. Each can have its own repository, with their actions connected in the same explicit graph definition.

The repository uses the **catalog instance you supply**. That means constructor injection works naturally: create the catalog with its service clients, repositories, or model dependencies before registering it. The annotations do not require a dependency injection framework.

Keep per-run values in graph state or execution configuration. A catalog shared across concurrent runs also shares its fields and dependencies, so mutable collaborators need suitable concurrency handling. The stateless catalog in this example avoids that concern.

Catalog methods can be called directly in ordinary Java tests..

## Common mistakes to catch early

Use **public annotated methods**, with one graph annotation per method. Repository discovery will not pick up private methods. Unsupported runtime parameter types are rejected during repository creation, while unsupported results fail when the action executes; compile-time node results are checked during compilation.

Looking up an unknown action through `node`, `nodeAction`, or `edge` throws `IllegalArgumentException`. Explicit duplicate names are also rejected; make method-derived names unique rather than relying on overload discovery order.

Exceptions thrown by runtime methods, and exceptional future completions, propagate through graph execution. Annotations provide adaptation, so application error handling still belongs in the actions or the surrounding execution code. The [validation reference][validation] covers these failure cases.

For an existing graph, a practical migration is to move a related group of actions into a catalog, register it, and replace their inline implementations with repository lookups. The edges and routing mappings can remain explicit throughout that refactoring.

## Conclusion

The approach of organizing actions into catalogs helps maintain a clear structure as your workflow grows. It encourages modularity, reusability, and easier testing, while keeping the graph definitions explicit and manageable. 
In the future action catalogs could feed advanced workflow designer tools, enabling more declarative automation and orchestration capabilities.
I'm interested in how this approach fits larger workflows. Try it grouping a set of related actions in [LangGraph4j], share your feedback, and... happy AI coding! 👋

[LangGraph4j]: https://github.com/langgraph4j/langgraph4j
[annotations]: https://langgraph4j.github.io/langgraph4j/1.9/core/annotations/
[signatures]: https://langgraph4j.github.io/langgraph4j/1.9/core/annotations/#node-action-signatures
[validation]: https://langgraph4j.github.io/langgraph4j/1.9/core/annotations/#validation-and-failures
