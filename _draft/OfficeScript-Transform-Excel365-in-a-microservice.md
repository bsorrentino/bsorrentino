# Office Script : publish a microservice for accessing your Excel365

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

After the above considerations I've proposed to use the "Microsoft Power Platform" and to avoid extra licenses costs I've decided to use "[Powerapps for Teams](https://docs.microsoft.com/en-us/powerapps/teams/overview)" that is a limited version of "Power Platform" integrated with "Microsoft Teams"

### Assumptions

Before start design & implementation I've made the following assumption:
> Reuse the already in place process to reuse both the mail and the excel sheet "as-is" because this will minimise inpact in its adoption.

### Power Platform Architecture of Solution


Above there is the first "reference architecture" that I've designed to accomplish the requirements.

#### Trigger Mail
As you can see each mail sent/forwarded to a pre-configured mail group is triggered by a "Power Automate Flow" that :
 1. Identify the sender
 1. Analyse the subject to understand the nature of time entry (`Hours Off`, `Holyday`, `Availability`, `Overtime`, ...).
    > This is achieved by an serverless function but is planned to use the Power Platform AI extension

#### Save Data
After that the gathered information are saved in "Dataverse" in the state: `pending for approval`
