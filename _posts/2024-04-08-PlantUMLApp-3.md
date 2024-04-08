---
layout: post
title:  "PlantUMLApp 3.0 - let's play with AI multimodality "
date:   2024-04-08 08:00:00 +0200
categories: app
---

![cover](../../../../assets/plantuml-app/plantuml-app-cover.png)
<br>
## Version 3.0 is out!

New version `3.0` of my [PlantUML App for iPad][app] is out with  exciting update! 🤩 The new **multi-modality** feature now lets you transform hand-drawn diagrams into [PlantUML] scripts with just a pencil ✍🏻 or your fingers 👆. Take a look 👀 to this short on [YouTube] and download it from [App Store][app] to support me 👍🏻.

## The Multi Agents Collaboration

In this app I've used **Multi-Agents-Collaboration** using the [LangGraph for Swift][langgraph-swift] framework, applying the process shown in the diagram below:

![](../../../../assets/plantuml-app/drawing-to-diagram.png)

As you can see I've used three Agents with different capabilities:

### Agent Vision 
This agent able to process images, it is skilled on describe a diagram producing a **structured output** containing also the diagram tipology useful to involve the right Agent for further processing.
> This increase the flexibility of system because the image is translated in structured data that can be processed by agents with differents skills and goals

### Agent Tranlator(1)
This agent is skilled on PlantUML sequence diagram. It get the diagram data and translate them in the PlantUML script

### Agent Tranlator(2)
This agent is skilled on PlantUML generic process diagram. It gets the diagram data and translate them  in PlantUML script


## Conclusion 

The **Multi-Modality** is a capability for enabling AI to interact with and interpret the diverse range of information that humans encounter in everyday life. Unlock such capability can be crucial to amplify the effectiveness of your AI process.
I've started to explore it and in the next App version I'd like to introduce a process to auto-correct errors providing to the agents execution feedbacks, soo stay tuned! In the meanwhile, enjoy coding! 👋 


## References

* [Video (YouTube Short)][YouTube]
* [App Store][app]
* [AI Agent on iOS with LangGraph for Swift](https://bsorrentino.github.io/bsorrentino/ai/2024/03/21/langgraph-for-swift.html)
* [PlantUML meets OpenAI on iPad](https://bsorrentino.github.io/bsorrentino/app/2023/04/11/plantum-meets-gpt-on-ipad.html)

[langgraph-swift]: https://github.com/bsorrentino/LangGraph-Swift
[PlantUML]: https://plantuml.com/
[YouTube]: https://youtube.com/shorts/YSSHpW2MyC8
[app]: https://apps.apple.com/us/app/plantuml-app/id6444164984

