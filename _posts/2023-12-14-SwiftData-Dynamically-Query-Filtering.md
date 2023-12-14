---
layout: post
title:  "SwiftData: Dynamically Query Filtering"
date:   2023-12-14 12:00:00 +0100
description: How to combine searchable modifier with new @Query property wrapper to achieve dynamic filtering
categories: SwiftData SwiftUI
---

## The SwiftUI 'searchable' modifier

As described in my previous article [SwiftUI: Dynamically Filtering FetchRequest][article1] from **IOS 15** swiftUI has been enriched by a useful modifier [searchable][SEARCH] that allow to achieve, in pretty straightforward way a full working search bar.

I alredy dealt with problem with `@FetchRequest` dynamic filtering  and I've created a `DynamicFetchRequestView` to solve this problem, but now I'm involved in porting [CoreData] based application to new [SwiftData]  approach and I've refactor the [CoreData] based [DynamicFetchRequestView][DynamicFetchRequestView] to `DynamicQuerytView` that allow to achieve dynamic filtering also using new [SwiftData] `@Query` property wrapper.

### Problem with '@Query' dynamic filtering

The issue (the same with `@FetchRequest`) is that we need to assign the filter when we declare the variable for our query results, as shown in the example below:

```swift
import SwiftData
import SwiftUI

// PersistentModel class
@Model final public class Snippet {
    let dateDate: Date
    var title: String
    var code: String
}    

// SwiftUI View that Query snippets by title = "test"
struct ContentView: View {
    @Query(filter: #Predicate<Snippet> { $0.title.contains("test") },
             sort: [SortDescriptor(\Snippet.date)] )
    var snippets: [Snippet]

    var body: some View {
        List {
            ForEach(snippets) { snippet in
                SnippetRow(snippet: snippet)
            }
        }
    }
}
```

As you can see the filter is set when we declare the `snippets` variable that will contains the query results, so if we want to change the filter the only way is to redeclare the `snippets` variable itself.

### Solution implementing 'DynamicQueryView'

Since behind the `@Query` property wrapper there is a [Query Object][query] we can use it to achieve dynamic filtering.
The following implementation of `DynamicQueryView` use initializer to explictly instantiate the [Query Object][query] providing filter and/or sort descriptors.

```swift
import SwiftUI
import SwiftData

public struct DynamicQueryView<T: PersistentModel, Content: View>: View {
    // declare Query macro
    @Query var query: [T]

    // this is our content closure; we'll call this once for each item in the list
    let content: ( [T] ) -> Content

    public var body: some View {
        self.content(query)
    }
    
    init( descriptor: FetchDescriptor<T>,  @ViewBuilder content: @escaping ( [T] ) -> Content) { 
        // initialize query object with provided arguments   
        _query = Query( descriptor )
        self.content = content
    }

}
```
As you can see the View is pretty simple, as said the trick is inside initializer where we are able to instantiate a [Query Object][query] providing the required arguments assigning it to the  property wrapper throught the notation `_query`. After that, the request will be automatically performed by the View when its render is required and the result will be passed to the custom content that is a `@ViewBuilder` provided in initializer itself.

#### Bonus: customize 'DynamicQueryView' by PersistenModel

Now we can use the **powerful of Swift extension tecnique**,  to add a convenience initializer for each Entity on which we want have a dynamic filtering.

```Swift
// Add Initializer for 'Snippet' filtering
extension DynamicQueryView where T : Snippet { // 👀

    init( filterByTitle searchTitle: String, @ViewBuilder content: @escaping (FetchedResults<T>) -> Content) {

        let filter = #Predicate<T> { $0.title.contains(searchTitle) }
        let sort = [SortDescriptor(\Snippet.date)]
        self.init( FetchDescriptor( predicate: filter, sortBy: sort) )
    }
}
```

#### Put 'searchable' modifier and 'DynamicQueryView' together

We are ready to translate the previous example using the new `DynamicQueryView` to achieve a dynamic filtering by title.

```Swift
struct ContentView: View {
    @State var searchTitle:String?

    var body: some View {
        DynamicQueryView( filterByTitle: searchTitle ) { snipptes in
            List {
                ForEach(snippets) { snippet in
                    SnippetRow(snippet: snippet)
                }
            }
        }
        .searchable( text: $searchTitle )
    }
}
```

## Conclusion

In this article I shared my hands-on experience in moving from [CoreData] to new [SwifData]. [SwiftData] makes it easy to persist data using declarative code and it’s designed to integrate seamlessly with [SwiftUI].

Hope this help, in the meanwhile happy coding and … enjoy [SwiftData]! 👋

## References

* [SwiftUI: Dynamically Filtering FetchRequest][article1]
* [Filtering the results from a SwiftData query](https://www.hackingwithswift.com/quick-start/swiftdata/filtering-the-results-from-a-swiftdata-query)
* [Interactive @Query in SwiftData (YouTube)](https://youtu.be/8veRApPv06I?si=eGIOB93S5kG_sc2R)



[article1]: https://bsorrentino.github.io/bsorrentino/swiftui/2022/02/01/SwiftUI-Dynamically-Filtering-FetchRequest.html
[SEARCH]: https://developer.apple.com/documentation/swiftui/form/searchable(text:placement:)
[query]: https://developer.apple.com/documentation/swiftdata/query
[SwiftData]: https://developer.apple.com/xcode/swiftdata/ 
[CoreData]: https://developer.apple.com/documentation/coredata/
[SwiftUI]: https://developer.apple.com/xcode/swiftui/

