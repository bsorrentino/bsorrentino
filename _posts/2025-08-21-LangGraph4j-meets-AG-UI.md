---
layout: post
title:  LangGraph4j Meets AG-UI - Building UI/UX in the AI Agents era
date:   2025-08-21
description: "Standardize the Agent-to-User Communication"
categories: ai

---
![cover](../../../../assets/langgraph-java/ag-ui/cover.png)
<br>
<hr>
<br>

## AI Agents ecosystem evolution

The rapid evolution of artificial intelligence has brought a new wave of innovation: the rise of AI agents. These agents—autonomous, intelligent, and capable of interacting with users and services—are changing how we build applications, automate workflows, and even communicate online. However, as this ecosystem expands, a new challenge has emerged: interoperability. How can these agents reliably talk to each other, work with external tools, and offer seamless experiences to human users?

This challenge has led to the development of new standards—protocols that define how AI agents communicate with the world and each other. Among the most notable are:

### 1. MCP (Multi-Component Protocol)
**Purpose:** Standardizing Agent-to-Tools/Services Communication  

[MCP] defines how AI agents communicate with various tools and services. By using MCP, developers can ensure that their agents can interact with a wide range of external APIs and software components, facilitating complex automation and integration scenarios.

### 2. A2A (Agent-to-Agent Protocol)
**Purpose:** Standardizing Agent-to-Agent Communication  
[A2A] focuses on enabling agents to interact directly with each other. This protocol is crucial for building distributed, collaborative, or competitive networks of agents—where agents can delegate tasks, negotiate, or share knowledge autonomously.

### 3. AG-UI (Agent Graphical User Interface Protocol)
**Purpose:** Standardizing Agent-to-User Communication  
[AG-UI] bridges the gap between AI agents and their human users, ensuring that interactions are intuitive, consistent, and user-friendly. It defines the structure for how agents present information, take user input, and handle conversations—regardless of the underlying platform or application.

## LangGraph4j and AG-UI

**[LangGraph4j]** is a powerful Java-based framework designed for building and orchestrating AI agent workflows. It is already capable to use **MCP** servers inside workflow steps and has also experimented integration with **A2A** (see [here](https://github.com/langgraph4j/langgraph4j-examples/blob/main/spring-ai/a2a-server-implby-a2a4j)).

### Copilotkit integration

With its latest project, [langgraph4j-copilotkit], we have evaluated how to make [LangGraph4j] compliant with the [AG-UI] protocol,  integrating [CopilotKit] that is its reference implementation for help and enhance developer experience in building better either User Interfaces (UI) and User eXperience (UX).

**Why AG-UI Compliance Matters**
> By aligning with AG-UI, LangGraph4j agents can present rich, interactive interfaces to user, whether embedded in web apps, desktop tools, or chatbots. This standardization means that developers can focus on building great agent logic, while relying on AG-UI to handle the complexities of user interaction.



## Architecture

The architecture of the [langgraph4j-copilotkit] integration is designed to enable seamless communication between a user-facing frontend and the [LangGraph4j] backend. Here’s a breakdown of the key components and their interactions:

The following diagram illustrates a diagram that shows the sequence of messages exchanged between main actors of the architecture:

![diagram](../../../../assets/langgraph-java/ag-ui/agent_workflow_ui.png)

**Explanation of the diagram:**

1.  **User & Frontend (CopilotKit):** The user interacts with a web application that has the [CopilotKit] SDK integrated. CopilotKit handles the UI rendering and state management, translating user actions into requests compliant with the [AG-UI] protocol.

2.  **Backend (langgraph4j-copilotkit):** A backend server, built with a framework like Spring Boot, includes the [langgraph4j-copilotkit] library. This library exposes an endpoint that listens for AG-UI requests from the frontend. It acts as a bridge, translating the incoming requests into executable commands for the [LangGraph4j] agent.

3.  **LangGraph4j Agent:** This is the core of the AI logic. The agent, defined as a [LangGraph4j] graph, processes the request, executes its defined workflow, and can call external tools or services as needed. The state of the graph is managed across interactions.

4.  **Tools/Services:** These are external components that the agent can interact with via the **MCP** protocol. They can be anything from a database, a third-party API, or another AI service.

The communication is typically asynchronous and streaming. As the [LangGraph4j] agent produces results or requires further input, [langgraph4j-copilotkit] streams these events back to the frontend in the AG-UI format. CopilotKit then dynamically updates the UI, creating a responsive and interactive user experience.

This architecture decouples the frontend presentation layer from the backend agentic logic, allowing developers to build sophisticated AI agents with [LangGraph4j] while providing a rich, standardized user interface with `CopilotKit`.


## Example - Approval action (Human-in-the-Loop)

This example demonstrates how to implement a "Human-in-the-Loop" (HITL) approval action using [langgraph4j-copilotkit]. The user will be asked to approve an action (`sendEmail`) before it is executed.

### Frontend

The frontend uses `@copilotkit/react-core` and `@copilotkit/react-ui` to create the chat interface and handle the approval action. The `useCopilotAction` hook is used to define the `sendEmail` action. When the action is triggered, it renders a confirmation dialog asking the user for approval.

**`chatApproval.tsx`**
```typescript
"use client";
import { useCopilotAction } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
 
export function SimpleChatWithApproval() {
  
  useCopilotAction( {
    name: "sendEmail",
    description: "Sends an email after user approval.",
    parameters: [
      { name: "address", type: "string" },
      { name: "subject", type: "string" },
      { name: "body", type: "string" },
    ],
    renderAndWaitForResponse: ({ args, status, respond }) => {
      console.debug( "renderAndWaitForResponse", respond, status, args );

      if (status === "inProgress") {
        return (
          <div>
            <h2>Sending Email</h2>
            <p>Preparing to send email...</p>
          </div>
        );
      }
      if (status === "executing") {
        return (
            <div>
              <h2>Confirm Email</h2>
              <p>Send email to <b>{args.address}</b> with subject "<b>{args.subject}</b>"?</p>
              <p><i>{args.body}</i></p>
              <div>
                <button onClick={() => respond?.('APPROVED')}>
                  Approve
                </button>
                <button onClick={() => respond?.('REJECTED')}>
                  Cancel
                 </button>
              </div>
            </div>
          );
      }
     return <></>
  }});

  return (
    <CopilotChat
      instructions={"You are assisting the user as best as you can. Answer in the best way possible given the data you have."}
      labels={{
        title: "Your Assistant",
        initial: "Hi! 👋 How can I assist you today?",
      }}
      className="w-full"
    />
  );

}
```

### LangGraph4j Agent

The backend is a [LangGraph4j] agent that defines the `sendEmail` tool. The `AgentExecutorEx` is configured to require approval for the `sendEmail` tool. When the tool is about to be executed, the agent will be interrupted, and an approval request will be sent to the frontend.

**`AGUIAgentExecutor.java`**:
```java
public class AGUIAgentExecutor extends AGUILangGraphAgent {
    // define tools
    public static class Tools {

        @Tool( description = "Send an email to someone")
        public String sendEmail(
                @ToolParam( description = "destination address") String to,
                @ToolParam( description = "subject of the email") String subject,
                @ToolParam( description = "body of the email") String body
        ) {
            // This is a placeholder for the actual implementation
            return format("mail sent to %s with subject %s", to, subject);
        }
    }

    @Override
    GraphData buildStateGraph() throws GraphStateException {

        // Create agent
        var agent =  AgentExecutorEx.builder()
                .chatModel(LLM, true)
                .toolsFromObject(new Tools())
                .approvalOn( "sendEmail",
                         (nodeId, state ) ->
                                        InterruptionMetadata.builder( nodeId, state )
                                        .build()
                )
                .build();

        return new GraphData( agent ) ;
    }

    // invoked on interruption to provide approval information back to the client
    @Override
    <State extends AgentState> List<Approval> onInterruption(AGUIType.RunAgentInput input, InterruptionMetadata<State> metadata ) {

        var messages = metadata.state().value("messages");
                .orElseThrow( () -> new IllegalStateException("messages not found into given state"));

        return lastOf(messages)
                .flatMap(MessageUtil::asAssistantMessage)
                .filter(AssistantMessage::hasToolCalls)
                .map(AssistantMessage::getToolCalls)
                .map( toolCalls ->
                    toolCalls.stream().map( toolCall -> {
                        var id = toolCall.id().isBlank() ?
                                UUID.randomUUID().toString() :
                                toolCall.id();
                        return new Approval( id, toolCall.name(), toolCall.arguments() );
                    }).toList()
                )
                .orElseGet(List::of);

    }
}
```

This setup allows for a seamless HITL workflow where the user has the final say on critical actions, all orchestrated through the AG-UI protocol and the [langgraph4j-copilotkit] integration.

### Demo

![demo](../../../../assets/langgraph-java/ag-ui/image.gif)



## Conclusion 

We can state that the future of AI development will be to have a **Unified AI Agent Ecosystem**.
The convergence of these standards like [MCP], [A2A], and [AG-UI] is a step toward this vision. 

We consider crucial keep working to improve support of them in [LangGraph4j] to provide a complete infrastructure for AI Agents to communicate with tools, collaborate with each other, and engage users in a standardized and interoperable manner.

As more frameworks and tools adopt these protocols, we can expect to see a new generation of AI-powered applications that are more flexible, extensible and, with [AG-UI], more user-centric than ever before.

Hope this could help your AI Java developing journey, in the meanwhile happy AI coding! 👋



[AG-UI]: https://ag-ui.com
[LangGraph4j]: https://github.com/langgraph4j/langgraph4j
[langgraph4j-copilotkit]: https://github.com/langgraph4j/langgraph4j-copilotkit
[CopilotKit]: https://www.copilotkit.ai/
[MCP]: https://modelcontextprotocol.io
[A2A]: https://a2aprotocol.ai