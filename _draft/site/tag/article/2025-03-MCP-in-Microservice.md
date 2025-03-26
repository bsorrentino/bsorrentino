# Bridging the Gap: Using Model Context Protocol (MCP) in microservice architecture
> From BFF to BFA: Adapting the Backends for Frontends Pattern for AI Agents in Backend For Agents (BFA) Architectures


Backends for Agents (BFA): Tailoring Backend Interactions for AI in the Age of LLMs

Empowering Intelligent Agents: The Backend For Agents (BFA) Architecture 

Optimizing Backend Interactions for AI Agents: Introducing the Backend For Agents (BFA) Pattern

The Agent-Centric Backend: Implementing Backends for Agents (BFA) with Model Context Protocol (MCP) 

BFA: The Missing Link Between AI Agents and Your Backend Services?

Leveraging Model Context Protocol (MCP) to Build Scalable Backends for Intelligent Agents (BFAs)

Considering Backends for Agents (BFA): Benefits and Trade-offs for AI-Driven Applications 

Tailored Context and Tools: The Role of Backend For Agents (BFA) in Empowering LLM-Powered Applications via MCP

---

The rise of Model Context Protocol(MCP) as strategic  in building Agentic Architecture are becoming unstoppable, MCP seems bridge the gaps for developing scalable & reusable Agents application.

At beginning the **function-call** feature seemed immediately a disruptive feature that would give us the possibility to move from reasoning to acting (ReACT) in the AI powered applications. 

The idea behind the **function-call** standardization was that the callable actions were, conceptually, embedded within the agentic applications themselves. 

Since then, many ReACT-based agentic applications have been implemented that incorporate actions, until the announcement and release by the Cloude team of the Model Context Protocol (MCP) that gave an innovative push to **function-call** promoting a new architecture for ReACT-based agentic applications that is more modern, reusable and scalable that, from my point of view, winks at the Cloud and Microservices, also  opening up to the possibility of marketplaces for LLM-aware actions (Agent Action Store).

In this article I do not want to explain (again) all the features of MCP or list all the already available awesome MCP servers, but I would like to explore a possible approach to reuse microservices already existing in the company or purchased from third parties to create agentic applications that can exploit all their potential.

## Reuse the Backend For Frontends (BFF) pattern

During my experience in developing microservice architectures I have come across many patterns for solving the most diverse problems. One that has been very effective in my case is the one called "Backend for Frontend (BFF)" which introduces an intermediary layer (the BFF service) between frontend clients and backend services to tailor experiences for specific client interfaces. This pattern helps avoid customizing a single backend for multiple interfaces with different needs. This allows for optimization for specific frontend requirements, frontend teams' autonomy over their backend, and mitigation of competing demands on a single backend service. This pattern is useful when a shared backend has significant development overhead or when optimization for specific clients is needed.

I see some analogies in the problem of having to adapt our services to be used by agentic applications with the BFF pattern and therefore we could consider implementing a new pattern called Backend For Agent (BFA) in which the MCP protocol plays a leading role.



That's an interesting adaptation of the Backends for Frontends (BFF) pattern! Your idea of using Backends for Agents (BFA), where AI Agents are the frontends and the communication with underlying services happens via the Model Context Protocol (MCP), has a strong basis in the principles of the original pattern.
Let's break down how this adaptation aligns with the sources:
The Backends for Frontends (BFF) pattern is designed to decouple backend services from the frontend implementations to tailor experiences for different client interfaces. This is particularly useful when a backend serves multiple interfaces with varying capabilities and needs. The core idea is to introduce an intermediary layer, the BFF service, between the frontend client and the backend service, with a dedicated BFF for each interface if needed. This allows for:
•
Tailored client experience without affecting other interfaces.
•
Performance optimization specific to the frontend environment.
•
Frontend team autonomy over their specific backend, including technology choices and release cycles.
In your proposed adaptation:
•
The AI Agents take the role of the "frontends." Like web or mobile interfaces, different AI Agents might have distinct requirements in terms of the data they need, the format of that data, and the specific interactions they need with the underlying services.
•
The Backends for Agents (BFA) become the intermediary layer. Just as a traditional BFF handles the specific needs of a web or mobile app, a BFA would handle the unique requirements of a particular AI Agent or a group of similar agents. This could involve data aggregation, transformation, and orchestration tailored to the agent's capabilities and tasks.
•
The communication between the BFA and the original "backends" would occur using the Model Context Protocol (MCP). According to the documentation, MCP is built on a flexible, extensible architecture that enables seamless communication between LLM applications (which could include AI Agents or systems managing them) and integrations (your original backends). MCP follows a client-server architecture, where the BFA could act as an MCP client and the underlying services could implement MCP servers to provide context, tools, and prompts relevant to the AI Agents' requests.
The benefits you might see from this BFA adaptation, drawing parallels with the original BFF pattern, could include:
•
Tailored data and interactions for AI Agents: Each agent can receive data in the format it best understands and can interact with the underlying services in a way that is optimized for its specific logic and capabilities.
•
Abstraction of backend complexity: The AI Agents don't need to directly understand the intricacies of each backend service. The BFA can handle the complexities of data retrieval and manipulation using MCP.
•
Improved development and iteration speed for AI Agents: Teams developing AI Agents can focus on the agent's core logic without being tightly coupled to the evolution of the underlying backend services. The BFA can act as a stable intermediary.
However, it's also important to consider the issues and considerations outlined for the traditional BFF pattern:
•
Increased operational overhead: Introducing a BFA layer will add more services to maintain and deploy. Each BFA will have its own lifecycle, deployment, and security needs.
•
Potential for increased latency: The introduction of the BFA adds an extra network hop in the request-response cycle.
•
Code duplication: If multiple AI Agents have similar but not identical needs, there might be a temptation to duplicate logic across different BFAs. You'd need to evaluate the tradeoff between this and providing a highly tailored experience.
•
Complexity of managing multiple BFAs: Determining the optimal number of BFA services and managing their evolution could become complex.
The choice of using MCP for communication between the BFA and the backends could be beneficial as it provides a structured way to exchange messages including requests, results, errors, and notifications. MCP also supports different transport layers like stdio for local processes and HTTP with SSE for remote communication, which could offer flexibility depending on how your AI Agents and backend services are deployed.
It's also worth noting that the source mentions that GraphQL implementations are becoming an alternative to BFFs in some cases because the querying mechanism doesn't require a separate endpoint. If your AI Agents can effectively utilize a GraphQL API provided by the underlying services, and if their needs are not significantly different, you might need to evaluate if the added complexity of a BFA layer is truly necessary. Similarly, if you are already using an API Gateway with microservices, this approach might already provide sufficient abstraction and routing capabilities, potentially reducing the need for BFAs.
In summary, your idea of adapting the BFF pattern to a BFA pattern with AI Agents as frontends and MCP for backend communication is conceptually sound based on the principles described in the sources. It could offer significant benefits in terms of tailoring backend interactions to the specific needs of AI Agents. However, you should carefully consider the potential operational overhead, latency, and complexity introduced by this additional layer, as highlighted in the context of the traditional BFF pattern. You should also evaluate whether existing architectural patterns or technologies like GraphQL or API Gateways could already address your needs.