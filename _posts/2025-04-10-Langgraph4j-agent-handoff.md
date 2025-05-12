---
layout: post
title:  LangGraph4j - Multi-Agent handoff implementation with Spring AI
date:   2025-05-10
description: "Implement multi-Agent handoff using function calls feature"
categories: ai

---
![cover]
<br>
<hr>

**Multi-agent architectures** are the new trend in Artificial Intelligence field for realizing complex and innovative solutions. One of the architectural patterns that has garnered attention is "**Agents Handoff**". In this article we will explore an approach to developing this multi-agent architecture providing also a practical implementation using [Langgraph4j] and [Spring AI]. 

##  Understanding multi-Agent Architecture 

Multi-agent systems consist of multiple interacting agents, each designed to perform specific tasks. These agents can be homogeneous or heterogeneous, functioning independently or collaboratively to achieve common goals. The essence of multi-agent architecture lies in the coordination and communication among agents, ensuring seamless execution of complex processes. 

## Defining Agents Handoff 

Agents Handoff refers to the mechanism where control and data (_context_) are transferred from one agent to another, enabling continuous and efficient task execution. This concept is pivotal in scenarios where tasks require diverse expertise or when tasks need to be distributed among multiple agents to optimize performance. 

## How to implement Agents Handoff ?

We will examine the concept of using [function calls] (aka `tools`) as an enabler to implement the agent's handoff technique. Therefore, it is important to take a closer look at the "function calling" feature and its role in AI models. 

### The role of _Function Calls_ in AI Models 

Function calls in AI models serve as the backbone for agents allowing them to invoke specific functions, share data, and execute tasks collaboratively. By leveraging function calls, developers can design agents that interact dynamically, responding to changes in the environment and adapting to new information in real-time. 

The diagram below presents the architecture of a [ReAct Agent], highligting the role that function calls play within the framework.

 Diagram1 - _ReAct Agent: Function Calling Anatomy_ |
  --- |
 ![diagram1](../../../../assets/agent-handoff/diagram1.png) |

It is interesting to note that the LLM reasoning process formulates an **actions execution plan**, which supports the underlying infrastructure responsible for **dispatching, executing, and gathering results** of actions. 

### Action as Agent 🧐

Given that LLM creates a clear action plan based on its input, **what if another agent is behind these actions?**  below a diagram that show it 

_Diagram2_ - _Action as Agent_ |
  --- |
![diagram2](../../../../assets/agent-handoff/diagram2.png) |

This means that: If we **describe the functionalities of an action such as the agent capabilities**, we can rely on the actions execution plan to automatically achieve the agent handoff by utilizing its infrastructure for execution and result gathering. 

In this scenario to adapt Action as Agent, we need to define: 

* **Function description**: 
  > This will outline the role and capabilities of the Agent. It is essential to provide this information to the LLM so it can produce an appropriate "Actions execution plan." 

* **Function parameters**: 
  > These are the inputs that the agent will use within its operational context. By default, there will be one parameter named 'context.' 


### Multiple Actions as Agents

Iteratively we can continue to add new actions as agents making complex multi agents scenarios.

_Diagram3_ - _Multiple Actions as Agents_ |
  --- |
![diagram3](../../../../assets/agent-handoff/diagram3.png) |

## Reference Implementation using [Langgraph4j] and [Spring AI]

A [reference implementation] has been developed in the [Langgraph4j] project. The [Langgraph4j] provides a [ReACT Agent] (aka `AgentExecutor`) built-in implementation, which has been extended to support Agents’ handoff architecture.  

The main classes include the `AbstractAgentExecutor`, combining an `AgentExecutor` with a `Function`, and AgentHandoff that enhances `AgentExecutor` by adding the capability to integrate implementations of AbstractAgentExecutor into its tool chain. 

### Let's dive in an example 

In this example we'll create two agent, one responsible of the search product into referred marketplace and another one responsible for purchasing and payment referred to a bank account

#### Let's setup the `AgentMarketplace`

```java
public class AgentMarketplace extends AbstractAgentExecutor<AgentMarketplace.Builder> {

    // define internal agent tools 
    static class Tools {
        record Product(
                @JsonPropertyDescription("the product name") String name,
                @JsonPropertyDescription("the product price") double price,
                @JsonPropertyDescription("the product price currency") String currency) {}

        @Tool( description="search for a specific product in the marketplace")
        Product searchByProduct(@ToolParam( description="the product name to search") String product ) {
            // custom implementation, return matching product
        }
    }

    // define Agent builder
    public static class Builder extends AbstractAgentExecutor.Builder<AgentMarketplace.Builder> {
        // build the Agent 
        public AgentMarketplace build() throws GraphStateException {
            this.name("marketplace") // set name
                // agent description (tool description)
                .description("marketplace agent, ask for information about products")
                // agent input description (tool parameter description) 
                .parameterDescription("all information request about the products") 
                .defaultSystem( """
                    You are the agent that provides the information on the product marketplace.
                """) // set the system prompt
                .toolsFromObject( new Tools() ) // load internal tools
            ;

            return new AgentMarketplace( this );
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    protected AgentMarketplace(Builder builder) throws GraphStateException {
        super(builder);
    }   
}
```

#### Let's setup the `AgentPayment`

```java
public class AgentPayment extends AbstractAgentExecutor<AgentPayment.Builder> {

    // define internal agent tools 
    static class Tools {

        record Transaction(
                @JsonPropertyDescription("the product name bought") String product,
                @JsonPropertyDescription("code operation") String code
        ) {}

        @Tool(description="submit a payment for purchasing a specific product")
        Transaction submitPayment(
                @ToolParam( description="the product name to buy") String product,
                @ToolParam( description="the product price") double price,
                @ToolParam( description="the product price currency") String currency,
                @ToolParam( description="International Bank Account Number (IBAN)") String iban ) {
            // custom implementation, purchase given product and return the transaction info
        }

        @Tool(description="retrieve IBAN information")
        String retrieveIBAN()  {
            // custom implementation, return the IBAN
        }

    }

    public static class Builder extends AbstractAgentExecutor.Builder<AgentPayment.Builder> {

        public AgentPayment build() throws GraphStateException {
            this.name("payment") // set name
                // agent description (tool description)
                .description("payment agent, request purchase and payment transactions") 
                // agent input description (tool parameter description)
                .parameterDescription("all information about purchasing to allow the payment") 
                .defaultSystem( """
                You are the agent that provides payment service.
                """) // set the system prompt
                .toolsFromObject( new Tools() ) // load internal tools
                ;

            return new AgentPayment( this );
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    protected AgentPayment(Builder builder) throws GraphStateException {
        super(builder);
    }
}
```
####  Let's setup the Agent handoff (Final step)

```java

var model = OllamaChatModel.builder()
                        .ollamaApi( new OllamaApi("http://localhost:11434") )
                        .defaultOptions(OllamaOptions.builder()
                            .model("qwen2.5:7b")
                            .temperature(0.1)
                            .build())
                        .build();

var agentMarketPlace = AgentMarketplace.builder()
            .chatModel( model )
            .build();

var agentPayment = AgentPayment.builder()
        .chatModel( model )
        .build();

var handoffExecutor = AgentHandoff.builder()
        .chatModel( model )
        .agent( agentMarketPlace )
        .agent( agentPayment )
        .build()
        .compile();
```
#### Test it

To make a test, it is necessary to submit a request to `handoffExecutor`. This process will automatically engage the appropriate agents to complete the request. 

```java
var input = "search for product 'X' and purchase it";

var result = handoffExecutor.invoke( Map.of( "messages", new UserMessage(input)));

var response = result.flatMap(MessagesState::lastMessage)
        .map(Content::getText)
        .orElseThrow();

System.out.println( response );
```

## Bonus: use an [MCP Server] as an Agent

Since Agents rely on tools to perform handoffs to another Agent, it is possible to use the [MCP Server], in combination with the [sampling] feature, to provide Agents suitable for a handoff architecture (this is an interesting matter for another article 😎 does it?) 

## Conclusions

In this article, we've explored a practical approach to implementing multi-agent handoffs using [Langgraph4j] and [Spring AI], leveraging the power of function calls to enable seamless transitions between specialized agents. The reference implementation demonstrates how to define agents for specific tasks and orchestrate their interactions to achieve complex goals.  
By treating actions as agents, we can build sophisticated systems that mimic human collaboration, opening new possibilities for AI-driven solutions.  

Hope this helps in some way your AI development journey, Happy AI coding! 👋 


[cover]: ../../../../assets/agent-handoff/cover.png
[Langgraph4j]: https://github.com/bsorrentino/langgraph4j
[Spring AI]: https://spring.io/projects/spring-ai
[function calls]: https://platform.openai.com/docs/guides/function-calling
[ReACT Agent]: (https://github.com/bsorrentino/langgraph4j/blob/main/spring-ai-agent/README.md)
[reference implementation]: https://github.com/bsorrentino/langgraph4j/tree/main/samples/agents-handoff

[MCP Server]: https://modelcontextprotocol.io/introduction
[sampling]: https://modelcontextprotocol.io/docs/concepts/sampling