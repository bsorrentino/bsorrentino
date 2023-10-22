# Validating External Data in Full Stack Applications

When building applications, developers often encounter scenarios where they need to fetch external data. This data might come from various sources, and there's always a risk that the data might not be in the expected format or shape, leading to potential bugs. This article delves into the importance of validating external data sources, especially in full-stack applications, and why relying solely on TypeScript might not be enough.

### The Challenge with External Data

Whether you're fetching data from a server, receiving user input, or accessing local storage, the data you receive might not always be what you expect. This unpredictability can introduce vulnerabilities and errors into your application. For instance, while building a full-stack Next.js application, the frontend might fetch data from:

1. **Backend Server**: Your own backend might send data that the frontend consumes. However, changes in the backend data structure can affect the frontend's functionality.
2. **Third-party APIs**: Data from third-party sources might not always conform to expected structures.
3. **User Input**: Users might provide data through forms, which can vary in format and content.
4. **Local Storage**: Data retrieved from local storage might change over time or might not be in the expected format.
5. **URL Parameters**: Data can also be stored and retrieved from URLs, such as search parameters.

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

inspired by [youtube video](https://youtu.be/AeQ3f4zmSMs?si=t3X77ZEhVXVqkihj)