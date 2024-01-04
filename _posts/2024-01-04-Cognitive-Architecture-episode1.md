---
layout: post
title:  "Cognitive Architecture of smart applications (episode 1)"
date:   2024-01-04
description: "Understand Cognitive Architecture to build smart applications"
categories: ai
---


## Introduction

Before exploring cognitive architecture, let's clarify our role in the AI landscape. This will help us determine if such architecture can be really useful for our objectives.

### What is our role in AI landscape ?

First we have to determine whether we are AI users or AI developers. The diagram below illustrates the different aspects of the AI landscape, specifically focusing on the [OpenAI] ecosystem (although this can be generalised to other AI providers). By understanding our goals with AI, we can identify the specific role we need to take on.

![image1](../../../../assets/cognitive-architecture/img_01.png)

### AI User
> An AI user interacts with AI assistants (ie Chat) where the main problem is to submit the right questions to have the expected answers, relying on the capabilities of the assistants itself

### AI Developer
> an AI developer works with AI services (ie API) where the main problem is to orchestrate such services inside applications to deliver innovative and disruptive services. 

Obviously the greater part of usage of AI, currently, is as consumers using [ChatGPT], [Bard] (aka Gemini), [Copilot], etc… In terms of cloud tiers, this falls under the [Software as a Service (SaaS)][saas] category. However, as developers, we should also consider the [Platform as a Service (PaaS)][paas] category and choose the appropriate frameworks and tools for building solutions.

So  the question is: "Are we ready to embrace AI development and add new smart services to our applications through AI models?".

If answer is yes, we have to start learning the new emerging cognitive architecture and its patterns to be ready for the new development challenges that AI and in particular the [large language models (LLM)][LLM] are putting in front of us.

## The Cognitive Architecture

The raise of AI and in particular of the [LLM], has started a race to create game changer applications that use Al to deliver innovative and disruptive services.

For this reason new application architecture involving [LLM] has been developed focusing on:

* how provide context to the application
* how does the application “reason” over it
* how application use outcome from reasoning

The methods and patterns used to complete these tasks are referred to as the **<u>cognitive architecture</u> of an application** which is a  cool term to describe this new kind of smart applications. 

### PaaS vs MaaS

As AI developer  we have to consider accessing to AI models using [PaaS] services but we must keep in mind that a new ad-hoc tier is coming to play that is **<u>Model as a Service (MaaS)</u>**. **MaaS** is an emerging concept in cloud eco-system that allows access to a variety of pre-built, pre-trained machine learning models in a standardised manner. These models cover a wide range of AI tasks simplifing the process of integrating AI capabilities into applications.

### Conclusion 

Well, in this article we have just introduced the Cognitive Architecture concept and the challenges that we will face as AI developer of smart application. In the next article, we will explore bit more the cognitive architecture, including the most commonly used patterns and when and how to apply them to popular use cases. In the meanwhile ... happy "cognitive" coding

### References

* [OpenAI's Bet on a Cognitive Architecture](https://blog.langchain.dev/openais-bet-on-a-cognitive-architecture/)

[saas]: https://en.wikipedia.org/wiki/Software_as_a_service
[paas]: https://en.wikipedia.org/wiki/Platform_as_a_service
[ChatGPT]: https://chat.openai.com/
[Bard]: https://bard.google.com/chat
[Copilot]: https://copilot.microsoft.com/
[OpenAI]: https://openai.com/
[article1]: https://blog.langchain.dev/openais-bet-on-a-cognitive-architecture/
[LLM]: https://en.wikipedia.org/wiki/Large_language_model