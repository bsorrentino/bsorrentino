# Office Scripts : publish a serverless function from Excel365

## Abstract

Continuing my effort in using and understanding the best use cases for "Low Code" platform, and in particular "Power Platform", I've had a classical challenge in trying to automate a business process consisting in use excel as "single source of truth" and/or as the main target to present process output.

## The Use Case

The use case that I'd want to describe here is "manage the timesheets of the resources allocated by customers".
Obviously there are a lot of software that are able to do it, but in this particular case the complication is that the customer use an own system for manage the consultants' timesheets and it isn't open to the providers so them, to keep control on billing hours, need to be aligned on that in someway.

### Use the Mail

As you can image to solve problem the "quick & easy" solution adopted has been the "mail notification", delegating the alignment process to an internal resource (in my case the HR person) that, mainly, receive mails concerning timesheet's entries and put them in an excel sheet that uses  to double check with the customer the billing hours.

### How to Automatise

So, how to automatise as much as possible this process in order to minimise the required manual effort avoiding the probably errors that can happens during such task?

## A Power Platform Solution

After the above considerations I've proposed to use the "Microsoft Power Platform" and to avoid extra licenses costs I've decided to use "[Powerapps for Teams][POT]" that is a limited version of "Power Platform" integrated with "Microsoft Teams"

### Assumptions


Before start design & implementation I've made the following assumption:
> Reuse the already in place process to reuse both the mail and the excel sheet "as-is" because this will minimise impact in its adoption.

### Power Platform Architecture of Solution

| ![Architecture][PIC1]
| ---
| **Pic.1 - Reference Architecture (rc1)**

Above there is the first "reference architecture" that I've designed to accomplish the requirements.

#### Trigger Mail
As you can see each mail sent/forwarded to a pre-configured mail group is triggered by a "Power Automate Flow" that :
 1. Identify the sender
 1. Analyse the subject to understand the nature of time entry (`Hours Off`, `Holyday`, `Availability`, `Overtime`, ...).
    > This is achieved by an server-less function but is planned to use the Power Platform AI extension

#### Save Data
After that the gathered information are saved in _Dataverse_ in the state: `pending for approval`

#### Approve Data
In this first release I've preferred introduce a manual step for approve timesheet's entry processed by flow in order to verify eventually errors during processing, so the **Approver** (see Pic.1) for a while has been me self
> **Approver** vs **Validator.**
>
> Idea is that the Approver and Validator could be the same person

For this I've developed a _Canvas App_ that read timesheet entries to approve from _Dataverse_ and present a screen allowing to approve, reject or delete each entry

#### Generate Excel
The final step is to create/overwrite a file excel in sharepoint and for this purpose I choosen to call a Flow from canvas App. There are lot of available "_how to_" concerning that and I don't want go in deep on it however below there are  the main steps applied :

1. Canvas App call a Flow passing the data, got from Dataverse, converted in JSON format
1. The Flow get JSON data, convert them in CSV format and create a new Excel file with such content

## Delivery of first release

After tests I've delivered solution in the production environment and after a while I got the first **critical issue** but it wasn't related to technical problem rather an uncovered (and unespected) use case.

### The issue (ie. new use case)
The new use case was that the user that play role of Validator needed to updated Excel file (also writing complex formulas) before a new generation so this means that the **Excel cannot be overwritten** but **it must be a live file** and this implies that the Flow has to work on a pre-existent file updating selectively the cells whithin.

### The Office Script comes to rescue

To solve the issue, I've tried to update the Excel cells directly from flow using Excel connector but It requires that such file adhere to several constraints moreover it highly increases the complexity of the Flow itself.
So I've search for other possible solutions and luckly I came across in the "**[Office Scripts][OS]**"

## Office Script

The "**[Office Scripts][OSD]**" are designed for the Office365 on the web and they are scripts allow you to record and replay your Excel actions on different workbooks and worksheets. If you have to perform the same tasks over and over again, you can turn all that work into an easy-to-run Office Script. **Such scripts can be combined with Power Automate to streamline your entire workflow**.

### Script Anatomy

An Office script is essentially a **typescript module** that must contain a `main` function with the [`ExcelScript.Workbook`][WB] type as its first parameter.

```typescript
function main(workbook: ExcelScript.Workbook, ...args: any[]) {
}
```

Form there you can access to **[Office Script object model][OM]** which features are outlined below

> **<u>Office Script object model</u>**
> * A [`Workbook`][WB] contains one or more [`Worksheets`][WS].
> * A [`Worksheets`][WS] gives access to cells through [`Range`][RG] objects.
> * A [`Range`][RG] represents a group of contiguous cells.
> * Ranges are used to create and place [`Tables`][TB], [`Charts`][CH], [`Shapes`][SP], and other data visualization or organization objects.
> * A [`Worksheet`][WS] contains arrays filled with those objects that are present in the individual sheet.
> * A [`Workbook`][WB] contains arrays of some of those data objects for the entire [`Workbook`][WB].

### Script Development & Deployment

The **Office Script IDE**  has provided directly inside the Excel itself. It is available from menu **`Automate`** where you could create/edit new/existent scripts using a handy typescript editor available also if you are editing Excel in the web. Take a note that such editor provides full support of intellisense. When we save a new script it is stored, by default, in OneDrive `Documents/Office Scrips` as `OSTS` file and it is immediately available for run.
For further details take a look at "[Record, edit, and create Office Scripts in Excel on the web][OSTS]"

## Let's get back on track: let use "Office Script" in Solution

As you see there are endless possibilities to manipulate the Excel content but, in my opinion, the feature that is the real game changer is that **each script could be invoked by a [Flow][FLW] and it is possible exchange data between them**. Essentially each script becomes in effect a **serverless function** hosted inside Excel that open a number of scenarios never imaged before.

So i've used such feature passing JSON objects containing all timesheet's entries from Canvas through Flow until script that has the responsibility to apply data against sheet.

| ![officescript][PIC2] |
| ---
| **Pic.2 - Usage of Office Script**

Et voila' the issue has resolved just a last consideration: **Since the document could be edited live we need to be sure that during process the file cannot be edited** how to do this?. Luckly the Shareponint connector give us the possibility to perform **[Check In][CKIN] / [Check Out][CKOUT]** on file. So the final solution becomes

| ![officescript][PIC3] |
| ---
| **Pic.3 - Reference Architecture (final)**

## Conclusion

Happy coding and … enjoy Office Script

[PIC1]: ../../../assets/OfficeScript-Transform-Excel365-in-a-microservice/architecture.png
[PIC2]: ../../../assets/OfficeScript-Transform-Excel365-in-a-microservice/officescript.png
[PIC3]: ../../../assets/OfficeScript-Transform-Excel365-in-a-microservice/architecture2.png
[CKIN]: https://docs.microsoft.com/en-us/connectors/sharepointonline/#check-in-file
[CKOUT]: https://docs.microsoft.com/en-us/connectors/sharepointonline/#check-out-file
[OSTSF]: https://docs.microsoft.com/en-us/office/dev/scripts/develop/power-automate-integration
[OSTS]: https://docs.microsoft.com/en-gb/office/dev/scripts/tutorials/excel-tutorial
[POT]: https://docs.microsoft.com/en-us/powerapps/teams/overview
[FLW]: https://docs.microsoft.com/en-gb/power-automate/getting-started
[OS]: https://docs.microsoft.com/en-us/office/dev/scripts/overview/excel
[OSD]: https://docs.microsoft.com/en-us/office/dev/scripts/overview/excel
[OM]: https://docs.microsoft.com/en-us/javascript/api/office-scripts/overview?view=office-scripts#common-classes
[WB]: https://docs.microsoft.com/en-us/javascript/api/office-scripts/excelscript/excelscript.workbook
[WS]: https://docs.microsoft.com/en-us/javascript/api/office-scripts/excelscript/excelscript.worksheet
[RG]: https://docs.microsoft.com/en-us/javascript/api/office-scripts/excelscript/excelscript.range
[TB]: https://docs.microsoft.com/en-us/javascript/api/office-scripts/excelscript/excelscript.table
[CH]: https://docs.microsoft.com/en-us/javascript/api/office-scripts/excelscript/excelscript.chart
[SP]: https://docs.microsoft.com/en-us/javascript/api/office-scripts/excelscript/excelscript.shape
