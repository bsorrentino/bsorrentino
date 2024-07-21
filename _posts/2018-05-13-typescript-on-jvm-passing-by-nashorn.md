---
layout: post
title:  Typescript on JVM passing by Nashorn 
date:   2018-05-13
description: "How to use Typescript/Javascript in Java applications."
categories: java

---
<!--
![cover](../../../../assets/http_streaming/http-streaming.png)
-->
<br>

## The last trend, from Java to Javascript 

I’ve developed a lot with Java (until java 8) but lately I'm progressively, for several reasons, moving to other programming languages with a prevalence of JavaScript.  

Yes, this means that I’m becoming a full stack developer using, mainly, ionic/angular for front-end development and [nodejs] for back-end development.  

### Use typescript as an enhanced Javascript 

Really, more than working with JavaScript, I use [typescript] that I consider a must-use for developing on javascript-aware environment/runtime. 

> A deep dive in [typescript] is not the objective of this article, for now consider [typescript] an enhanced JavaScript that transpile itself in pure javascript so when we’ll use the [typescript] word will imply that being the scene there is javascript 

## The Enterprise dilemma - Javascript on back-end 

However, in my opinion javascript/angular/[nodejs] is a great technology stack but, working as consultant in Enterprise projects, there is a resistance to move back-end out of Java space (ie. comfort zone) because they want preserve know-how and reuse all the java stuff that they have selected/developed/tested during projects lifecycle  

 

In any case also for the enterprise, although mainly for front-end development, the javascript know-how are becoming rapidly a must-have so in this context from a while my dilemma has become: 

1. Is it possible move to javascript preserving/reusing all the selected / developed / tested java stuff? 
   > The answer here is YES, by using Nashorn that is   javascript on JVM. Nashorn is the new JavaScript Engine embedded in Java 8 that runs on the JVM. 

2. Is it possible develop a complete and well structured  javascript application ? 
   > Yes it is, but with help of  [typescript] that fills language's gaps and produce  javascript as output 

3. Is it possible to have a module system that allow to arrange application in separate well-defined modules ? 
   > Yes it is, this is achieved by project jvm-npm that enable use of commonJS and then [typescript] Modules 

4. Is it possible to keep the same productivity achieved developing in java by using IDE like Eclipse ?  
   > The answer here is not so simple at all because we have to define what we mean as productivity. In this case I’ve considered just the IDE features provided to develop code and in particular the intellisense one. So, after such assumptions, the question become:
   >  
   > **Is it possible to have an IDE with intellisense capability that is able to inspect java/javascript classes during development ?**
   >
   > For answer to the last question and  accomplish all the points I’ve developed the [Java2Typescript] project. 

## The Java2typescript project 

**Diagram of solution**

![Diagram](../../../../assets/java2ts/java2ts1.png)

**The project’s purposes are:** 

* To generate [typescript] Declarations enabling every typescript-aware IDE (eg. Atom, VSCode)  the IntelliSense feature that makes more comfortable access to Java features/classes from  javascript. 

* Introduce typescript/javascript code in java project to handle particular use cases that could require dynamic evaluation, extensibility or rapid prototyping 

It uses a [java annotation processor][jsr269] that scans the given classes from project’s classpath and generate the equivalent [typescript] declarations that make possible to develop an application in an assisted way using a preferred [typescript] enabled IDE.  

Developing application in such way you can: 

1. Reuse javascript/typescript know how  
1. Reuse all preexisting Java stuff 
1. Possibility to reuse some javascript stuff (eg. npm packages like [mustache]) 
1. Use an Object oriented & type safe language (ie. typescript) 
1. Enable Modularization 

### When use it 

Currently I’m using it mostly for playground and testing purposes continuously refining/improving to make it production ready. 

I think that the best use cases are for unit & integration tests but it could be very useful to develop simple workflow (or extension points) that could be updated at run time increasing configurability and extensibility of your app 

I’ve realized also a [Demo app][demo] available on line that has been developed using [typescript] on jvm provided by this project itself ([dogfooding]). The code is available [here][Java2Typescript]   

 
## Conclusion 

Hope this project could help you to think about the possibility to introduce usage of javascript in your Java applications, enabling it in an easy and effective way. I hope you enjoyed this article and found it useful for your own projects, in the meanwhile, enjoy coding! 👋 



[typescript]: https://www.typescriptlang.org
[jsr269]: https://jcp.org/en/jsr/detail?id=269
[mustache]: https://mustache.github.io
[dogfooding]: https://en.wikipedia.org/wiki/Eating_your_own_dog_food
[demo]: https://github.com/bsorrentino/java2typescript-demo
[nodejs]: https://nodejs.org/en
[Java2Typescript]: https://github.com/bsorrentino/java2typescript