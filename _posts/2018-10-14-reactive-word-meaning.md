---
layout: post
title:  My experience trying to explain “reactive” word meaning 
date:   2018-10-14
description: "Reactive programming explained by concepts"
categories: programming

---
<!--
![cover][cover]
<br>
-->

Reactive currently is one of the most trendy buzzword in the technology world

Reactive is a word widely used as prefix for “System” and “Programming” to describe two very different matter

However as IT consultant and reactive sponsor I have had a lot of discussion about it, but essentially the main question is always the same:
> Q: What does mean reactive ?

and immediately after:
> Q: Why I have to use reactive ?

Even if there are a lot of professional articles that try to explain in exhaustive way the reactive system , reactive programming and/or both the questions still persist in context in which I work.

I’ve explained that reactive system is not the same thing of reactive programming, moreover concerning reactive system, I’ve demystified a bit the reactive word and, as [Reactive Manifesto] states clearly, I gave focus the attention on more classic concepts of a “distributed system” based upon “message driven” architecture (ie. reactive system is an architectural style).

After that, the questions have been moved on reactive programming and, more specifically, on how the reactive framework deal with asynchronous execution and the (famigerate) threads.

Here the problem has become little bit more complex to explain … the matter was on different execution environments implementation of the message loop, how it works for instance in nodeJS rather than in JVM.

At the end, trying to win this challenge, I’ve decided to draw a simple comics using a very interesting ‘Restaurant Metaphor’, discovered by surfing in the ‘reactive world’ sea, that I’ve named “Reactive Serving” .

# Reactive Serving

Let’s image that you became a new owner of little restaurant with only few tables (just three for example) and you have to deal with recruit the staff. What are your choices ? Assuming that you need of one chef, how many waiters you would have on board ?

## Approach 1

Now let’s try to solve this problem using the approach of classic (non reactive) execution environments that sponsor the one-thread-per-request. Take a look below:

![pic01][pic01]

One waiter for each customer (One thread for each request)

This approach assume that we have one waiter completely dedicated to the need of one specific customer interacting synchronously with chef.

Probably this solution looks very fascinating, especially if we want propose our restaurant as a VIP’s local, but meanwhile we have to take in consideration the costs (number of waiters) and the fact that the greater part of time the waiters wait (do nothing).
Scalability note:

It is simple to understand that if you want increase number of the tables in your restaurant you have a linear increase of costs and resource needed.
Move out of the metaphor:

Simply substituting the waiters with threads, chef with processing capability and customers with requests we obtain, exactly, what happen inside an classic execution environment where each thread is dedicated to a single request.

## Approach 2

Now let’s try to solve this problem using the approach of a reactive execution environments that sponsor the single-thread-event-loop. Take a look below:

![pic02][pic02]


One waiter for all customers (One thread for all requests)
This approach assume that we have one “reactive” waiter that works hard and asynchronously to satisfy the need of all customers also interacting with chef .

Probably this solution looks less fascinating of the previous one but is absolutely more efficient, because contains costs and use the as much as possible the capability of your waiter. Therefore …..

more “reactive” are waiter and chef … more effective your service is.

## Scalability note:

If you want increase number of the tables in your restaurant you have to understand how much reactive your waiter is and, if you need another one, for sure you’ll search for another reactive guy. This mean that the required costs and resources depends on your ability to manage such issues

# Move out of the metaphor:

While the thread play role of waiter, processing capability of the chef and customer of the request, you (as owner) plays the role of system resource manager

# Conclusion

The question is … In your case, what service model will you choose for your restaurant ? Approach 1 or 2 ?

Classic vs Reactive
> ![pic03][pic03]


Hope that such metaphor helps to understand how the reactive framework deal with asynchronous execution and the threads.


Summarising we can say that, while a non-reactive system try to manage resources using a predictive model (max number of threads, max number of requests per time) the reactive one relies on system capacity involving less resources (better used) making unpredictable the overall throughput of system (for that we have to use empiric approach).


## Enjoy reactive world !!

An interesting (technical) follow up to this article is [understanding reactor pattern thread based and event driven][article01]

[Reactive Manifesto]: https://www.reactivemanifesto.org/
[article01]: https://dzone.com/articles/understanding-reactor-pattern-thread-based-and-eve
[pic01]: /bsorrentino/assets/reactive-programming/reactive-programming01.png
[pic02]: /bsorrentino/assets/reactive-programming/reactive-programming02.png
[pic03]: /bsorrentino/assets/reactive-programming/reactive-programming03.png