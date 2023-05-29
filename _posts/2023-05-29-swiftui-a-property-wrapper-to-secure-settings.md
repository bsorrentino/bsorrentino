---
layout: post
title:  "SwiftUI a property wrapper to secure settings"
date:   2023-05-29 15:00:00 +0200
categories: app
---

# SwiftUI a property wrapper to secure settings

## Store Secrets on Device

Developing my last app [PlantUML for iPad](https://apps.apple.com/us/app/plantuml-app/id6444164984)
I dealt with the problem of storing in a secure way the OpenAI Api key.
So firstly I've searched for some consolidated pattern to apply in such cases and I found out some interesting article (see them in references)
that make in evidence an irrefutable best practice "**don't store secrets on device**"

## Keychain comes to rescue

However in my case "*don't store secrets on device*" was not an options so
I've decided to use client's [Secure Enclave](https://developer.apple.com/documentation/security/certificate_key_and_trust_services/keys/storing_keys_in_the_secure_enclave)
like Keychain.

## SwiftUI solution

SwiftUI provides a powerful feature named [property wrapper](https://www.hackingwithswift.com/quick-start/swiftui/all-swiftui-property-wrappers-explained-and-compared)
and there is a built-in one [`@AppStorage`][AppStorage] that reads and writes values from UserDefaults to manage User/App settings. This is a useful feature but the problem here is that such settings are not secured, for this reason I've developed a new property wrapper named `@AppSecureStorage`

### AppSecureStorage 

`@AppSecureStorage` is designed to make app data security and privacy easy for developers. The new wrapper is like an alter-ego of the existing
[`@AppStorage`][AppStorage], offering similar features taking advantage of the built-in security features of the hardware-encrypted keychain storage.

Using AppSecureStorage, developers can securely store private user data, such as passwords and/or authentication tokens, without having to worry about managing the data manually or setting up an elaborate authentication structure.

All data is stored in the secure hardware encrypted keychain, making it difficult for attackers to access. Of course, developers aren't the only ones who will benefit from this new feature. Consumers can rest assured that their app preferences and private information are secure and can't be accessed by malicious actors.

### Implementation 

The Implementation is pretty straightforward as shown below

```swift
  //
  // AppSecureStorage.swift
  //
  import SwiftUI

  @propertyWrapper
  public struct AppSecureStorage: DynamicProperty {

    private let key: String
    private let accessibility:KeychainItemAccessibility
    
    public var wrappedValue: String? {
      get {
        KeychainWrapper.standard.string(forKey: key, withAccessibility: self.accessibility)
      }
      nonmutating set {
        if let newValue, !newValue.isEmpty {
          KeychainWrapper.standard.set( newValue, forKey: key, withAccessibility: self.accessibility)
        }
        else {
          KeychainWrapper.standard.removeObject(forKey: key, withAccessibility: self.accessibility)
        }
      }
    }
  
    public init(_ key: String, accessibility:KeychainItemAccessibility = .whenUnlocked ) {
      self.key = key
      self.accessibility = accessibility
    }

  }

```

Such implementation relies on a KeychainWrapper implementation (code [here](https://github.com/bsorrentino/PlantUML4iPad/blob/main/AppSecureStorage/Sources/AppSecureStorage/KeychainWrapper.swift)) that wraps the native IOS api.

## Usage

Below a classic usage sample for storing a password

```Swift

class OpenAIService : ObservableObject {                            
                                                                      
  @AppSecureStorage("openaikey") private var openAIKey:String?      
  @Published public var inputApiKey = ""                            
                                                                       
  init() {                                                            
    inputApiKey = openAIKey ?? ""                                        
  }                                                                    
                                                                                                                             
  func commitSettings() {                                             
    guard !inputApiKey.isEmpty else {                                    
      return                                                               
    }                                                                    
    openAIKey = inputApiKey                                              
  }                                                                    
                                                                      
  func resetSettings() {                                               
    inputApiKey = ""                                                   
    openAIKey = nil                                                      
  }                                                                    
                                                                      
}

struct OpenAIView : View {                                          
                                                                      
  @StateObject var service = OpenAIService()                          
                                                                      
  var body: some View {                                                
                                                                                                                             
    ZStack(alignment: .bottomTrailing ) {                              
      Form {                                                               
        Section {                                                            
          SecureField( "Api Key", value: $service.inputApiKey               
        }                                                                    
        header: {                                                            
          Text("OpenAI Secrets")                                             
        }                                                                    
        footer: {                                                            
          Text("these data will be stored in onboard secure keychain")       
        }                                                                    
      }                                                                                                                                          
      HStack {                                                             
        Button( action: { service.resetSettings() },                         
        label: {                                                             
          Label( "Clear", systemImage: "xmark")                            
        })                                                                   
        Button( action: { service.commitSettings() },                        
        label: {                                                             
          Label( "Submit", systemImage: "arrow.right")                     
        })                                                                   
        .disabled( service.inputApiKey.isEmpty )                                              
      }                                                                    
      .padding()                                                           
    }                                                          
                                                                       
  }                                                                   
 }                                                            

```

### Conclusion

Securely storing sensitive information, such as API keys, in iOS apps could be an issue; the property wrapper `@AppSecureStorage` tries to solve this problem by leveraging the built-in security features of the hardware-encrypted keychain storage.

By using this wrapper, developers can securely store private user data, such as passwords or authentication tokens, without the need for manual management or complex authentication structures.

Hope this could be useful for you, in the meanwhile: happy coding 👋

### References

* [Secret Management on iOS](https://nshipster.com/secrets/)
* [Secure Secrets in iOS app](https://medium.com/swift-india/secure-secrets-in-ios-app-9f66085800b4)
* [All SwiftUI property wrappers explained and compared](https://www.hackingwithswift.com/quick-start/swiftui/all-swiftui-property-wrappers-explained-and-compared)
* [What is the @AppStorage property wrapper?](https://www.hackingwithswift.com/quick-start/swiftui/what-is-the-appstorage-property-wrapper)


[AppStorage]: https://www.hackingwithswift.com/quick-start/swiftui/what-is-the-appstorage-property-wrapper