---
layout: post
title:  "Typescript: Validating External Data in Full Stack Applications"
date:   2023-11-07
description: A Deep Dive on Typescript and Zod Framework for validating external data in full stack applications.
categories: typescript
---

## Introduction

During my experience using [langchain.js] with [typescript] to implement the powerful “functions calling” features, I've meet for first time the [zod] framework for functions schema definition. I was fascinated by meaningful syntax in the schema declaration and I decided to delve into to better understand its usage and possibilities. during my search I landed on this [YouTube video][youtube] from [ByteGrad] and quickly everything has been perfectly clear for me: “**ALWAYS use zod in typescript applications**” and below I’ll explain the main reasons of such choice. 

## The Challenge with External Data

When building applications, developers often encounter scenarios where they need to fetch external data. This data might come from various sources, and there's always a risk (mostly related to change to the cloud api version or some bugfix deployed quickly in production) that the data might not be in the expected format or shape, leading to potential bugs. This article delves into the importance of validating external data sources, especially in full-stack applications, and why relying solely on TypeScript might not be enough.

Whether you're fetching data from a server, receiving user input, or accessing local storage, the data you receive might not always be what you expect. This unpredictability can introduce vulnerabilities and errors into your application. For instance, while building a full-stack Javascript/Typescript application, the frontend might fetch data from:

1. **Backend Server**: Your own backend might send data that the frontend consumes. However, changes in the backend data structure can affect the frontend's functionality.
2. **Third-party APIs**: Data from third-party sources might not always conform to expected structures. in particular for unstable Cloud Api that could change without notice.
3. **User Input**: Users might provide data through forms, which can vary in format and content.
4. **Local Storage**: Data retrieved from local storage might change over time or might not be in the expected format.
5. **URL Parameters**: Data can also be stored and retrieved from URLs, such as search parameters.

## Use cases: Backend Server / Third-party APIs

For simplicy we promote the Backend Server and Third-party APIs as the representative examples of external data sources validation.

### Design time schema validation

[TypeScript] is a strongly typed language that allows us to specify data types. Its static type-checking feature helps to ensure that variables adhere to their assigned types. This type-checking occurs during development in an IDE, and at compile/transpile time. However, when [typeScript] comes to validating the shape of external data, it might fall short. For example, we can define a new `Product` type with shape that we expect as result from our server call 

```typescript
// typescript type: design time schema declaration
type Product = {
    name: string;
    price: number;
}

export default function queryProduct() {
  
  fetch(`/api/product/${productId}`)
    .then((res) => res.json())
    .then((product: Product) => { // assume that the data returned by server is compliant with our schema

      console.log( `product: ${product.name} - ${product.price}` );
    });
}
```

In this case neither the IDE than the compiler can help in data validation, we can just assume that the data returned by server is compliant with our schema.
Unfortunately, if it not will be so, we risk that our code can break during data usage unless we perform an ad-hoc validation, developing boring and ripetitive code that (the worst part) we **MUST** keep in-sync with our data schema. Below an example of a data validation function.

```typescript
// validate product data - runtime validation
function validateProduct(data: any): Product {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    
    if (!('name' in data) || typeof data.name !== 'string') {
        return false;
    }
    
    if (!('price' in data) || typeof data.price !== 'number') {
        return false;
    }
    
    return true;
}
```

Obviously I’ve made a simple data schema for give a proof of concept but we can easily imagine that the code complexity will increase linearly with the increase of data schema complexity.

### The Solution: Schema Validators - zod comes to play 🧐

To ensure that the data is in the expected shape, avoiding  problems highlighted before, developers can use schema validators. Library like [zod] helps to validate the shape of the data at runtime, ensuring that it matches the expected schema.[zod] is easy to use and effective, so let's apply it to the code we reviewed.

```typescript
// zod object schema: run time schema declaration
const productSchema = z.object({
  name: z.string(),
  price: z.number(),
});

// typescript type: design time schema declaration
type Product = {
    name: string;
    price: number;
}

export default function Product() {
  useEffect(() => {
    fetch("/api/product")
      .then((res) => res.json())
      .then((product: Product) => {

        // use zod to validate the product
        const validatedProduct = productSchema.safeParse(product); // no exceptions thrown
        
        if (!validatedProduct.success) {
          console.error(validatedProduct.error);
        }

        console.log( validatedProduct.data );
      });
  }, []);
}
```

As you can see [zod] allow us to build a runtime schema declaration (`z.object(..)`) and provides methods to validate it against external data coming from third party.

### Syncing schema definitions with typeScript types in zod 😮

Well, this protects us from unexpected external data changes, making our code much more robust and reliable. However, we still have the problem of keeping the schema definition in sync with the [typescript] types definition (as said, the one that helps us in developing our application), but don't worry, [zod] has thought of this too with the `infer` keyword, which is capable of inferring the [typeScript] type from the object schema definition. Magic? No at all, just [zod] team  has applied  many of the endless possibilities offered by the types system implemented by [typeScript]. Let’s refactor for last time the code with such feature

```typescript
// zod object schema: run time schema declaration
const productSchema = z.object({
  name: z.string(),
  price: z.number(),
});

// typescript type inferred by object schema definition. It is equivalent of
// type Product = {
//     name: string;
//     price: number;
// }
type Product = z.infer<typeof productSchema>;

export default function Product() {
  useEffect(() => {
    fetch("/api/product")
      .then((res) => res.json())
      .then((product: Product) => {

        // use zod to validate the product
        const validatedProduct = productSchema.safeParse(product); // no exceptions thrown
        
        if (!validatedProduct.success) {
          console.error(validatedProduct.error);
        }

        console.log( validatedProduct.data );
      });
  }, []);
}
```

### Conclusion

While [typeScript] is an invaluable tool for type checking, it's essential to use schema validators when dealing with external data sources in full-stack applications. By validating the shape of external data, developers can ensure the robustness and reliability of their applications, preventing potential bugs and vulnerabilities. As said I'll use tools like [zod] whenever I need and I highly recommend you to do the same, In the meanwhile … happy coding 👋
---

## References 

* [Video: ALWAYS use Zod in your typescript app][youtube] from [ByteGrad]

[langchain.js]: https://js.langchain.com/docs/get_started/introduction
[youtube]: https://youtu.be/AeQ3f4zmSMs?si=ZSR9Q0Q-QFeSDzWj
[ByteGrad]: https://www.youtube.com/@ByteGrad
[zod]: https://www.npmjs.com/package/zod
[typescript]: https://www.typescriptlang.org