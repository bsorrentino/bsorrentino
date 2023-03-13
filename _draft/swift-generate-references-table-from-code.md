## swift-generate-references-table-from-code.md

in maintaining open source projects the README plays more and more a leading role. A well done README attracts developers and make them more confident of its quality and encourage its usage.

For this reason I spent time to understand how improve README content, release after release. Obviously refine README content  is not effortless and relying on a well defined template could help to simplify work.

In this article I'd like to share with you how to generate a complete references list to put in your README in automatic way. This article referes to Swift based projects but I' think that the idea could be applied to projects developed in other programming languages.



# swift-comments-parser

Swift language parser to extract meaningful infos from comments to enrich the README

## Usage

Add comment in your code referring to an useful link 

```swift
//  inspired by [How to convert a SwiftUI view to an image](https://www.hackingwithswift.com/quick-start/swiftui/how-to-convert-a-swiftui-view-to-an-image)
extension View {

}
```

Run CLI passing it the root folder of you swift project and you'll got in console output a list of all references mentioned in your code in markdown format. Then copy & paste in your README

```
* [For further info](https://plantuml.com/class-diagram#4b62dd14f1d33739)
* [SwiftUI: Forcing an Update](https://stackoverflow.com/a/65095862/521197)
* [How can I add caching to AsyncImage](https://stackoverflow.com/a/70916651/521197)
* [Compressing and Decompressing Data with Buffer Compression](https://developer.apple.com/documentation/accelerate/compressing_and_decompressing_data_with_buffer_compression)
* [PlantUML Text Encoding](https://plantuml.com/en/text-encoding)
* [Class Diagram](https://plantuml.com/class-diagram)
* [How to convert a SwiftUI view to an image](https://www.hackingwithswift.com/quick-start/swiftui/how-to-convert-a-swiftui-view-to-an-image)
* [Button border with corner radius in Swift UI](https://stackoverflow.com/a/62544642/521197)
* [Get a binding from an environment value in SwiftUI](https://stackoverflow.com/q/69731360/521197)
* [How to detect device rotation](https://www.hackingwithswift.com/quick-start/swiftui/how-to-detect-device-rotation)
* [Colors supported by PlantUML](https://github.com/qywx/PlantUML-colors/blob/master/plantuml-colors-table.puml)
* [Split Picture in tiles and put in array](https://stackoverflow.com/a/73628496/521197)
* [Conditional modifier](https://designcode.io/swiftui-handbook-conditional-modifier)
* [How to Display Web Page Using WKWebView](https://www.appcoda.com/swiftui-wkwebview/)
* [Document based app shows 2 back chevrons on iPad](https://stackoverflow.com/a/74245034/521197)
* [Open-source themes for PlantUML diagrams](https://bschwarz.github.io/puml-themes/gallery.html)
* [Get the current first responder without using a private API](https://stackoverflow.com/a/1823360/521197)
* [SwiftUI exporting or sharing files](https://stackoverflow.com/a/56828100/521197)
* [SwiftUI Let View disappear automatically](https://stackoverflow.com/a/60820491/521197)
* [How to percent encode a URL String](https://useyourloaf.com/blog/how-to-percent-encode-a-url-string/)
* [Managing Focus in SwiftUI List Views](https://peterfriese.dev/posts/swiftui-list-focus/)
* [show access level](https://plantuml.com/class-diagram#3644720244dd6c6a)
* [Customizing Toggle with ToggleStyle](https://www.hackingwithswift.com/quick-start/swiftui/customizing-toggle-with-togglestyle)

```
