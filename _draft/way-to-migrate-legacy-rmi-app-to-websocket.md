# A way to migrate a RMI based legacy App to Websocket 

## Introduction 

Firstly there is one thing that I'd want to underline, that as "**_migrate_**" absolutely I don't mean "**_rewrite_**" so, if you are interest in such migration, this could be an interesting reading and probably you'd have a new hope to move  a java legacy application a step toward its modernization.

To give you a comprehensive view of the tasks and the implications behind such migration I'll present you a real use case that I've tackle in one of the my job

## Use case

I had an old, but perfectly working, large client/server application based on Swing/AWT using RMI as underlying communication protocol.

### Requirement 

1. Move it on the Cloud using Docker/kubernetes
2. Move toward modern web compliant transport protocol like [HTTP] / [Websocket] / [gRPC] 

### Challenges 

#### 1. RMI Tunneling over HTTP

The first evaluation was to use [RMI HTTP tunneling] but right from the start it seemed a bit too complicated and since the application heavily uses RMI callbacks, the one-way protocol like HTTP was not suitable for the purpose.



[gRPC]: https://grpc.io
[HTTP]: https://xxx.io
[Websocket]: https://xxx.io
[RMI HTTP tunneling]: https://xxx.io