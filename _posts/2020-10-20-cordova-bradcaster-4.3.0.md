---
layout: post
title:  "cordova-broadcaster-plugin 4.3.0 is out"
date:   2020-10-20 20:05:26 +0200
categories: cordova android update
---

## New Release 4.3.0

**cordova-broadcaster-plugin** is an [apache cordova](https://cordova.apache.org/) plugin allowing message exchange between javascript and native (and viceversa).

In this new release I've merged a [PR #56](https://github.com/bsorrentino/cordova-broadcaster/pull/56) from [bpowell15](https://github.com/bpowell15) to support in Android implementation the **possibility to provide a specific package name on firing a native event** ( see [Intent#setPackage](https://developer.android.com/reference/android/content/Intent#setPackage(java.lang.String)) )

### Example

```typescript
if( cordova.platformId === "android" ) {

  // send a message with "flags" and "category"
  window.broadcaster.fireNativeEvent( "message", { extras:{ item:'test data' }, packageName:'org.bsc'}, function() {
    console.log( "event fired!" );
  });
```

### New typescript declaration concerning FireNativeEvent()

Accordingly with new feature also the typescript declaration has been changed

```typescript
declare type Listener = (event: Event) => void;
declare type AndroidData = { // to be an AndroidData one between flags,category or packageName must be set
    extras: object;
    flags?: number;
    category?: string;
    packageName?: string; // new feature from 4.2.0
};

interface CordovaBroadcaster {
    /**
     * fire global native evet (valid only for android)
     * @param type
     * @param isGlobal
     * @param data
     * @param success
     * @param error
     */
    fireNativeEvent(type: string, isGlobal:boolean, data: object | AndroidData | null, success?: () => void, error?: (message: string) => void): void;

    fireNativeEvent(type: string, data: object | AndroidData | null, success?: () => void, error?: (message: string) => void): void;
    addEventListener(eventname: string, listener: Listener): void;
    addEventListener(eventname: string, isGlobal: boolean, listener: Listener): void;
    removeEventListener(eventname: string, listener: Listener): void;
  }

```
### Ionic Native

I'll push the new version to [Ionic Native](https://ionicframework.com/docs/native/broadcaster) soon


> Happy coding and … enjoy this plugin
