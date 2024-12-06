---
layout: post
title:  From Audio To Mind-Map
date:   2024-12-06
description: "Use AI to generate a mind-map diagram from audio and transcript"
categories: ai

---
![cover](../../../../assets/from-audio-to-mindmap/cover.jpg)
<br>

## Idea 💡

Idea was to develop an application that allow from an Audio concerning a discussion, a meeting, etc ... to generate a "_meaningful mind-map diagram_", that represent the touched key points. This representation joined with summary provide a more complete and understandable informations 

## Architecture of solution

The architecture of the solution is shown below:

![Image description](../../../../assets/from-audio-to-mindmap/diagram01.png)

The agentic architecture is composed by a series of agents, each one responsible for a specific task. The sequence of agents is: 

1. **transcribe-from-audio**: This agent is responsible to transcribe the provided audio.

1. **keypoints-from-transcript**: This Agent is responsible to extract the Keypoints inside the given transcription

1. **summary-to-mindmap**: This agent is responsible to arrange the key points in a kind of ontology providing a hierarchical representation of information

1. **mindmap-to-mermaid**: This agent is responsible to transform the mind-map representation in a [mermaid](https://mermaid.js.org) syntax ready for the visualization

Notes: 👈 
> As shown in the diagram, the architecture allows you to bypass the transcription stage if you already have a transcription.

## Demo

I've developed a demo app for the [AssemblyAI Challenge](https://dev.to/challenges/assemblyai) as a   *Sophisticated Speech-to-Text* use case.

The application is available [here](https://bsorrentino.github.io/MapifyAI/),  for access to voice functionality you need an **[AssemblyAI] Api Key** while for ather agents you need an **[OpenAI] Api Key**.

Below there are some representative screenshots

### Settings 
![Settings](../../../../assets/from-audio-to-mindmap/settings.jpg)

### Upload Audio
![Upload Audio](../../../../assets/from-audio-to-mindmap/upload.jpg)

### Transcribe Audio 
![Transcribe Audio](../../../../assets/from-audio-to-mindmap/transcribe.jpg)

### Generate Mindmap Diagram
![Generate Mindmap Diagram](../../../../assets/from-audio-to-mindmap/mindmap.jpg) 

## Conclusion 

I think that this idea could be further extended enabling different kind of transcript analisys like for example **Problem-Solution Mapping**, **Questions and Answers Mapping**, **Topics and Subtopics Mapping** and others.
The possibilities are truly endless and the only limit is in imagination 💭🤔💡.

I hope that this idea will be helpful in some way in creating value around, in the meanwhile, enjoy AI coding! 👋

## References

* [From Audio To Diagram (dev.to)](https://dev.to/bsorrentino/from-audio-to-diagram-4ie8)


[AssemblyAI]: https://www.assemblyai.com
[OpenAI]: https://openai.com/api/

