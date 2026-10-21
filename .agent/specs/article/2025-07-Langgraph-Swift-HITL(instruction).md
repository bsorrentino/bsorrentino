
I would write an article about "how to implements Pause and Resume of agentic flow using LangGraph-Swift library".

I want focus on implementation of software components involved in such feature that are defined file @Sources/LangGraph/Checkpoints.swift

Moreover I have introduced also new `CompileConfig`, `RunnableConfig` and `GraphInput` refers to file @Sources/LangGraph/LangGraph.swift

To provide a detailed getting started use implementation of method `testRunningWithInterruption()`, refers to file @Tests/LangGraphTests/LangGraphTests.swift

## Key takeways

- How enable workflow's interruptions to enable Human-in-the-loop (HITL) scenarios to support the approval flow among other things.
- An example enabling pause and resume of a simple workflow  (refers method `testRunningWithInterruption()` in file @Tests/LangGraphTests/LangGraphTests.swift ). 

