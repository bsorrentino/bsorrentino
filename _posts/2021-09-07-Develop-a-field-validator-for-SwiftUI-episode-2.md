---
layout: post
title:  "Develop a field validator for SwiftUI - episode 2"
date:   2021-09-07 15:00:00 +0200
categories: SwiftUI
---

## Recap

In the previous article the [episode 1](https://bsorrentino.github.io/bsorrentino/swifui/update/2019/10/14/Develop-a-field-validator-for-SwiftUI.html), we have started to implement a field validator trying to follow the philosophy and approach behind the SwiftUI the (no longer) new declarative framework proposed by Apple as an fast and homogeneous way to develop UI/UX on Apple Devices

## Continuous Evolving & Learning

SwiftUI is in continuous evolution and then we have to continuous learning and during my deep dive in the SwiftUI articles and tutorials I came across this article "[How to run some code when state changes using onChange()](https://www.hackingwithswift.com/quick-start/swiftui/how-to-run-some-code-when-state-changes-using-onchange)" where I've seen an example of **Binding extension** and precisely the follow one:

```swift
extension Binding {
    func onChange(_ handler: @escaping (Value) -> Void) -> Binding<Value> {
        Binding(
            get: { self.wrappedValue },
            set: { newValue in
                self.wrappedValue = newValue
                handler(newValue)
            }
        )
    }
}
```

This code opened my mind to a new vision on "**how to implement a field validation**" in SwiftUI.

## The Idea

The original **FieldValidatorLibrary** implementation relies on the `FieldChecker` to hold validation status and `FieldValidator` that, “behind the scene”, manages validation process. The original solution was also based on the  custom Views `TextFieldWithValidator` and `SecureFieldWithValidator` needed to bind `FieldChecker` with `FieldValidator`.
The solution work well but the idea was to remove custom views in favour of the standard views removing as consequence also FieldValidator making the overall solution **lean**, **more reusable** and **future proof**

## New Implementation

The new implementation is composed exclusively by class `FieldChecker2` and a `Binding` extension.
The `FieldChecker2` is now an `ObservableObject` and the `Binding` extension contains just `onValidate` method that accepts as arguments a `FieldChecker2` object and a validation closure containing the validation logic.
This means that a classical field validation scenario become:

```swift
struct MyForm: View  {

  @State var username: String
  // validation state of username
  @StateObject var usernameCheck = FieldChecker2<String>()

  TextField( "give me the username",
           text: $username.onValidate(checker: usernameCheck) { v in
                // validation closure where ‘v’ is the current value
                if( v.isEmpty ) {
                    return "username cannot be empty"
                }
                return nil
           })
           .overlay( Text( usernameCheck.errorMessage ?? "") )

}
```

As you can see the solution is very easy and validation is directly applied on field (in the example `username` ) so it is completely decoupled by `TextField`.

## Conclusion

I've released version `1.5` of the **FieldValidationLibrary** containing this new implementation but keeping backward compatibility with the previous one.

For more details and meaningful examples go to the [project on github](https://github.com/bsorrentino/swiftui-fieldvalidator)

Happy coding and … enjoy SwiftUI
