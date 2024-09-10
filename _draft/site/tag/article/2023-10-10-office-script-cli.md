Introduction to OfficeScripts-CLI

OfficeScripts-CLI is a command line interface tool for managing Office Scripts (.osts) files. It allows you to easily list, download, extract, bundle and upload Office Scripts to SharePoint Online.

Office Scripts are scripts written in TypeScript that allow you to automate tasks in Excel online. The scripts are bundled into .osts packages that can be distributed and executed in Excel on the web.

The OfficeScripts-CLI tool makes it simple to manage these .osts script packages from the command line.

How OfficeScripts-CLI Works
The OfficeScripts-CLI is implemented in Node.js and provides the following commands:

osts list - Lists .osts packages in a SharePoint Online folder
osts unpack - Downloads an .osts package and extracts the TypeScript source code
osts pack - Bundles TypeScript source files into an .osts package
osts upload - Uploads a bundled .osts package to SharePoint Online
The unpack and pack commands allow roundtripping - extracting source code from an .osts package, modifying it, and re-bundling into a new .osts package.

Here is an example workflow:

# Download and extract scripts from SharePoint Online
osts unpack --path my-scripts

# Make changes to the TypeScript files
cd my-scripts
// edit files

# Re-bundle into an .osts package
osts pack --path my-scripts 

# Upload updated package to SharePoint Online
osts upload --path my-scripts/my-script.osts


Under the hood, the CLI uses the Office 365 CLI and SharePoint REST APIs to interact with SharePoint Online. The unpack command downloads the .osts file and extracts the script metadata and TypeScript source code. The pack command zips the TypeScript files back into an .osts package that can be uploaded.

Conclusion
OfficeScripts-CLI provides a simple command line interface to manage Office Scripts stored in SharePoint Online. It enables script developers to easily bundle, extract, modify, and re-deploy scripts without having to manually deal with .osts packages. The project is open source and implemented in Node.js.

Overall, OfficeScripts-CLI is a useful tool to streamline the Office Scripts development workflow. It makes script sharing and collaboration much smoother.