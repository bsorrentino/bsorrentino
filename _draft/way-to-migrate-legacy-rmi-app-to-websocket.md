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

| **Original High Level Architecture**
| ---
| ![hla][PIC1] |

As you can see it is pretty simple,  the main component is the `CallHandler` that kwows application interfaces and implementations and provide them both to client and server that directly use socket to made a connection's session between them

## LipeRMI : The Fork

As first step I [forked the project](https://github.com/bsorrentino/lipermi) and refactor it as a **multi module maven project*** allowing better management and make easier both extension and test.

Currently it has the following modules:

Module | Summary
---- | ----
core | the core implementation 
socket | core extension implementing synch socket protocol
websocket | core reactive extension implementing asynch websocket protocol
rmi-emul | core extension to emulate RMI API
examples | various examples
cheerpj | WebAssembly frontend based upon [CheerpJ] ( EXPERIMENTAL )

In this article I'm going to focus on `core`, `socket` and `websocket`, where `core`+`socket` should be considered a modular re-intrepretation that the original project while `websocket` is a completely new implementation that take advantage of the introduced `core` reactive protocol abstraction with usage of a [reactive-stream]

### Core Module

#### Protocol abstraction

In **core** module I've put greater part of original project's code. Taking a look to the original architecture one of the main goal was decoupling/abstracting the underlying protocol so I introduced some interfaces like `IServer`, `iClient` and `IRemoteCaller` in order to achieve this and as consequence in **core** module there aren't any specific protocol implemetation.

In the picture below there is an overview of the new **architecture** allowing protocol abstraction

| **Class Diagram with protocol abstraction**
| ---
| ![hla][PIC2] |


### Socket Module

In **socket** I've simply implemented all the synchronous abstraction provided by **core** essentially reusing code from original project but putting it in the new architecture


| **Class Diagram using socket implementation**
| ---
| ![hla][PIC4] |

#### Code Examples

To give you an idea of complexity in using the new LipeRMI implementation below there are some code snippets that I've extracted by working examples

##### Remotable Interfaces
```java

// Remotable Interface
public interface IAnotherObject extends Serializable {
	int getNumber();	
}

// Remotable Interface
public interface ITestService extends Serializable {

	public String letsDoIt();
	
	public IAnotherObject getAnotherObject();
	
	public void throwAExceptionPlease();
}
```

##### Sever
```java
// Server
public class TestSocketServer implements Constants {

    // Remotable Interface Implementation
	static class TestServiceImpl implements ITestService {
		final CallHandler callHandler;
		int anotherNumber = 0;

		public TestServiceImpl(CallHandler callHandler) {
			this.callHandler = callHandler;
		}

		@Override
		public String letsDoIt() {
			log.info("letsDoIt() done.");
			return "server saying hi";
		}

		@Override
		public IAnotherObject getAnotherObject() {
			log.info("building AnotherObject with anotherNumber= {}", anotherNumber);
			
            IAnotherObject ao = new AnotherObjectImpl(anotherNumber++);

            callHandler.exportObject(IAnotherObject.class, ao);

			return ao;
		}

		@Override
		public void throwAExceptionPlease() {
			throw new AssertionError("take it easy!");
		}
	}

	public TestSocketServer() throws Exception {

		log.info("Creating Server");
		SocketServer server = new SocketServer();

		final ITestService service = new TestServiceImpl(server.getCallHandler());

        log.info("Registering implementation");
        server.getCallHandler().registerGlobal(ITestService.class, service);

        server.start(PORT, GZIPProtocolFilter.Shared);

        log.info("Server listening");
	
	}

	public static void main(String[] args) throws Exception{
		new TestSocketServer();
	}


}

```

##### Client

```java
// Client
public class TestSocketClient implements Constants {
	
	public static void main(String... args) {

		log.info("Creating Client");
		try( final SocketClient client = new SocketClient("localhost", PORT, GZIPProtocolFilter.Shared)) {

			log.info("Getting proxy");
			final ITestService myServiceCaller = client.getGlobal(ITestService.class);

			log.info("Calling the method letsDoIt(): {}", myServiceCaller.letsDoIt());

			try {
    			log.info("Calling the method throwAExceptionPlease():");
				myServiceCaller.throwAExceptionPlease();
			}
			catch (AssertionError e) {
				log.info("Catch! {}", e.getMessage());
			}

			final IAnotherObject ao = myServiceCaller.getAnotherObject();

			log.info("AnotherObject::getNumber(): {}", ao.getNumber());
							
		} 
		
	}
	
}

```
<!--
### RMI emul

The next step has been develop module containing a RMI emulation this because my goal was to minimize effort in migration.
I have successfully end the work with  reaching a  good level of abstraction
-->

## LipeRMI : Add reactivity to the framework

Unfortunately The socket promote a synchronous programming model that not fit very well with The asynchronous one promoted by websocket, so I decided to move framework toward **reactive approach** using the [reactive-stream] standard. 

### Design guideline 

Base idea was simply decouple request and response using events so the request came out from a `publisher` while response got by `subscriber` and the entire Lifecycle request/response was managed by a `CompletableFuture` ( essentially The Java promise)

### Reactive protocol abstraction (asynchronous)

As said I've introduced in the `core` module the [reactive-stream] that is a standard for asynchronous stream processing with non-blocking back pressure that encompasses efforts aimed at runtime environments as well as network protocols. 

|  **Class Diagram of reactive stream**
| ---
| ![hla][PIC5] |

interface | description
---- | ----
`Processor<T,​R>`	| A Processor represents a processing stage—which is both a Subscriber and a Publisher and obeys the contracts of both.
`Publisher<T>`	| A Publisher is a provider of a potentially unbounded number of sequenced elements, publishing them according to the demand received from its Subscriber(s).
`Subscriber<T>`	| Will receive call to Subscriber.onSubscribe(Subscription) once after passing an instance of Subscriber to Publisher.subscribe(Subscriber).
`Subscription`	| A Subscription represents a one-to-one lifecycle of a Subscriber subscribing to a Publisher.

Below the the new `core` architecture that include the `ReactiveClient` abstraction

| **Class Diagram with Reactive protocol abstraction**
| ---
| ![hla][PIC3] |

The implementation of the reactive client is contained by the abstract `ReactiveCLient` class, it is based on the` RemoteCallProcessor` class which is an implementation of the reactive flow `Processor` which acts both as a` Publisher` by publishing the event to trigger the remote call and as a 'Subscriber' by receiving the event containing the result of such remote call. Finally the events' interactions  are coordinated by `ReactiveRemoteCaller`

### Finally Websocket Module

After introduced a [reactive-stream] implementation, switching from socket to websocket has been a simple and rewarding coding exercise.  
I've used as websocket implementation another open source project [Java-WebSocket] which is  both simply and effective.

| **Class Diagram using WebSocket implementation**
| ---
| ![hla][PIC6] |

As you see from above class diagram there are two new class `WSClientConnectionHandler` and `WSServerConnectionHandler` that manage respectively for client and server the events that coming in and out managing in the same time their consistency over each call.

#### Code Examples

Amazingly the code examples presented above works essentially in the same way also for the websocket, it is enough simply move from `SocketClient` to `LipeRMIWebSocketClient` for the client and from `SocketServer` to `LipeRMIWebSocketServer` thats' all 

```java
// Client
 try( final LipeRMIWebSocketClient client = new LipeRMIWebSocketClient(new URI(format( "ws://localhost:%d", PORT)), GZIPProtocolFilter.Shared)) { 
    ....
 }

// Server
final LipeRMIWebSocketServer server = new LipeRMIWebSocketServer();
...
```
## Conclusion
 
I've started to migrate legacy project and it is going fine just keep in mind that it is not effortless but the result is very promising, moreover switching over websocket protocol open new unexpected and exciting scenarios.



[gRPC]: https://grpc.io
[HTTP]: https://xxx.io
[Websocket]: https://xxx.io
[RMI HTTP tunneling]: https://xxx.io
[LipeRMI]: https://github.com/jorgenpt/lipermi
[CheerpJ]: https://docs.leaningtech.com/cheerpj/
[reactive-stream]: http://www.reactive-streams.org
[Java-WebSocket]: https://github.com/TooTallNate/Java-WebSocket

[PIC1]: ../assets/draft/hla-original.png
[PIC2]: ../assets/draft/hla-core.png
[PIC3]: ../assets/draft/hla-core-reactive.png
[PIC4]: ../assets/draft/hla-socket.png
[PIC5]: ../assets/draft/reactive-stream.png
[PIC6]:  ../assets/draft/hla-websocket.png
