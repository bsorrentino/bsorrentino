---
layout: post
title:  "AI multi prompt browser extension"
date:   2023-10-16
categories: ai
---

## Problem: Use multiple AI Chat at same time.

After the launch of ChatGPT, which is quickly changing the way we handle tasks we need, we are witnessing the birth of numerous alternatives. Each of these specializes in a particular task and tries to stand out from the others.

This presents us with the following dilemma: 
> **Do we choose one AI chat and always use that, or do we use more than one, selecting the best response each time?**

My choice has been to use more than one. Specifically, in my day-to-day work, I use: ChatGPT, Phind, Bard, and Perplexity. These guarantee a wide range of responses that I can assess each time.

Of course, such choice means that I must submit the same prompt to multiple AI chats, which can sometimes be tedious task.

## One Solution

To solve this problem, I decided to develop a Browser Web Extension that could help me submit the same prompt to multiple AI chats simultaneously.

In this article, I will briefly explain how it works and how to get and use it if, like me, you use more than one.

## Develop a Chrome Web Extension

Since I use mostly Chrome Browser my first implementation has been focused on Chrome Web Extension also if I'd take in account to port such implementation on other browser like Safari and Edge if requested.

### The requirements

Idea was to create an extension that detect if there are (supported) AI Chat opened in browser tabs gather them and open a popup that allow to input a prompt that will be submitted simultaneously to each AI Chat identified.

### The challenges

The only development’s challenge here, has been **simulate of what a user does to submit a prompt**. To achieve this has been needed to analyze each AI Chat web page to identify the HTML component that play the role of prompt (ie. textarea), the submit button (ie. button) and write a tailored javascript code for each of them. Below a code snippet extracted by implementation provided for [ChatGPT]

```typescript
/**
 * Submits the given prompt text to the ChatGPT playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
const chatgptSubmit = (prompt) => {

    const promptElem = document.querySelector("form #prompt-textarea");

    if (!promptElem) {
        console.warn("prompt not found!");
        return;
    }

    promptElem.value = prompt;

    promptElem.dispatchEvent(new Event('input', { 'bubbles': true }));

    const parentForm = promptElem.closest("form");

    const buttons = parentForm.querySelectorAll("button");

    if (buttons && buttons.length > 0) { // get last button

        const submitButton = buttons[buttons.length - 1];
        submitButton.click();

    }

}  
```

### Implementation choice drawbacks

However, it's important to note that as AI webpages evolve and change, so too must the implementation of the extension. Since the extension is specifically designed to work with the unique elements and structure of each AI chat platform, any updates or modifications to these platforms could potentially render the extension incompatible or less effective. Therefore, users should be aware that ongoing maintenance and updates may be necessary to ensure seamless integration with their preferred AI chat platforms. 

### The result

After a couple of hours of development and bit more ones of tests finally I’ve released the first working release and the result is shown below

![pic1](../../../../assets/ai-multi-prompt-browser-extension/pic1.png)

It seems work as expected and I’m using it intensively following the approach “_Eat your own dog food_” (aka [dogfooding]) to assure quality and improvements as much as I can**.**

### Usage tips 🔧

To make the most out of the AI Multi Prompt extension :

> Open the AI chats that you want use simultaneously in different browser tabs and **pin them** so they will be always available to the extension 😎

Give it a try and enhance your AI chat experience 😊

### Current features

- Support [ChatGPT], [Bard], [Perplexity], [PHind]
- Enable/Disable selectively submit to Chat
- Copy prompt to the Clipboard
- Remember last submitted prompt

### Future features

- Add support for [Bing Chat][bing] on [Edge]
- Add support for chat history browsing and submitting

## Conclusion

I've released the project on [GitHub], including the [Safari implementation][safari], but have not yet published it on an online market. To try it out, you'll need to clone the repo and following the steps [load unpack extension][load-unpacked] to load the extension on your browser.

Feel free to fork the repo and collaborate to its enhance … thanks and happy AI chatting 💬🤖.


[chatgpt]: https://chat.openai.com/
[bard]: https://bard.google.com/
[perplexity]: https://perplexity.ai/
[phind]: https://phind.com/
[github]: https://github.com/bsorrentino/AI-MultiPrompt-Extension
[chrome]: https://www.google.com/chrome/
[load-unpacked]: https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked
[bing]: https://www.bing.com/business/ai-chat
[safari]: https://developer.apple.com/documentation/safariservices/safari_web_extensions
[lex]: https://aws.amazon.com/lex/
[edge]: https://www.microsoft.com/en-us/edge
[dogfooding]: https://en.wikipedia.org/wiki/Eating_your_own_dog_food

