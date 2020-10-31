---
layout: post
title:  "Powerapps tips: use toggle to set focus"
date:   2020-10-31 16:00:00 +0200
categories: Microsoft PowerPlatform Powerapps
---

## Problem

During development of a **"_Canvas App_"** in Powerapps I had to show a dialog requesting a single text as input.

The **"_Canvas developers_"** know the way to show a dialog is to make visible a rectangle on the screen and its controls is a group of standard controls that are constrained with the rectangle visibility itself.

After followed the useful article [Create dialog in powerapps] I surprised that I was not able to set focus on the unique input box contained in dialog.

**"_Setting focus_"** over control for me was a trivial task but I've understood that in Powerapps it is not so. I red the [SetFocus function limitations] but again I did understand the problem.

## Diagnosys

After struggling to investigate the possible causes I understood that problem seemed related to the fact that the input box is initially not visible and when I try to make dialog visible jointly with input box, the subsequent invocation to SetFocus function seems not in-synch with the visible state of control.

Based upon diagnosys the solution should had to be ensure that invocation to SetFocus function happened after that input control was visible, so how to do this ?

## Solution

To Help me came in to the play the **"_Toggle Control_"**, it has a useful handler named `OnCheck` that **is raised when the toggle is ON so that its `Default` property is `True`**.
Based upon that has been enough add a toggle in a Dialog controls group and assuming:
* Rectangle (i.e. Dialog) is named: `Rectangle_1`
* Input Box is named: `TextInput_1`
* Toggle is named: `Toggle_1`

the solution is to set the following property on `Toggle_1`

Property | Value
--- | ---
`Default` | `Rectangle_1.Visible`|
`OnCheck` | `SetFocus( TextInput_1 )` |

**<u>Important Note</u>**
> In order to avoid showing toggle not use `Visible` property but rather makes its size (witdh & height) equals to 0 otherwise the trigger  `OnCheck` not will be activated.

That's all, hope this help and enjoy Powerapps

#### Dev. Note - Container Control

Lately has been released  for Canvas App a new [Container Control] (experimental feature yet), it allows more flexibility over controls grouping and could be used instead of Rectangle for Dialog. Take a look the the links below.

## References

* [Create dialog in powerapps]
* [SetFocus function limitations]
* [Container Control]
* [Container control in canvas apps enables more control over layout and nesting](https://powerapps.microsoft.com/en-us/blog/enhanced-group-experimental-control-with-layout-control-and-nesting/)
* [Containers vs Groups in Power Apps](https://sharepains.com/2020/04/30/container-vs-groups-in-power-apps/)

[Container Control]: https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/controls/control-container
[Create dialog in powerapps]: https://powerapps.microsoft.com/en-us/blog/creating-dialogs-in-powerapps/
[SetFocus function limitations]: https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-setfocus#limitations
