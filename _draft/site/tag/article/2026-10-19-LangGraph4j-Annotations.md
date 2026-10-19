---
layout: post
title: "LangGraph4j Annotations: Organize Graph Behavior with Action Catalogs"
date: 2026-10-19
description: |
  Build a LangGraph4j workflow with annotated Java methods, reusable action catalogs, and explicit conditional routing.
categories: ai

---

## From graph lambdas to action catalogs

When building a workflow with [LangGraph4j], I usually start with a few nodes and straightforward transitions. As the workflow grows, the graph definition can become crowded with action implementations, configuration access, and routing logic.

Moving those actions into separate classes helps. The new annotations provide a convenient way to organize them: **ordinary Java methods become node actions and edge conditions**, grouped into an **Action Catalog**.

Available from **LangGraph4j 1.9.6**, `@NodeAction` and `@EdgeCondition` belong to `langgraph4j-core`, in the `org.bsc.langgraph4j.annotation` package. This guide follows the [official annotations documentation][annotations].

Let's build a small document workflow: prepare some text, decide whether review is requested, and optionally mark it as reviewed. No LLM or external service is needed, so we can focus on how the catalog connects to the graph.

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

## 1. Add the core dependency

Use Java 17 or later and a core version containing the annotations. For this example, the Maven dependency is:

```xml
<!-- Core provides both the graph engine and the annotation adapters. -->
<dependency>
  <groupId>org.bsc.langgraph4j</groupId>
  <artifactId>langgraph4j-core</artifactId>
  <version>1.9.6</version>
</dependency>
```

If your application already imports the LangGraph4j BOM, set the version there and omit it from the dependency.

## 2. Define the catalog

Save the following as `DocumentCatalog.java`. It uses the standard `AgentState`, so there is no custom state class to introduce first.

```java
// In-memory document actions; graph topology and execution belong to the caller.
import java.util.Map;
import org.bsc.langgraph4j.RunnableConfig;
import org.bsc.langgraph4j.action.Command;
import org.bsc.langgraph4j.annotation.ActionCatalog;
import org.bsc.langgraph4j.annotation.EdgeCondition;
import org.bsc.langgraph4j.annotation.NodeAction;
import org.bsc.langgraph4j.state.AgentState;

/**
 * Supplies document preparation, review, and routing to a catalog repository.
 * Holds no mutable fields and can be reused across runs; methods only read state.
 */
public final class DocumentCatalog implements ActionCatalog {
    /**
     * Trims the supplied text and records the executing graph node.
     * @param state non-null current state; text must be a String when present
     * @param config non-null execution settings containing the current node ID
     * @return non-null updates for text and preparedBy; missing text becomes empty
     * @throws ClassCastException if text has a type other than String
     */
    @NodeAction(name = "prepare", description = "Prepare the document text")
    public Map<String, Object> prepareDocument(
            AgentState state, RunnableConfig config) {
        // Missing text is allowed in this example and becomes an empty document.
        String text = state.<String>value("text").orElse("");

        // Return updates for the engine to merge before it evaluates routing.
        return Map.of("text", text.strip(), "preparedBy", config.nodeId());
    }

    /**
     * Selects a review route and records the decision without mutating state.
     * @param state non-null state after preparation; needsReview is an optional Boolean
     * @return non-null command with a mapped route and a reviewDecision update
     * @throws ClassCastException if needsReview has a type other than Boolean
     */
    @EdgeCondition(description = "Review only when requested")
    public Command route(AgentState state) {
        // Omitted needsReview means this example can finish after preparation.
        boolean needsReview = state.<Boolean>value("needsReview").orElse(false);
        String route = needsReview ? "reviewRequired" : "complete";

        // These are routing keys; the graph maps them to node IDs or END.
        return new Command(route, Map.of("reviewDecision", route));
    }

    /**
     * Marks the document as reviewed; this example performs no human interaction.
     * @param state non-null current state, including the routing decision
     * @return non-null update setting reviewed to true; other keys are untouched
     */
    @NodeAction
    public Map<String, Object> review(AgentState state) {
        return Map.of("reviewed", true);
    }
}
```

There are three details to notice here.

First, the Java method `prepareDocument` is registered as **`prepare`** because it has an explicit annotation name. The other methods use their Java names: **`route`** and **`review`**.

Second, a node returns a **partial state update**, rather than rebuilding or mutating the entire state. The graph applies that update using its normal state and channel rules before evaluating the outgoing condition.

Third, `route` returns a `Command`. This lets the condition record `reviewDecision` as well as select the next route. If no update were needed, it could return a `String` routing key instead. The condition sees the state after preparation, and its command updates become available to the destination node.

The `review` action is deliberately a local marker. A real Human-in-the-Loop review would also need the appropriate interruption, persistence, and resume behavior.

## 3. Resolve the catalog and connect the graph

Save this second file as `DocumentWorkflow.java` alongside the catalog:

```java
// Console entry point for an in-memory workflow; no persistence or external services.
import java.util.Map;
import org.bsc.langgraph4j.GraphInput;
import org.bsc.langgraph4j.RunnableConfig;
import org.bsc.langgraph4j.StateGraph;
import org.bsc.langgraph4j.annotation.ActionCatalogRepository;
import org.bsc.langgraph4j.state.AgentState;
import static org.bsc.langgraph4j.StateGraph.END;
import static org.bsc.langgraph4j.StateGraph.START;

/** Runs a document catalog in a single console invocation without shared state. */
public final class DocumentWorkflow {
    /**
     * Builds the workflow and prints the final state for an input requiring review.
     * @param args unused command-line arguments
     * @throws Exception if catalog registration, graph construction, or execution fails
     */
    public static void main(String[] args) throws Exception {
        // Register before resolving names; actions execute on this catalog instance.
        var repository = ActionCatalogRepository.of(new DocumentCatalog());

        // Define the topology explicitly, mapping each possible routing result.
        var graph = new StateGraph<>(AgentState::new)
                .add(repository.node("prepare"))
                .add(repository.node("review"))
                .addEdge(START, "prepare")
                .add(repository.edge("prepare", "route", Map.of(
                        "reviewRequired", "review",
                        "complete", END)))
                .addEdge("review", END)
                .compile(); // Resolve action factories before executing the graph.

        // A fresh invocation requests review and supplies the text to prepare.
        var result = graph.invoke(
                GraphInput.args(Map.of(
                        "text", "  A document to review.  ",
                        "needsReview", true)),
                RunnableConfig.empty());

        // Display merged state; fail visibly if execution produces no final state.
        System.out.println(result.orElseThrow().data());
    }
}
```

`repository.node("prepare")` supplies a complete graph node whose ID and action lookup name are both `prepare`. Similarly, `repository.edge(...)` supplies a complete conditional edge. Both work with `StateGraph.add(...)`.

The conditional edge has three inputs that deserve attention:

| Input | Meaning in this workflow |
| --- | --- |
| `"prepare"` | Source **graph node ID** whose outgoing route is being evaluated. |
| `"route"` | **Catalog condition name** to invoke. |
| Routing map | Translates `reviewRequired` to node `review`, and `complete` to `END`. |

**A routing key is not automatically a destination node ID.** Even `Command.gotoNode` is interpreted through this mapping when used by the catalog condition. Every possible result needs a corresponding mapping.

## 4. Check both execution paths

With `needsReview` set to `true`, execution visits `prepare`, then `review`, and finishes. The final state includes the following values; map display order can vary:

```text
text=A document to review.
preparedBy=prepare
needsReview=true
reviewDecision=reviewRequired
reviewed=true
```

Change the input flag to `false` and invoke the graph again. Preparation still runs, but `reviewDecision` becomes `complete`, execution ends immediately after preparation, and the fresh run has no `reviewed` key. Omitting the flag follows the same path because the catalog defines that default.

This gives us a small example where state updates, routing decisions, and graph connections remain easy to inspect independently.

## Reuse an action under another node ID

Sometimes the graph should give a reusable action a name specific to its role in that workflow. `repository.nodeAction(...)` retrieves the action factory without assigning the node ID:

```java
// Alternative preparation node: graph identity differs from the catalog lookup name.
var workflow = new StateGraph<>(AgentState::new)
        .addNode("prepareIncomingDocument", repository.nodeAction("prepare"))
        .addEdge(START, "prepareIncomingDocument")
        .addEdge("prepareIncomingDocument", END);
```

This fragment replaces the earlier topology and uses the same imports and repository. After compilation, `preparedBy` would contain `prepareIncomingDocument`, because `config.nodeId()` reports the executing graph node's identity.

That distinction is useful when an action appears in several workflows, or more than once within a graph. Catalog names identify reusable behavior; graph node IDs identify its position in a particular workflow.

The [official guide][annotations] also discusses a singular `edgeAction(...)` accessor, with an availability caveat. It is absent from the 1.9.6 API checked for this example. Use `repository.edge(...)` as shown above for conditional routing in that version.

## Other supported method shapes

The example uses synchronous methods, but catalogs also support asynchronous work and node construction during compilation:

| Method role | Supported return types |
| --- | --- |
| Runtime node action | `Map<String, Object>` or `CompletableFuture<Map<String, Object>>` |
| Runtime edge condition | `String`, `Command`, or a `CompletableFuture` of either |
| Compile-time node method | `NodeActionWithConfig<State>` or `AsyncNodeActionWithConfig<State>` |

Runtime methods can receive your `AgentState` subclass, `RunnableConfig`, both in either order, or neither. Include only what the method needs. A returned future must complete before its updates or routing result can be applied; returning a future does not itself schedule background work.

A compile-time node method instead takes **one `CompileConfig` argument**. It runs when the graph creates its action during compilation and returns the action to execute later. This is useful when action construction depends on compilation settings.

There is a subtle API distinction: `repository.nodeAction(...)` returns a `Node.ActionFactory<State>`, but the annotated compile-time method must return one of the action interfaces in the table. The repository provides the factory wrapper. Edge conditions do not support `CompileConfig`. See the [signature examples][signatures] for the complete forms.

## Organize catalogs around related behavior

For a small workflow, a single catalog keeps related actions and conditions together. As the application grows, I would split catalogs by responsibility: document preparation in one, review policy in another, and delivery in a third. Each can have its own repository, with their actions connected in the same explicit graph definition.

The repository uses the **catalog instance you supply**. That means constructor injection works naturally: create the catalog with its service clients, repositories, or model dependencies before registering it. The annotations do not require a dependency injection framework.

Keep per-run values in graph state or execution configuration. A catalog shared across concurrent runs also shares its fields and dependencies, so mutable collaborators need suitable concurrency handling. The stateless catalog in this example avoids that concern.

Catalog methods can be called directly in ordinary Java tests. Graph-level checks should then cover the connections: whether every condition result is mapped, whether updates reach later actions, and whether both branches produce the intended final state.

## Common mistakes to catch early

Use **public annotated methods**, with one graph annotation per method. Repository discovery will not pick up private methods. Unsupported runtime parameter types are rejected during repository creation, while unsupported results fail when the action executes; compile-time node results are checked during compilation.

Looking up an unknown action through `node`, `nodeAction`, or `edge` throws `IllegalArgumentException`. Explicit duplicate names are also rejected; make method-derived names unique rather than relying on overload discovery order.

Exceptions thrown by runtime methods, and exceptional future completions, propagate through graph execution. Annotations provide adaptation, so application error handling still belongs in the actions or the surrounding execution code. The [validation reference][validation] covers these failure cases.

For an existing graph, a practical migration is to move a related group of actions into a catalog, register it, and replace their inline implementations with repository lookups. The edges and routing mappings can remain explicit throughout that refactoring.

I'm interested in how this approach fits larger Java workflows. Try it with a group of related actions in [LangGraph4j], share your feedback, and... happy AI coding! 👋

[LangGraph4j]: https://github.com/langgraph4j/langgraph4j
[annotations]: https://langgraph4j.github.io/langgraph4j/1.9/core/annotations/
[signatures]: https://langgraph4j.github.io/langgraph4j/1.9/core/annotations/#node-action-signatures
[validation]: https://langgraph4j.github.io/langgraph4j/1.9/core/annotations/#validation-and-failures
