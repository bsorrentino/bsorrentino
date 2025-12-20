---
layout: post
title:  Experimenting with Javelit - The Streamlit for Java
date:   2025-12-20
description: "Exploring Javelit, the Java counterpart to Streamlit, for rapid prototyping and AI agents using LangGraph4j."
categories: ai

---
![cover](../../../../assets/langgraph-java/javelit/Javelit-langgraph4j-cover.png)
<br>
<hr>
<br>


## Starting from Python development ecosystem 

At beginning of my experience in working with Agentic Applications I've started working with Python using LangChain/LangGraph using, for testing and documenting purposes,  the simply but powerful Jupyter Notebooks. 
In the sametime to move on rapid prototyping I've used the amazing Streamlit Python framework, that allowed me to create quickly working app with a effective UI and a good UX 

## Moving from Python ecosystem to the Java one 

When I started developing [LangGraph4j], I tried to replicate my Python development ecosystem in Java. I then experimented with Java Notebooks through the [rapaio-jupyter-kernel] project, which allowed me to replicate the development experience I had with Jupyter Notebooks in Python quite well. For rapid prototyping, I relied almost entirely on Spring Boot framework, which is a fairly fast and enjoyable programming experience.

## Javelit come to play 🚀

Going on my efforts on [LangGraph4j] and continuously monitoring the most interesting and promising Java projects on GitHub, I discovered [Javelit]. This project intrigued me because of its reference to [Streamlit], and after a review, I was amazed to realize that the dynamic programming model popularized by Streamlit had been adapted for Java by this initiative, which is cool.
So I started to evaluate it as part of may java development ecosystem and below i'll share with you my experience about it.


## What is Javelit 👀

[Javelit] is a tool to quickly build interactive app frontends in Java, particularly for data apps, but it’s not limited to them. It helps you quickly develop rapid prototypes, with a live-reload loop, so that you can quickly experiment and update the app instantly.

**How it works**

> Javelit’s architecture allows you to write apps the same way you write plain Java methods. Any time something must be updated on the screen, Javelit reruns your entire Java main method from top to bottom.

So you have to think about it **as if your entire UI code runs inside a continuous loop** that refreshes whenever something needs updating on the screen.

[Javelit] provides developers with a rich set of prebuilt [components](https://docs.javelit.io/develop/api-reference) that make it easy to get started. 

Just to provide you an idea of the [Javelit] approach below the inevitable "*Hello World*" code snippet

```java
/// usr/bin/env jbang "$0" "$@" ; exit $?
import io.javelit.core.Jt;

public class App {

    public static void main(String[] args) {
        Jt.title("Hello World!").use();
        Jt.markdown("""
            ## My first official message
            Hello World!
            """).use();
    }
}
```

Then, once [Javelit] is [installed](https://docs.javelit.io/get-started/installation/standalone#install-javelit), you’d run it with the following command:

```
javelit run App.java
```

## Use Javelit with LangGraph4j

I've decided to use [Javelit] to develop some examples of [LangGraph4j] usage and below I'll show you how have used [Javelit] to implement a demo app to run the **LangGraph4j powered React Agent**. 
For simplicity I'll report only the meaningful code snippets, but for a complete code take a look to [`JtAgentExecutorApp.java`](https://github.com/langgraph4j/langgraph4j/blob/main/spring-ai/spring-ai-agent/src/test/java/JtAgentExecutorApp.java) for [spring AI] based implementation. 

As [Streamlit] in [Javelit] entire application constist in just one `main()` method.

```java
public class JtAgentExecutorApp {

    public static void main(String[] args) {

        Jt.title("LangGraph4J React Agent").use();

        try {
            // create a LangGraph4j Agent
            var agent = AgentExecutor.builder()
                .chatModel(/* instantiate the preferred ChatModel */)
                .toolsFromObject( new MyTools() /* Custom Tools */  )
                .build()
                .compile(); 

            // input: the user message
            var userMessage = Jt.textArea("user message:")
                    .placeholder("user message")
                    .labelVisibility(JtComponent.LabelVisibility.HIDDEN)
                    .use();

            // button: start agent processing 
            var start = Jt.button("start agent")
                    .disabled(userMessage.isBlank())
                    .use();

            if (start) { // if button pressed

                var outputComponent = Jt.expander("Workflow Steps").use();

                var input = GraphInput.args(Map.of("messages", new UserMessage(userMessage)));

                var generator = agent.stream(input);

                final var startTime = Instant.now();

                for( var step : generator ) {
                
                    Jt.sessionState().remove("streaming");
                    Jt.info("""
                            #### %s
                            %s
                            """.formatted(s.node(),
                            s.state().messages().stream()
                                    .map(Object::toString)
                                    .collect(Collectors.joining("\n\n")))
                    ).use(outputComponent);
                }

                final var elapsedTime = Duration.between(startTime, Instant.now());

                Jt.success("finished in %ds%n".formatted(elapsedTime.toSeconds())).use();
                
            }
        } catch (Exception e) {
            Jt.error(e.getMessage()).use();
        }

    }

}
```

The output of the [Javelit] app looks like: 

**Chat model selection view**
> ![image1](../../../../assets/langgraph-java/javelit/javelit-app-01.png)

**Start agent view**
![image2](../../../../assets/langgraph-java/javelit/javelit-app-02.png)

**Results view**
![image3](../../../../assets/langgraph-java/javelit/javelit-app-03.png)

### 👉 try yourself 👀 🚀 🤯

If you want try jourself (after installed [javelit]) run the command 
```
javelit run https://github.com/langgraph4j/langgraph4j/tree/main/spring-ai/spring-ai-agent/src/test/java
```

## Conclusion

[Javelit] brings the power of rapid prototyping and interactive web app development to the Java ecosystem, much like [Streamlit] does for Python. With its simple, loop-based programming model, developers can quickly build data-driven applications without needing extensive frontend knowledge, leveraging familiar Java syntax and the rich JVM ecosystem. The live-reload feature enables instant experimentation and iteration, making it ideal for prototyping AI agents, data visualizations, and interactive tools. By integrating seamlessly with libraries like [LangGraph4j] combined with both [Spring AI] and [LangChain4j], [Javelit] empowers Java developers to create engaging user interfaces effortlessly, bridging the gap between backend logic and user-facing applications.  
Checkout project, try it and let me know your feedback and ... happy AI coding! 👋

## References

* [Javelit to create quick interactive app frontends in Java](https://glaforge.dev/posts/2025/10/24/javelit-to-create-quick-interactive-app-frontends-in-java/)

[langgraph4j]: https://github.com/langgraph4j/langgraph4j
[spring ai]: https://spring.io/projects/spring-ai#overview
[langchain4j]: https://docs.langchain4j.dev
[streamlit]: https://streamlit.io
[Javelit]: https://javelit.io
[jbang]: https://www.jbang.dev/

