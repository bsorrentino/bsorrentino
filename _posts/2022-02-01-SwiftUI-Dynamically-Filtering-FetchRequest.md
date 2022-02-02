---
layout: post
title:  "SwiftUI: Dynamically Filtering FetchRequest"
date:   2022-02-01 15:00:00 +0200
description: How to combine searchable modifier with FetchRequest property wrapper to achieve dynamic filtering 
categories: SwiftUI
---

## The SwiftUI 'searchable' modifier

From **IOS 15** swiftUI has been enriched of new (wished) functionalities. One of the most useful in my opinion is the new modifier [searchable][SEARCH]
that allow to achieve in pretty straightforward way a full working search bar.

Form first announcement I couldn't wait to use it and as soon as I've updated my XCode I started to refactor one of the my iOS app from UIKit couple `UITableViewController` + `UISearchController` to swiftUI `List` + `Searchable` modifier.

### Problem with '@FetchRequest' dynamic filtering

I've applied it on top of a `List` and it worked as expected but the problem was that I would want to use `@FetchRequest` property wrapper  but it seemed not thought for use it in a dynamic filtering scenario like when we want to use with a search bar.

So the problem was:  **is it possible to use use @FetchRequest to perform dynamic filtering ?**.

### Solution using a 'DynamicFetchRequestView'

Luckily I land on this [article](ARTICLE1) from amazing [Paul Hudson][POULH] that explains how is possible use `@FetchRequest` property wrapper for dynamic filtering so i decided to apply the provided solution in my project and develop a more generic SwiftUI View `DynamicFetchRequestView` allowing to apply the dynamic filtering in different scenarios.

#### 'DynamicFetchRequestView' implementation

Essentially the solution proposed by Paul Hudson was to **set `@FetchRequest` property wrapper in custom initializer** to which we can pass argument allowing to prepare a FetchRequest on-the-fly.
Below there is the `DynamicFetchRequestView` implementation

```swift
struct DynamicFetchRequestView<T: NSManagedObject, Content: View>: View {

    // That will store our fetch request, so that we can loop over it inside the body.
    // However, we don’t create the fetch request here, because we still don’t know what we’re searching for.
    // Instead, we’re going to create custom initializer(s) that accepts filtering information to set the fetchRequest property.
    @FetchRequest var fetchRequest: FetchedResults<T>

    // this is our content closure; we'll call this once the fetch results is available
    let content: (FetchedResults<T>) -> Content

    var body: some View {
        self.content(fetchRequest)
    }

    // This is a generic initializer that allow to provide all filtering information
    init( withPredicate predicate: NSPredicate, andSortDescriptor sortDescriptors: [NSSortDescriptor] = [],  @ViewBuilder content: @escaping (FetchedResults<T>) -> Content) {
        _fetchRequest = FetchRequest<T>(sortDescriptors: sortDescriptors, predicate: predicate)
        self.content = content
    }

    // This initializer allows to provide a complete custom NSFetchRequest
    init( withFetchRequest request:NSFetchRequest<T>,  @ViewBuilder content: @escaping (FetchedResults<T>) -> Content) {
        _fetchRequest = FetchRequest<T>(fetchRequest: request)
        self.content = content
    }

}
```
As you can see the View is pretty simple, as said the trick is within initializer where we are able to instantiate a custom `FetchRequest` providing the required arguments. After that, the request will be automatically performed by the View when its render is required and the result will be passed to the custom content that is a `@ViewBuilder` provided in initializer itself

#### 'DynamicFetchRequestView' usage sample

#### Define the `NSManagedObject`
Let assume having a Data Object named `Account` with two attributes

```swift
class Account : NSManagedObject {

  @NSManaged public var name: String
  @NSManaged public var age: NSNumber
}
```

#### Define the 'DynamicFetchRequestView' extension by Entity
Now I want filtering Accounts in my View by name, to do this I've to **make a `DynamicFetchRequestView` extension for `Account` entity** as shown in the code snippet below:

```Swift
// Initializer for Account filtering
extension DynamicFetchRequestView where T : Account {

    init( withSearchText searchText: String, @ViewBuilder content: @escaping (FetchedResults<T>) -> Content) {

        let search_criteria = "name CONTAINS[c] %@"
        let predicate = NSPredicate(format: search_criteria, searchText )

        self.init( withPredicate: predicate, content: content)
    }
}
```

#### Put 'searchable' modifier and 'DynamicFetchRequestView' together
In code above we stated that we want perform a search on name attribute using a **search criteria string**. Now we can put all together and develop our final View

```Swift
struct AccountList: View {
    @Environment(\.managedObjectContext) var managedObjectContext

    @State private var searchText = ""

    var body: some View {

        NavigationView {

            DynamicFetchRequestView( withSearchText: searchText ) { results in

                List( results, id: \.self ) { account in

                    HStack {
                      Text( account.name )
                      Text( "\(account.age)" )
                    }
                }

            }
            .searchable(text: $searchText, placement: .automatic, prompt: "search keys")
            .navigationBarTitle( Text("Account List"), displayMode: .inline )

        }
    }
}
```

#### Bonus: make a section for each alphabetic character
In code below we update `AccountList` implementation to include a section for each letter of alphabet

```Swift
struct AccountList: View {
    @Environment(\.managedObjectContext) var managedObjectContext

    @State private var searchText = ""

    var body: some View {

        NavigationView {

            DynamicFetchRequestView( withSearchText: searchText ) { results in

                let groupByFirstCharacter = Dictionary( grouping: results, by: { $0.name.first! })

                List {
                    ForEach( groupByFirstCharacter.keys.sorted(), id: \.self ) { section in
                        Section( header: Text( String(section) ) ) {

                            ForEach( groupByFirstCharacter[section]!, id: \.self ) { account in

                                HStack {
                                  Text( account.name )
                                  Text( "\(account.age)" )
                                }
                            }
                        }
                    }
                }
            }
            .searchable(text: $searchText, placement: .automatic, prompt: "search keys")
            .navigationBarTitle( Text("Account List"), displayMode: .inline )

        }
    }
}
```

## Conclusion

In this article I shared my experience during the discovery and deepening of SwiftUI knowledge.

Hope this help, in the meanwhile happy coding and … enjoy SwiftUI! 👋


[SEARCH]: https://developer.apple.com/documentation/swiftui/form/searchable(text:placement:)
[ARTICLE1]: https://www.hackingwithswift.com/books/ios-swiftui/dynamically-filtering-fetchrequest-with-swiftui
[POULH]: https://twitter.com/twostraws?s=20
