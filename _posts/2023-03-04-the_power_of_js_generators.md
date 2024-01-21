---
layout: post
title:  "The power of 'js generators' revamped"
date:   2023-03-03 20:05:26 +0200
categories: git
---

![cover][../../../../assets/the-power-of-js-generators/cover.png]
<br>

## Introduction

During my daily work, like every developer, we discover a lot of precious online material. Sometimes it contains suggestions, fragments of code or even complete tutorials. However, rarely read articles that open your mind and/or change the development prospect.

Luckly I found out an incredible [presentation]([power_of_generators]) from [Anjana Vakil] (and the related [video]([power_of_generators_video])) that pushed me to revaluate a relatively old javascript  feature that I had, until now, understimated that are **generators**.

Below the summary of the main topics about generators explained through code samples as inspired by [original article]([power_of_generators])

## Considerations

* generators are old but still innovative 🚀
* generators are underappreciated 🤨 
* generators are actually useful 👍🏻    
* generators are great teachers 🎓
* generators are mind-blowing 🤯

---

## Basics

### generator object is a type of _[iterator]([iterators])_
It has a `.next()` method returning `{ value:any, done:boolean }` object

```javascript 
someIterator.next()
// { value: 'something', done: false }
someIterator.next()
// { value: 'anotherThing', done: false }
someIterator.next()
// { value: undefined, done: true }
```

### generator functions return _generator objects_
`function*` defines a generator function that implictly return a generator object

```javascript
function* genFunction() {
    yield "hello world!";
}
let genObject = genFunction();
// Generator { }
genObject.next();
// { value: "hello world!", done: false }
genObject.next();
// { value: undefined, done: true }
```

### generator actions 
`.next()` advances ▶️; `yield` pauses ⏸️; `return` stops ⏹️

```javascript
function* loggerator() {
    console.log('running...');
    yield 'paused';
    console.log('running again...');
    return 'stopped';
}
let logger = loggerator();
logger.next(); // running...
// { value: 'paused', done: false }
logger.next(); // running again...
// { value: 'stopped', done: true }
```

### generators are also _[iterable]_
generator object returned by generator function behaves like an iterator hence is iterable

```javascript
function* abcs() {
    yield 'a';
    yield 'b';
    yield 'c';
}
for (let letter of abcs()) {
    console.log(letter.toUpperCase());
}
// A
// B
// C
[...abcs()] // [ "a", "b", "c" ]
```

## Generators for **consume data**
Below we will evaluate how to use generators to consume data

### custom iterables with [@@iterator]([iterable])

Evaluate how to implement custom iterable objects powerd by generators

#### Example: Create a `CardDeck` object 

```javascript
cardDeck = ({
    suits: ["♣️", "♦️", "♥️", "♠️"],
    court: ["J", "Q", "K", "A"],
    [Symbol.iterator]: function* () {
        for (let suit of this.suits) {
            for (let i = 2; i <= 10; i++) yield suit + i;
            for (let c of this.court) yield suit + c;
        }
    }
})
```
```
> [...cardDeck]
Array(52) [
"♣️2", "♣️3", "♣️4", "♣️5", "♣️6", "♣️7", "♣️8", "♣️9", "♣️10", "♣️J", "♣️Q", "♣️K", "♣️A", 
"♦️2", "♦️3", "♦️4", "♦️5","♦️6", "♦️7", "♦️8", "♦️9", "♦️10", "♦️J", "♦️Q", "♦️K", "♦️A",
"♥️2", "♥️3", "♥️4", "♥️5","♥️6", "♥️7", "♥️8", "♥️9", "♥️10", "♥️J", "♥️Q", "♥️K", "♥️A",
"♠️2", "♠️3", "♠️4", "♠️5","♠️6", "♠️7", "♠️8", "♠️9", "♠️10", "♠️J", "♠️Q", "♠️K", "♠️A" 
]
```

### lazy evaluation & infinite sequences

Since the generator are lazy evaluated (they weak up only when data is required) we can implement somtehing of awesome like an infinite sequence. 

Below some  examples that make in evidence how is simple an powerful combine generators and iterators

#### `infinityAndBeyond = ƒ*()`
```javascript
function* infinityAndBeyond() {
    let i = 1;
    while (true) {
        yield i++;
    }
}
```

#### `take = ƒ*(n, iterable)`
```javascript
function* take(n, iterable) {
    for (let item of iterable) {
        if (n <= 0) return;
        n--;
        yield item;
    }
}
```
#### take first _N_ integers
```javascript
let taken = [...take(5, infinityAndBeyond())]
```
```
taken = Array(5) [1, 2, 3, 4, 5]
```

#### `map = ƒ*(iterable, mapFn)`
```javascript
function* map(iterable, mapFn) {
    for (let item of iterable) {
        yield mapFn(item);
    }
}
```
#### square first _N_ integers
```javascript
let squares = [
    ...take( 9, map(infinityAndBeyond(), (x) => x * x) )
]
```
`squares = Array(9) [1, 4, 9, 16, 25, 36, 49, 64, 81]`

### recursive iteration with [yield*]

It is very interesting that we can yield data in recursive way as shown in example below generating a tree object

#### `binaryTreeNode = ƒ(value)`
```javascript
function binaryTreeNode(value) {
    let node = { value };
    node[Symbol.iterator] = function* depthFirst() {
        yield node.value;
        if (node.leftChild) yield* node.leftChild;
        if (node.rightChild) yield* node.rightChild;
    }
    return node;
}
```

#### `tree = Object { value, leftChild, rightChild }`

```javascript
tree = {
    const root = binaryTreeNode("root");
    root.leftChild = binaryTreeNode("branch left");
    root.rightChild = binaryTreeNode("branch right");
    root.leftChild.leftChild = binaryTreeNode("leaf L1");
    root.leftChild.rightChild = binaryTreeNode("leaf L2");
    root.rightChild.leftChild = binaryTreeNode("leaf R1");
    return root;
}
```
```
> [...tree]
Array(6) [
    "root", 
    "branch left", 
    "leaf L1", 
    "leaf L2", 
    "branch right", 
    "leaf R1"
    ]
```
### async iteration with [@@asyncIterator]([asyncIterator])

And, of course, could not be missed compliance of generators with asynchronous iterations 💪 

In the example below we will fetch asynchronusly starwars ships names from web using [async iterator]([asyncIterator]) powered by generator

#### `getSwapiPagerator = ƒ(endpoint)`
```javascript
getSwapiPagerator = (endpoint) =>
    async function* () {
        let nextUrl = `https://swapi.dev/api/${endpoint}`;
        while (nextUrl) {
            const response = await fetch(nextUrl);
            const data = await response.json();
            nextUrl = data.next;
            yield* data.results;
        }
    }
```    
#### `starWars = Object {characters: Object, planets: Object, ships: Object}`
```javascript
starWars = ({
    characters: { [Symbol.asyncIterator]: getSwapiPagerator("people") },
    planets: { [Symbol.asyncIterator]: getSwapiPagerator("planets") },
    ships: { [Symbol.asyncIterator]: getSwapiPagerator("starships") }
})
```

#### fetch star wars ships
```javascript
{
    const results = [];
    for await (const page of starWars.ships) {
        console.log(page.name);
        results.push(page.name);
        yield results;
    }
}
```
```
Array(36) [
  0: "CR90 corvette"
  1: "Star Destroyer"
  2: "Sentinel-class landing craft"
  3: "Death Star"
  4: "Millennium Falcon"
  5: "Y-wing"
  6: "X-wing"
  7: "TIE Advanced x1"
  8: "Executor"
  9: "Rebel transport"
  10: "Slave 1"
  11: "Imperial shuttle"
  12: "EF76 Nebulon-B escort frigate"
  13: "Calamari Cruiser"
  14: "A-wing"
  15: "B-wing"
  16: "Republic Cruiser"
  17: "Droid control ship"
  18: "Naboo fighter"
  19: "Naboo Royal Starship"
  20: "Scimitar"
  21: "J-type diplomatic barge"
  22: "AA-9 Coruscant freighter"
  23: "Jedi starfighter"
  24: "H-type Nubian yacht"
  25: "Republic Assault ship"
  26: "Solar Sailer"
  27: "Trade Federation cruiser"
  28: "Theta-class T-2c shuttle"
  29: "Republic attack cruiser"
  30: "Naboo star skiff"
  31: "Jedi Interceptor"
  32: "arc-170"
  33: "Banking clan frigte"
  34: "Belbullab-22 starfighter"
  35: "V-wing"
]
```

## Generators for **produce data**

so we have understood that generators are a great way to produce data but they can also consume data 😏

### keep in mind that _yield_ is a two-way street

It is enough pass in a value with  `.next(input)` 😎. See example below 

```javascript
function* listener() {
    console.log("listening...");
    while (true) {
        let msg = yield;
        console.log('heard:', msg);
    }
}
let l = listener();
l.next('are you there?'); // listening...
l.next('how about now?'); // heard: how about now?
l.next('blah blah'); // heard: blah blah
```

### generators remember state - **state machines**

Like classical javascript function within generator function's scope we can store a state.

```javascript
function* bankAccount() {
    let balance = 0;
    while (balance >= 0) {
        balance += yield balance;
    }
    return 'bankrupt!';
}
let acct = bankAccount();
acct.next(); // { value: 0, done: false }
acct.next(50); // { value: 50, done: false }
acct.next(-10); // { value: 40, done: false }
acct.next(-60); // { value: "bankrupt!", done: true }
```

## Generators cooperative features

Summarizing we can say that generator funcions are perfect enabler for cooperative work and in particular :

* generators can **yield control** and get it back later ✅
* generators can function as **coroutines** ✅
* generators allow to pass control back and forth to **cooperate** ✅

### Example: Actor-ish message passing!

This last example is simple implementation of an actor based system based on a shared queue

```javascript
let players = {};
let queue = [];

function send(name, msg) {
    console.log(msg);
    queue.push([name, msg]);
}

function run() {
    while (queue.length) {
        let [name, msg] = queue.shift();
        players[name].next(msg);
    }
}

function* knocker() {
    send('asker', 'knock knock');
    let question = yield;
    if (question !== "who's there?") return;
    send('asker', 'gene');
    question = yield;
    if (question !== "gene who?") return;
    send('asker', 'generator!');
}

function* asker() {
    let knock = yield;
    if (knock !== 'knock knock') return;
    send('knocker', "who's there?");
    let answer = yield;
    send('knocker', `${answer} who?`);
}

players.knocker = knocker();
players.asker = asker();
send('asker', 'asker get ready...'); // call first .next()
send('knocker', 'knocker go!'); // start the conversation
run();
// asker get ready...
// knocker go!
// knock knock
// who's there?
// gene
// gene who?
// generator!
```

## Conclusions

### generators have practical uses

* custom iterables
* lazy/infinite sequences
* state machines
* data processing
* data streams

### generators can help you

* control flow & async
* coroutines & multitasking
* actor models
* systems programming
* functional programming

I think generator function is a powerful tool in javascript eco-system  that must be taken into consideration.
I hope this can be useful like has been to me, in the meantime ** happy coding ** 👋

## Resources

* [The original article]([power_of_generators]) by [Anjana Vakil]
* [The Power of JS Generators (video)]([power_of_generators_video]) by [Anjana Vakil]
* [The Miracle of Generators](https://vimeo.com/232221648) by Bodil Stokke
* [Curious Course on Coroutines and Concurrency (video)](http://www.dabeaz.com/coroutines/) by David Beazley
* [Generators: The Final Frontier (video)](http://www.dabeaz.com/finalgenerator/) by David Beazley
* [Introduction to Generators in Observable](https://observablehq.com/@observablehq/introduction-to-generators) by Mike Bostock
* [Exploring ES6: Generators](https://exploringjs.com/es6/ch_generators.html#ch_generators_ref_3) by Axel Rauschmayer
* [You Don't Know JS: Generators](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/async%20%26%20performance/ch4.md) by Kyle Simpson
* [Iterators and generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) on MDN


[Anjana Vakil]: https://twitter.com/AnjanaVakil
[power_of_generators]: (https://observablehq.com/@anjana/the-power-of-js-generators)
[power_of_generators_video]: (https://www.youtube.com/watch?v=gu3FfmgkwUc&t=43s)
[iterators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#iterators
[iterable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol
[yield*]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*
[asyncIterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator