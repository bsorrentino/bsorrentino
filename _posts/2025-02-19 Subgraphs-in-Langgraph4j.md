---
layout: post
title:  LangGraph4j - Unleashing the Power of Subgraphs
date:   2025-02-19
description: "Use Subgraphs for simplify multi-agents development, enhance code-reusability and team collaboration."
categories: ai

---
![cover]
<br>

## LangGrap4j 1.4.0 is out 🚀

The release `1.4.0` of [LangGraph4j] completes the support of [subgraphs]. [Subgraphs] are useful for simplify multi-agents development, enhance code-reusability and team collaboration.

[LangGraph4j] has introduced features related to **subgraphs**, which are essentially graphs used as nodes within another graph, allowing for encapsulation and composition.

Key features and aspects of subgraphs in LangGraph4j:

## Reasons for using subgraphs:
*   Building **multi-agent systems**.
*   **Reusing a set of nodes across multiple graphs**, especially when they share some state.
*   **Enabling different teams to work on different parts of a graph** independently, provided the subgraph interface (input and output schemas) is respected.

## Ways to add subgraphs:
*   As a **state subgraph**: 
    > Merges the subgraph with its parent, creating a seamless integration where the parent graph and subgraph share everything (also interruptions 🤩).

    **Note:**
    > Merging happens during graph compilation, and subgraph nodes are renamed to avoid conflicts.
    To get the real name of merged subgraph nodes from outside the graph, use `SubGraphNode.formatId( subgraphId, subgraphNodeId )`

*   As a **compiled subgraph**: 
    > Useful when the parent graph and subgraph are indepednent but share the state.

    **Note:**
    > The parent graph and subgraph state schemas should share at least one key for communication. Extra keys passed to or returned from the subgraph node will be ignored.

*   As a **node action**: 
    >  Useful when a subgraph with a completely different schema is needed. 
    Requires a node function to transform the input (parent) state to the subgraph state and transform the results back to the parent state.

## Visualization**:

LangGraph4j includes the `StateGraph.getGraph()` method to get a visualization format (e.g., PlantUML, Mermaid.js). For state subgraphs, `StateGraph.getGraph()` provides the visualization format before merging, while `CompiledGraph.getGraph()` shows it after merging.

## Streaming: 

Streaming is automatically enabled when adding both state subgraphs and compiled subgraphs, but it is up to the user to implement it when using subgraphs as node actions.

[cover]: ../../../../assets/langgraph-java/langgraph4j-cover-2.png
[LangGraph4j]: https://github.com/bsorrentino/langgraph4j
[Subgraphs]: https://bsorrentino.github.io/langgraph4j/core/langgraph4j-core/concepts/subgraph.html
