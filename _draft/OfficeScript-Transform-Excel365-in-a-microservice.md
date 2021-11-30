# Office Script : publish a microservice for accessing your Excel365

## Abstract

Continuing my effort in using and understanding the best use cases for "Low Code" platform, and in particular "Power Platform", I've had a classical challenge in trying to automate a business process consisting in use excel as "single source of truth" and/or as the main target to present process output.

## The Use Case

The use case that I'd want to describe here is "manage the timesheets of the resources allocated by customers".
Obviously there are a lot of software that are able to do it, but in this particular case the complication is that the customer use an own system for manage the consultants' timesheets and it isn't open to the providers so them, to keep control on billing hours, need to be aligned on that in someway.

### Use the Mail

As you can image to solve problem the "quick & easy" solution adopted has been the "mail notification", delegating the alignment process to an internal resource (in my case the HR person) that, mainly, receive mails concerning timesheet's entries and put them in an excel sheet that uses  to double check with the customer the billing hours.

### How to Automatise

So, how to automatise as much as possible this process in order to minimise effort required by the "internal resource" and the probably errors due the manual nature of the task.
