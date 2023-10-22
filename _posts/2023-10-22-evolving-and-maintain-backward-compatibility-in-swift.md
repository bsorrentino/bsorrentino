---
layout: post
title:  "Evolving and maintain Backward Compatibility in Swift"
date:   2022-02-01 15:00:00 +0200
description: A Deep Dive with `@available` and `#available attributes
categories: Swift
---

### A Deep Dive with `@available` and `#available` Attributes
> Maintaining Backward Compatibility in Swift: 

In the ever-evolving world of iOS development, ensuring backward compatibility is crucial. As Apple introduces new features and deprecates old ones, developers are faced with the challenge of ensuring their apps run smoothly across different iOS versions. In this article, we'll explore how to leverage Swift's `@available` and `#available` attributes to maintain backward compatibility, using a practical example of a `CopyToClipboardButton` SwiftUI view.

### Understanding `@available` and `#available`

1. `#available`: This is a <u>**runtime check**</u> that allows you to conditionally execute code based on the current platform's version. It's particularly useful for branching logic based on the OS/version.

2. `@available`: This attribute is used to indicate the availability of an API or a piece of code for specific platforms and versions. It essentially a <u>**compile time check**</u> that tells the compiler which versions of iOS (or other platforms) the annotated API is available for.

I've underlined the main differences between the two attributes where `@available` is a compile time check while `#available` is a runtime check this means that:

> Use `#available` like an `if` statement based upon OS/version while use `@available` if you want **avoid that complier compiles specific code** present only on particular OS/version (e.g. new API) giving you an error during development with a lower OS deployment target.

### A Practical Example: `CopyToClipboardButton` SwiftUI View

Let's analyse a real-world example to see these attributes in action. In this example, we'll create a SwiftUI view that allows users to copy a specified value to the clipboard producing an haptic effect on completion. 

We'll use the new SwiftUI modifier [sensoryFeedback()] introduced from iOS 17 and we'll use `@available` attribute to exclude code from compilation for iOS versions below 17 using, in such case the standard UIKit implementation.

#### Let's create SensoryFeedback Modifier

For managing compatibility across iOS versions, we' create a new SwiftUI modifier  called `SensoryFeedback` that will provide haptic feedback to the user after copy operation is completed. The code is presented below and we'll go through it in detail.

```swift
struct SensoryFeedback: ViewModifier {
    /// A binding to determine if the task is complete.
    @Binding var taskIsComplete: Bool
    
    /// Provides sensory feedback for iOS 17 and above.
    /// - Parameter content: The content view to which the feedback should be applied.
    /// - Returns: A view with sensory feedback applied.
    @available(iOS 17, *)
    @ViewBuilder
    func sensoryFeedback_iOS17(_ content: Content) -> some View {
        content.sensoryFeedback(.success, trigger: taskIsComplete)
    }
    
    /// The body of the view modifier.
    func body(content: Content) -> some View {
        if #available(iOS 17, *) {
            sensoryFeedback_iOS17(content)
        }
        else { // iOS 16 and below
            content.onChange(of: taskIsComplete, perform: { value in
                if value {
                    let generator = UINotificationFeedbackGenerator()
                    generator.notificationOccurred(.success)
                }
            })
        }
    }
}
```

The function `sensoryFeedback_iOS17` provides sensory feedback using the new SwiftUI modifier and we make such function available to the compiler only on iOS 17 and above.

Within the `body` of the `SensoryFeedback` modifier, we need to conditionally apply the sensory feedback implementation and here we apply the `#available` attribute to switch between newer and older implementation.

#### Let's add modifier to CopyToClipboardButton

After creating the `SensoryFeedback` modifier, we can now add it to our View. Below is the complete code of the `CopyToClipboardButton` a View designed to allow users to copy a specified value to the clipboard including a sensory feedback.

```swift
public struct CopyToClipboardButton: View {
    
    /// The value to be copied to the clipboard.
    var value: String
    
    /// A state indicating whether the task of copying to the clipboard is complete.
    @State var taskIsComplete = false
    
    /// The body of the `CopyToClipboardButton` view.
    public var body: some View {
        Button(action: {
            // Copy the value to the clipboard based on the platform.
            UIPasteboard.general.string = self.value
            // Toggle the task completion state.
            taskIsComplete.toggle()
        }) {
            // Display an image indicating the copy action.
            Image(systemName: "doc.on.clipboard")
        }
        // Apply sensory feedback based on task completion.
        .modifier(SensoryFeedback(taskIsComplete: $taskIsComplete))
    }
}

```

### Conclusion

Maintaining backward compatibility is essential for providing a seamless user experience across different iOS versions. Swift's `@available` and `#available` attributes offer a robust mechanism to ensure your app gracefully handles the intricacies of evolving iOS APIs. By understanding and effectively using these attributes, developers can ensure their apps remain functional and user-friendly across a wide range of iOS versions.

Hope this help, happy coding 👋

### Rerefences

* [Making vibrations with UINotificationFeedbackGenerator and Core Haptics][old]
* [SwiftUI: How to add haptic effects using sensory feedback][new]
* [How to use the #available attribute in Swift][available]

[new]: https://www.hackingwithswift.com/quick-start/swiftui/how-to-add-haptic-effects-using-sensory-feedback
[old]: https://www.hackingwithswift.com/books/ios-swiftui/making-vibrations-with-uinotificationfeedbackgenerator-and-core-haptics
[available]: https://www.avanderlee.com/swift/available-deprecated-renamed/
[sensoryFeedback()]: https://developer.apple.com/documentation/swiftui/view/sensoryfeedback(_:trigger:)