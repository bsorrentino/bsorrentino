# How to use native Search Bar in SwiftUI for iOS, tvOS

In my Developer journey using SwiftUI in developing [SlidesOnTV](https://github.com/bsorrentino/slidesOnTV) and [KeyChainX](https://github.com/bsorrentino/keychain-ios-app) I've dealt with adding search bar on top of list, grid, etc…

In these cases I've always ask to myself a question:
> have I to use native widget or I’ve to implement a completely new widget from scratch using SwiftUi ?

But since I'm a (very)  lazy developer I decided to reuse the native widget thinking that it would have been easier solution, unfortunately It would haven’t been so.

For this reason I've decided to write this article for sharing my experience hoping that this could help other lazy developers like me.

## Solution Design

My solution design consists in **implementing a searchbar as swiftui container** (ie. using a `@viewbuilder`) so we'll define the search bar and also the view where the search result will be applied.

```swift
SearchBar(text: $searchText ) {
     List {
         ForEach( (1...50)
                .map( { "Item\($0)" } )
                .filter({ $0.starts(with: searchText)}), id: \.self) { item in
             Text("\(item)")
         }
    }
 }
```

## iOS implementation

### UIKit Search Bar behaviour

Let's start, beginning with iOS where the native widget is `UIsearchbox`.
`UIKit` offers a pretty convenient way to implement a native search bar embedded into the navigation bar. In a typical `UINavigationController` a navigation stack, each `UIViewController` has a corresponding `UINavigationItem` that has a property called `searchController`.

### The SwiftUI challenges

#### looking for a `UINavigationController` instance
The challenge here in SwiftUI is to hook up a `UISearchController` instance to a `UINavigationController`, so you can get all the iOS native search bar features with a single line of code.

But, how could I achieve this ? It was enough for me follow [this amazing article](http://blog.eppz.eu/swiftui-search-bar-in-the-navigation-bar/) where I've understood that **behind the SwiftUI `NavigationView` there is the good old `UINavigationController` from UIKit**.

#### Hooking up `UISearchController` to a `NavigationView`

Since behind the SwiftUI `NavigationView` there is a `UINavigationController` instance we can start development following below steps:
1. create a new `UIViewController` named `SearchBarViewController` that hold an instance of `UISearchController`:

 ```swift
 class SearchBarViewController : UIViewController {

    let searchController: UISearchController

    init( searchController:UISearchController ) {
        self.searchController = searchController
        super.init(nibName: nil, bundle: nil)
    }
    // Continue ...
 }
 ```
2. Handle when `SearchBarViewController` will be attached to `UINavigationController`(_behind `NavigationView`_) and hook up the `UISearchController` to the `UINavigationController` through the `navigationItem.searchController` property.
To do this We need to override an UIViewController lifecycle method named `didMove(toParent parent: UIViewController?)`:

  ```swift
override func didMove(toParent parent: UIViewController?) {
    super.didMove(toParent: parent)

    guard let parent = parent,
          parent.navigationItem.searchController == nil else {
            return
    }

    parent.navigationItem.searchController = searchController
}
  ```
3. Create an `UIViewControllerRepresentable` named `SearchBar` that create  a`SearchBarViewController` instance and hold a `@Binding` string variable named `text` that will be used to handle the search text update events:

 ```swift
 struct SearchBar: UIViewControllerRepresentable {

    typealias UIViewControllerType = SearchBarViewController

    @Binding var text: String

    class Coordinator: NSObject, UISearchResultsUpdating {

        @Binding var text: String

        init(text: Binding<String>) {
            _text = text
        }

        func updateSearchResults(for searchController: UISearchController) {

            if( self.text != searchController.searchBar.text ) {
                self.text = searchController.searchBar.text ?? ""
            }
        }
    }

    func makeCoordinator() -> SearchBar.Coordinator {
        return Coordinator(text: $text)
    }

    func makeUIViewController(context: UIViewControllerRepresentableContext<SearchBar>) -> UIViewControllerType {

        let searchController =  UISearchController(searchResultsController: nil)
        searchController.searchResultsUpdater = context.coordinator

        return SearchBarViewController( searchController:searchController )
    }

    func updateUIViewController(_ uiViewController: UIViewControllerType, context: UIViewControllerRepresentableContext<SearchBar>) {
    }
}
 ```


#### Enable `SearchBar` to be a SwiftUI container

Cool.. we have a first draft of implementation **but we miss an important part** the new created Widget **isn't a SwiftUI container** so it doesn't manage Sub Views Content.
To do this we can use the **magic** `@ViewBuilder` the **custom parameter attribute that constructs views from closures**, however we proceed with order following the steps below:

##### 1. Update `SearchBarViewController` implementation

First we've to update the `SearchBarViewController` enabling it to manage SwiftUI View as a new attribute.

```Swift
class SearchBarViewController<Content:View> : UIViewController {

    let searchController: UISearchController
    let contentViewController: UIHostingController<Content>

    init( searchController:UISearchController, withContent content:Content ) {

        self.contentViewController = UIHostingController( rootView: content )
        self.searchController = searchController

        super.init(nibName: nil, bundle: nil)
    }
    // Continue
}
```

##### 2. Got a UIView from SwiftUI View

Since it is not possible maps a SwiftUI View to an `UIView` we have to use `UIHostingController` that is able to create a `UIViewController` from a SwiftUI View then we can got a UIView and adding it as sub view to the `SearchBarViewController` views hierarchy.

```Swift
override func viewDidLoad() {
    super.viewDidLoad()

    view.addSubview(contentViewController.view)
    contentViewController.view.frame = view.bounds
}

```

##### 3. Update `SearchBar` Implementation

Lets add to `SearchBar`, our `UIViewControllerRepresentable`, a new attribute qualified as `@ViewBuilder` that hold the **closure producing the contained SwiftUI View** and evaluate such closure to initialize `SearchBarViewController`

```Swift
struct SearchBar<Content: View>: UIViewControllerRepresentable {

    typealias UIViewControllerType = SearchBarViewController<Content>

    @Binding var text: String
    @ViewBuilder var content: () -> Content  // closure that produce SwiftUI content

    class Coordinator: NSObject, UISearchResultsUpdating { ... }

    func makeCoordinator() -> SearchBar.Coordinator { ... }

    func makeUIViewController(context: UIViewControllerRepresentableContext<SearchBar>) -> UIViewControllerType {

      let searchController =  UISearchController(searchResultsController: nil)
      searchController.searchResultsUpdater = context.coordinator

      return SearchBarViewController( searchController:searchController, withContent: content() )
    }

    // Continue
}
```


##### 4. update Content

While in the first implementation of `SearchBar` we have ignored implementation of `updateUIViewController` now, since we are managing the SwiftUI content, it is not possible anymore. The `updateUIViewController` is automatically called by SwiftUI when an update is required and as consequence we have to re-evaluate content closure passing it to the `SearchBarViewController`

```Swift
func updateUIViewController(_ uiViewController: UIViewControllerType, context: UIViewControllerRepresentableContext<SearchBar>) {

  let contentViewController = uiViewController.contentViewController  // get reference to UIHostingController

  contentViewController.view.removeFromSuperview() // remove previous content
  contentViewController.rootView = content() // assign fresh content to UIHostingController
  uiViewController.view.addSubview(contentViewController.view) // add produced UIView
  contentViewController.view.frame = uiViewController.view.bounds // update view geometry

}

```

### Put all together

Finally we have finished and we can put all together as reported below

```swift

struct ContentView: View {
    @State var searchText = ""
    var body: some View {
        NavigationView {
            SearchBar(text: $searchText ) {
                List {
                  ForEach( (1...50)
                              .map( { "Item\($0)" } )
                              .filter({ $0.starts(with: searchText)}), id: \.self) { item in
                      Text("\(item)")
                  }

                }
            }.navigationTitle("Search Bar Test")
        }
    }
}

```
## Conclusion

I've also implemented a search bar for **tvOS** but I'll explain how in another article, however the complete code is on [github](https://github.com/bsorrentino/SwiftUI-SearchBar).

Hope this could help someone, in the meanwhile **Happy coding** 👋

## References

* [SwiftUI Search Bar in the Navigation Bar](http://blog.eppz.eu/swiftui-search-bar-in-the-navigation-bar/)
* [Creating a search bar for SwiftUI](https://axelhodler.medium.com/creating-a-search-bar-for-swiftui-e216fe8c8c7f)
