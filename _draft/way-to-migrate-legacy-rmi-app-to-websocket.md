# A way to migrate a RMI based legacy App to Websocket

## Introduction

Firstly there is one thing that I'd want to underline, that as "migrate" absolutely I don't mean "rewrite" so, if you are interest in such migration, this could be an interesting reading and probably you'd have a new hope to move a java legacy application a step toward its modernization.
To give you a comprehensive view of the tasks and the implications behind such migration I'll present you a real use case that I've tackle in one of the my job

## Use case

I had an old, but perfectly working, large client/server application based on Swing/AWT using RMI as underlying communication protocol.

### Requirement

1. Move it on the Cloud using Docker/kubernetes
2. Move toward modern web compliant transport protocol like HTTP / Websocket / gRPC
Challenges
1. RMI Tunneling over HTTP
The first evaluation was to use RMI HTTP tunneling but right from the start it seemed a bit too complicated and since the application heavily uses RMI callbacks, the one-way protocol like HTTP was not suitable for the purpose.

In such sense, other than socket,  Websocket seemed the best fit for purpose protocol, but even if I’ve spent effort to understand how to use Websocket as underlying  protocol of RMI the result were a wast of time

So  another possible solution has been evaluate alternative RMI implementations and i've searching for them trying to identify an Open Source semi-finished product easy to understand and with an flexible and adaptable architecture allowing to plug a new protocol

So I've landed on [LipeRMI]  a github hosted project defined as  **a light-weight RMI alternative implementation for Java** that seemed to me have the expected requirements. I tested it with a simple but complete application and amazingly it also supported very well the **RMI callbacks**.

> The original Implementation was based upon socket but it was lightweight and flexible enough to allow me to be confident in possibility to extend and enhance it to accomplish my needs, and so my journey began 

## LipeRMI : The original

In the picture below there is the **High Level Architecture** as presented in the original project

| ![hla][PIC1] |
| ---
| **Pic.1 - Original High Level Architecture**

As you can see it is pretty simple,  the main component is the `CallHandler` that kwows application interfaces and implementations and provide them both to client and server that directly use socket to made a connection's session between them

## LipeRMI : The Fork

As first step I [forked the project](https://github.com/bsorrentino/lipermi) and refactor it as a **multi module maven project*** allowing better management and make easier both extension and test.

Currently it has the following modules:

Module | artifact
---- | ----
core | `lipermi-core`
socket | `lipermi-socket`
websocket | `lipermi-websocket`
rmi-emul | `lipermi-rmi-emul`
examples | `lipermi-examples`
cheerpj | `cheerpj`

In this article I'm going to focus on `core`, `socket` and `websocket`, 

### Core Module

In **core** module I've put greater part of original project's code. Taking a look to the original architecture one of the main goal was decoupling/abstracting the underlying protocol so I introduced some interfaces like `IServer`, `iClient` and `IRemoteCaller` in order to achieve this and as consequence in **core** module there aren't any specific protocol implemetation.

In the picture below there is an overview of the new **architecture** allowing protocol abstraction

| ![hla][PIC2] |
| ---
| **Pic.2 - Architecture with protocol abstraction**

### Socket Module

In **socket** I've simply implemented all the abstraction provided by **core** essentially reusing code from original project but putting it in the new architecture

### RMI emul

The next step has been develop module containing a RMI emulation this because my goal was to minimize effort in migration.
I have successfully end the work with  reaching a  good level of abstraction


## LipeRMI : Add reactivity to the framework

Unfortunately The socket promote a synchronous programming model That not fit very well With The asynchronous One promoted by websocket, so l decided to move framework toward Reactive approach Using The reactive-stream standard. Base idea was simply decouple request and response Using events so The request came out from A publisher while response got by subscriber and The entire Lifecycle request/response. Was managed by A completablefuture ( essentially The Java promise)

### Finally Websocket Module

After introduced a reactive-stream Implementation,switching from socket to websocket has been Asimple and rewarding coding exercise.  
I've used as websocket implementation another open source project xxxx That was simply and effective


## Conclusion
 
I've started to migrate legacy project and it is going fine just keep IN mind That it is not effortless but the result is very promising, moreover switching over websocket protocol open new unexpected and exciting scenarios


[gRPC]: https://grpc.io
[HTTP]: https://xxx.io
[Websocket]: https://xxx.io
[RMI HTTP tunneling]: https://xxx.io
[LipeRMI]: https://github.com/jorgenpt/lipermi

[PIC1]: ../assets/draft/hla.png
[PIC2]: ../assets/draft/hla2.png