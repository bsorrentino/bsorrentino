---
layout: post
title:  "Generate references table from code comments"
date:   2023-03-16 15:00:00 +0200
categories: tools
---

## Generate references table from code comments 🤔

In maintaining open source projects the README plays more and more a leading role. A well done README attracts developers and makes them more confident of its quality and encourages its usage.

For this reason I spent time understanding how to improve README content, release after release. Obviously, refined README content  is not effortless and relying on a well defined template could help to simplify work.

In this article I'd like to share with you how to generate a complete references list to put in your README in an automatic way. 

### The Idea 💡

The Idea is to **add comments in your code referring to useful links** that inspired or helped you to solve a problem (e.g. [stackoverflow], blogs, etc...) and provide a comment parser application able to collect such links in a "<u>references list</u>" document. below I'll describe step by step the analysis, design and a bit of implementation (see note below 👇) of an application for generate a references table in markdown format.

> 👉 This article refers to **[Swift based projects][Swift]** but the idea could be applied to projects developed in other programming languages.

### Step 1 - The Abstract Syntax Tree [AST] 

The first step is to evaluate the possibility to parse comments in the code of your chosen programming language so, for this reason you have to search for a library that is able to parse your code and produce an [AST] representation.
The [AST] is a tree representation of the abstract syntactic structure of source code written in a programming language 

> 👉 For [Swift programming language][Swift] the library chosen is [Swift-Syntax] the Apple supported library for parsing, inspecting, generating, and transforming [Swift source code][Swift]. 

### Step 2 - Defining a <u>comment convention</u>

Now we have to define what will be the format of link in our comment. Since the target is to produce markdown the easy way is to use [markdown format][md-link] itself that is `[ <link text> ]( <URL> )`.

> A [Swift] example
>```swift
> // inspired by [SwiftUI exporting or sharing files](https://stackoverflow.com/a/56828100/521197)
> struct SwiftUIActivityViewController : UIViewControllerRepresentable {
>
> }
>```

### Step 3 - Developing a <u>comment parser application</u>

Once we have identified [AST] framework, developing an application either desktop or simply a [CLI]  that use it is pretty straightforward. Typically every [AST] framework is based on [Visitor Pattern][visitor]. [Visitor Pattern][visitor] essentially allows to register a visitor on a client that, when traversing the object's structure, will be notified on every significant element found.

In the case of [AST], visitor will be notified on every language syntax element detected ( also comments ) so to develop comment parser application we have to:
1. declare visitor to handle comments detection 
1. read comment content
   * verify if it is a link 
   * if yes then store it in a reference list 
1. run traverse of source code structure for each source file starting from the project folder

## A MacOS comment parser application  

As said my first implementation is in [Swift] as a MacOS desktop application based on [SwiftUI] framework. Below I'll share with you the main parts of the implementation 

### 1. declare visitor to handle comments detection 

To define a Visitor compliant with [Swift-Syntax] framework we have to inherit from [SyntaxVisitor] and override the required `visitPost( node: <syntax element> )` methods as shown below

```swift
import SwiftSyntax
import SwiftSyntaxParser

/// Visitor 
final class CommandVisitor: SyntaxVisitor {
    /// reference storage
    private(set) var references = Set<String>()
    
    init() { super.init(viewMode: .sourceAccurate) }

    /// token syntax handler
    override func visitPost(_ node: TokenSyntax) {
        // select comments
        parseComments( node.leadingTrivia, prefix: "leading" )
        parseComments( node.trailingTrivia, prefix: "trailing" )
    }
}

```

### 2. read comment content

Once we have captured the candidate `TokenSyntax` we select only the comments, get they content, verify if they are links and, if they are, we store them in a collection  

```swift

extension CommandVisitor {      
    
    /// process comments
    func parseComments( _ trivia: Trivia, prefix: String) {
         for t in trivia {
             switch t { // select only comments
             case   .lineComment(let comment),
                    .docLineComment(let comment),
                    .blockComment(let comment),
                    .docBlockComment(let comment):
                 // verify if it is a link (see next paragraph 👇)
                 if let match = comment.firstMatch(of: regexComment  ) {
                     // if yes then store it in a reference list 
                     references.insert(String(match.1))
                 }
                 break
             default:
                 break
             }
         }
     }
}

```

#### In depth analysis on how verify presence of link in comments

To verify if the comment's content contains a link we use the ever-green [regular expression][regex]. Such an expression will be composed by one expression to recognize link text and another one to recognize a URL.

#### expression to recognize link text
```
/\[(.+[^\[])\]/
```

#### expression to recognize URL ( inspired by [URL regex that starts with HTTP or HTTPS][regex-url] )
```
/\(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)\)/
```

#### expression complete
```
/\[(.+[^\[])\]\(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)\)/
```

Since in the new release 5.7 of [Swift] has been introduced a **result builder-powered [DSL]** for creating regular expressions ( [SE-0351] ) so we have generated [DSL] from previous regular expression

```swift
import RegexBuilder

let regexUrl = Regex {
    "http"
    Optionally { "s" }
    "://"
    Optionally { "www." }
    Repeat(1...256) {
        CharacterClass(
            .anyOf("-@:%._+~#="),
            ("a"..."z"),
            ("A"..."Z"),
            ("0"..."9"))
    }
    "."
    Repeat(1...6) {
        CharacterClass(
            .anyOf("()"),
            ("a"..."z"),
            ("A"..."Z"),
            ("0"..."9"))
    }
    Anchor.wordBoundary
    ZeroOrMore {
        CharacterClass(
            .anyOf("-()@:%_+.~#?&/="),
            ("a"..."z"),
            ("A"..."Z"),
            ("0"..."9"))
    }
}

let anyExceptOpenSquareBracket = CharacterClass.anyOf("[").inverted

// final regular expression
let regexComment = Regex {
    Capture {
        Regex {
            "["
            OneOrMore(anyExceptOpenSquareBracket)
            "]"
            ZeroOrMore(.whitespace)
            "("
            Capture { regexUrl }
            ")"
        }
    }
}

```

### 3. run traverse of source code structure for each source file starting from the project folder 

Lastly we have to walk through source files within a project folder and parse each of them gathering results and formatting them in a reference list

```swift

/// parse the source files comments and collect detected links  
public func parseComment( in swiftFiles: AsyncStream<URL>  ) async throws -> Set<String> {

    let visitor = CommandVisitor()

    for await fileUrl in swiftFiles {
        let fileContents = try String(contentsOf: fileUrl, encoding: .utf8)

        // Parse the source code in sourceText into a syntax tree
        let sourceFile: SourceFileSyntax = try SyntaxParser.parse(source: fileContents)

        visitor.walk(sourceFile)
    }
       
    return visitor.references
}

//  walk through source files within a project folder
let swiftFiles = walkDirectory(at: path).filter { $0.pathExtension == "swift" }

let result = await parseComment(of: swiftFiles  )

// formatting result in a reference list
let reference_list = result.map( { "* \($0)" } )

print( reference_list )

```

## Conclusion

Source code is the root-of-truth of every implementation so every kind of information you can extract from it represents a real snapshot of your work in that time. In this article I've share with you the possibility to add value to your comments so you are pushed to keep track of references during development directly in code with a minimum effort that at the end can become very useful reference list that you can put in the README (or where ever you prefer)

If you are interested on using my application or go in details of code 🧐 it is on [Github][project] 

I hope this can be useful like has been to me, in the meantime **happy coding** 👋


## References

* [Async sequences, streams, and Combine](https://www.swiftbysundell.com/articles/async-sequences-streams-and-combine/)
* [Getting started with RegexBuilder on Swift](https://blog.logrocket.com/getting-started-regexbuilder-swift/)
* [Regular expressions Available from Swift 5.7](https://www.hackingwithswift.com/swift/5.7/regexes)
* [URL regex that starts with HTTP or HTTPS](https://uibakery.io/regex-library/url)
* [An overview of SwiftSyntax](https://medium.com/@lucianoalmeida1/an-overview-of-swiftsyntax-cf1ae6d53494)

[project]: https://github.com/bsorrentino/swift-comments-parser
[AST]: https://en.wikipedia.org/wiki/Abstract_syntax_tree
[Swift]: https://www.swift.org
[Swift-Syntax]: https://github.com/apple/swift-syntax.git
[md-link]: https://www.markdownguide.org/basic-syntax/#links
[visitor]: https://en.wikipedia.org/wiki/Visitor_pattern
[cli]: https://en.wikipedia.org/wiki/Command-line_interface
[SwiftUI]: https://developer.apple.com/xcode/swiftui/
[regex]: https://en.wikipedia.org/wiki/Regular_expression
[SE-0351]: https://github.com/apple/swift-evolution/blob/main/proposals/0351-regex-builder.md
[DSL]: https://en.wikipedia.org/wiki/Domain-specific_language
[SyntaxVisitor]: https://swiftinit.org/reference/swift-syntax/swiftsyntax/syntaxvisitor
[regex-url]: https://uibakery.io/regex-library/url
[stackoverflow]: https://stackoverflow.com

