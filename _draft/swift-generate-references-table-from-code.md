## swift-generate-references-table-from-code.md

in maintaining open source projects the README plays more and more a leading role. A well done README attracts developers and make them more confident of its quality and encourage its usage.

For this reason I spent time to understand how improve README content, release after release. Obviously refine README content  is not effortless and relying on a well defined template could help to simplify work.

In this article I'd like to share with you how to generate a complete references list to put in your README in automatic way. 

### Idea

The Idea is to **add comments in your code referring to useful links** that inspired or helped you to solve a problem (e.g. stackoverflow, blogs, etc...) and provide a  comment parser program ables to collect such links and format them in a references list as result.

> 👉 This article referes to **[Swift] based projects** but the idea could be applied to projects developed in other programming languages.

### The Abstract Syntax Tree ([AST]) 

The first step is to evaluate the possibility to parse comments in the code of your choosen programming language so, for this reason you have to search for a library that is able to parse your code and produce an [AST] representation.
The [AST] is a tree representation of the abstract syntactic structure of source code written in a programming language 

> 👉 For [Swift programming language]([Swift]) the library choosen is [Swift-Syntax] the Apple supported library for parsing, inspecting, generating, and transforming [Swift source code]([Swift]). 

### Defining a <u>comment convention</u>

### Developing a <u>comment parser application</u>


----

Swift language parser to extract meaningful infos from comments to enrich the README

## Usage

```swift
//  inspired by [How to convert a SwiftUI view to an image](https://www.hackingwithswift.com/quick-start/swiftui/how-to-convert-a-swiftui-view-to-an-image)
extension View {

}
```

[AST]: https://en.wikipedia.org/wiki/Abstract_syntax_tree
[Swift]: https://www.swift.org
[Swift-Syntax]: https://github.com/apple/swift-syntax.git