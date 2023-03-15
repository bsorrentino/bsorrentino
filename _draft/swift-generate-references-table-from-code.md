## swift-generate-references-table-from-code.md

in maintaining open source projects the README plays more and more a leading role. A well done README attracts developers and make them more confident of its quality and encourage its usage.

For this reason I spent time to understand how improve README content, release after release. Obviously refine README content  is not effortless and relying on a well defined template could help to simplify work.

In this article I'd like to share with you how to generate a complete references list to put in your README in automatic way. 

### The Idea

The Idea is to **add comments in your code referring to useful links** that inspired or helped you to solve a problem (e.g. stackoverflow, blogs, etc...) and provide a comment parser application ables to collect such links in a "<u>references list</u>" document. below I'll describe step by step the analysis, design and a bit of implementation (see note below 👇) of an application for generate a references table in markdown format.

> 👉 This article referes to **[Swift based projects]([Swift])** but the idea could be applied to projects developed in other programming languages.

### Step 1 - The Abstract Syntax Tree ([AST]) 

The first step is to evaluate the possibility to parse comments in the code of your choosen programming language so, for this reason you have to search for a library that is able to parse your code and produce an [AST] representation.
The [AST] is a tree representation of the abstract syntactic structure of source code written in a programming language 

> 👉 For [Swift programming language]([Swift]) the library choosen is [Swift-Syntax] the Apple supported library for parsing, inspecting, generating, and transforming [Swift source code]([Swift]). 

### Step 2 - Defining a <u>comment convention</u>

Now we have to define what will be the format of link in our comment. Since the target is to produce markdown the easy way is to use [markdown format]([md-link]) itself that is `[ <link text> ]( <URL> )`.

> A [Swift] example
>```swift
> // inspired by [SwiftUI exporting or sharing files](https://stackoverflow.com/a/56828100/521197)
> struct SwiftUIActivityViewController : UIViewControllerRepresentable {
>
> }
>```

### Step 3 - Developing a <u>comment parser application</u>

Once we have identified [AST] framework develop an application either desktop or simply a [CLI]  that use it is pretty straightforward. Typically every [AST] framework is based on [Visitor Pattern]([visitor]). [Visitor Pattern]([visitor]) essentially allow to register a visitor on a client that, when will traverse of the objects structure, will be notified on every significant element found.

In the case of [AST], visitor will be notified on every language syntax element detected ( also comments ) so to develop comment parser application we have to:
1. register visitor to handle comments detection 
1. run traverse of source code structure for each source file starting from the project folder
1. read comment content
1. verify if it is a link 
1. if yes then store it in a reference list 

## A Swift MacOS Comment Parser Application  

As said my first implementation is in [Swift] as a MacOS desktop application based on [SwiftUI] framework.Below I'll share with you the main ....

### 1. register visitor to handle comments detection 

### 2. run traverse of source code structure for each source file starting from the project folder 

### 3. read comment content

### 4. verify if it is a link 

### 5. if yes then store it in a reference list



[AST]: https://en.wikipedia.org/wiki/Abstract_syntax_tree
[Swift]: https://www.swift.org
[Swift-Syntax]: https://github.com/apple/swift-syntax.git
[md-link]: https://www.markdownguide.org/basic-syntax/#links
[visitor]: https://en.wikipedia.org/wiki/Visitor_pattern
[cli]: https://en.wikipedia.org/wiki/Command-line_interface
[SwiftUI]: https://developer.apple.com/xcode/swiftui/