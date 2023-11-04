# Typescript: Validating External Data in Full Stack Applications

## Introduction

During my experience using [langchain.js] with [typescript] to implement the powerful “functions calling” features, I've meet for first time the [Zod] framework for functions schema definition. I was fascinated by meaningful syntax in the schema declaration and I decided to delve into to better understand its usage and possibilities. during my search I landed on this YouTube [video][youtube] from [ByteGrad] and quickly everything has been perfectly clear for me: “**ALWAYS use Zod in  typescript applications**” and below I’ll explain the main reasons of such choice. 

### The Challenge with External Data

When building applications, developers often encounter scenarios where they need to fetch external data. This data might come from various sources, and there's always a risk (mostly related to change to the cloud api version or some bugfix deployed quickly in production) that the data might not be in the expected format or shape, leading to potential bugs. This article delves into the importance of validating external data sources, especially in full-stack applications, and why relying solely on TypeScript might not be enough.

Whether you're fetching data from a server, receiving user input, or accessing local storage, the data you receive might not always be what you expect. This unpredictability can introduce vulnerabilities and errors into your application. For instance, while building a full-stack Javascript/Typescript application, the frontend might fetch data from:

1. **Backend Server**: Your own backend might send data that the frontend consumes. However, changes in the backend data structure can affect the frontend's functionality.
2. **Third-party APIs**: Data from third-party sources might not always conform to expected structures. in particular for unstable Cloud Api that could change without notice.
3. **User Input**: Users might provide data through forms, which can vary in format and content.
4. **Local Storage**: Data retrieved from local storage might change over time or might not be in the expected format.
5. **URL Parameters**: Data can also be stored and retrieved from URLs, such as search parameters.

### Backend Server / Third-party APIs

For simplicy we promote the Backend Server and Third-party APIs as the representative examples of external data sources validation.

### Design time schema validation

TypeScript is a powerful tool that offers static type checking, ensuring that variables conform to specific types. However, when it comes to validating the shape of external data, TypeScript might fall short.
TypeScript is a strongly typed language that enables us to define types. These types are validated both during development into an IDE and upon compilation/transpilation by the TypeScript compiler.

So, for example, we can define a new Product type schema that we expect as result from our server call as code below

```typescript
// design time schema declaration
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

In this case neither the IDE than the cmpiler can help in data validation, we just assume that the data returned by server is compliant with our schema.
Unfortunately, if it no will be so, we risk that our code can break during data usage unless we perform a ad-hoc validation developing boring and ripetitive code but, the worst part is that we MUST keep this validation code in-sync with our data schema. Below an example of such validation data

```typescript
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

Obviously I’ve made a simple data schema for give a proof of concept  but we can easily  imagine that the code complexity will increase linearly with the increase od data schema complexity.

### Zod comes to play

To avoid problems highlighted before, we can use a “schema declaration and validation” library like Zod. Zod is easy to use and effective, so let's apply it to the code we reviewed.


```typescript

// design time schema declaration
type Product = {
    name: string;
    price: number;
}
// run time schema declaration
const productSchema = z.object({
  name: z.string(),
  price: z.number(),
});

export default function Product() {
  useEffect(() => {
    fetch("/api/product")
      .then((res) => res.json())
      .then((product: Product) => {

        // use Zod to validate the product
        const validatedProduct = productSchema.safeParse(product); // no exceptions thrown
        
        if (!validatedProduct.success) {
          console.error(validatedProduct.error);
        }

        console.log( validatedProduct.data );
      });
  }, []);
}
```

### Why TypeScript Alone Isn't Enough

TypeScript is a powerful tool that offers static type checking, ensuring that variables conform to specific types. However, when it comes to validating the shape of external data, TypeScript might fall short.

Consider a scenario where the frontend expects a product object with a `name` property. Using TypeScript, you might define the product type as having a `name` and a `price`. However, if the backend changes and starts sending a product object with an `ID` instead of a `name`, TypeScript won't catch this discrepancy if the data is typed as `any`. Even if you explicitly type the data as a product, runtime errors can still occur if the backend's data shape changes.

### The Solution: Schema Validators

To ensure that the data is in the expected shape, developers can use schema validators. Tools like Zod or Yup can validate the shape of the data at runtime, ensuring that it matches the expected schema.

For instance, when fetching product data, a schema validator can check if the received data has the required properties (`name` and `price`) and if they are of the correct type (string and number, respectively). If the backend starts sending an `ID` instead of a `name`, the schema validator will catch this discrepancy, preventing potential runtime errors.

### Conclusion

While TypeScript is an invaluable tool for type checking, it's essential to use schema validators when dealing with external data sources in full-stack applications. By validating the shape of external data, developers can ensure the robustness and reliability of their applications, preventing potential bugs and vulnerabilities.

---

Note: This article is based on the first segment of the video. There are more segments to the video, and the article can be expanded further based on the complete transcription. Would you like to continue with the next segment?

inspired by [Video: ALWAYS use Zod in your typescript app][youtube] from [ByteGrad]

[youtube]: https://youtu.be/AeQ3f4zmSMs?si=ZSR9Q0Q-QFeSDzWj
[ByteGrad]: https://www.youtube.com/@ByteGrad