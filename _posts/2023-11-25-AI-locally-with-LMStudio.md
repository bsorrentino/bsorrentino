---
layout: post
title:  "Unleashing AI Power Locally: Using LM Studio"
date:   2023-11-25
description: "A dive into LM Studio: Simplifying Local Deployment of Open-Source Large Language Models."
categories: ai
---

### Introduction

In my experience dealing in developing AI powered applications using [langchain] framework, I arrived to need to involve a local LLM model. So I started searching for some guides or videos and at the end I landed on video: "[Run ANY Open-Source Model LOCALLY][video1]". Seeing this very interesting video, I have realized that in the fast-paced realm of AI, open-source large language models have become increasingly accessible, particularly thanks to the [🤗 Hugging Face] portal and I discovered existence of [LM Studio] a freely downloadable tool designed to simplify the deployment and run of open-source large language models on local machines. Below I summarise the main features offered by [LM Studio] which enable users to quickly explore and test the “open-source LLM”’s world

### LM Studio features

[LM Studio]'s user-friendly interface and cross-platform availability make it an attractive choice for a wide range of users. Key features and usage guidelines include:

1. **Platform Compatibility:** [LM Studio] is available for Apple, Windows, and Linux systems, ensuring wide accessibility.

2. **Ease of Installation:** The installation process is straightforward, making the software accessible even to those with limited technical background.

3. **Model Exploration and Selection:** Users can browse and select from a variety of models available on the Hugging Face platform. [LM Studio] provides detailed information for each model, aiding in informed decision-making.

|  search model 🔍|
| ------- |
| ![][sh3] |  

4. **Model Management:** The software allows for efficient management of different model versions, including quantized versions, tailored to the user's system specifications.

|  manage model 👀|
| ------- |
| ![][sh4] |  


5. **Interactive Chat Interface:** An integral feature of [LM Studio] is its chat interface, which allows users to interact with the models. This interface includes adjustable settings for various model parameters, enhancing user control.

| chat with model 💬📋|
| ------- |
| ![][sh5] |  

6. **Developer Tools:** For developers looking to integrate large language models into their applications, [LM Studio] offers a local server feature. This feature is compatible with OpenAI's API, facilitating easy integration.

| start server 🚀|
| ------- |
| ![][sh6] |  


7. **Efficient Storage Management:** Users can manage the models on their system efficiently, adding or removing them as needed to manage storage space effectively.

|  file management 🗂️|
| ------- |
| ![][sh7] |  


### Conclusion

[LM Studio] emerges as a powerful and user-friendly tool for anyone interested in exploring and utilizing large language models. It is suitable for both personal experimentation and professional application development. [LM Studio] democratises access to AI technology, enabling users to leverage the power of large language models on their local machines.

I'm already using it and it works great. I highly recommend checking it out to have a better understanding of the LLM models ecosystem, which isn't limited only to GPT 3/4. 🤨

Let me know your experience on its usage 💬👋

[🤗 Hugging Face]: https://huggingface.co
[LM Studio]: https://lmstudio.ai
[video1]: https://www.youtube.com/watch?v=yBI1nPep72Q
[langchain]: https://www.langchain.com
[sh3]: ../../../../assets/LMStudio/LMStudio_1.png
[sh4]: ../../../../assets/LMStudio/LMStudio_2.png
[sh5]: ../../../../assets/LMStudio/LMStudio_3.png
[sh6]: ../../../../assets/LMStudio/LMStudio_4.png
[sh7]: ../../../../assets/LMStudio/LMStudio_5.png