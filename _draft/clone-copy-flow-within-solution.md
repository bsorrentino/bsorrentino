## Introduction

In my experience using the **Power Platform** I’ve focused a great part
of effort in understanding and using its **ALM** that continue to evolve
providing very useful tools allowing to facilitate introduction of
Devops practices within the Microsoft low-code eco-system

## The Problem: Clone a Flow within Solution

During **Power Platform** development I use almost exclusively
**Solutions** and [Microsoft Power Platform CLI (aka PAC)] to manage
**ALM** and often I deal with problem to **clone a Flow within solution**.

> Really the problem was also for **clone canvas app within solution**
> but lately in preview Microsoft has released the feature [add canvas apps to solution by default]
> 🤩🤩🤩.

So I've decided to search for a solution and I landed on this forum topic [Copy/Duplicate a Flow in a Solution]
that explain how to clone a flow once unpack solution using [PAC].
Since I've already [enhanced PAC in Nodejs using ZX], I started to implements a new feature in [zx-powerapps-cli].

## Solution: zx-clone-flow command from zx-powerapps-cli package

Now a new command `zx-clone-flow` is available from the latest version of [zx-powerapps-cli] package. 
Usage is very simple once exported a solution from Power Platform Cloud Environment to Local File system (e.g. local git repo)
using either the macro-command `zx-export-solution` or directly using
the [PAC]low level ones (`pac solution export` / `pac solution unpack`) it is enough run `zx-clone-flow` providing
**solution folder** and **flow json file** and **et voila'** the flow will be cloned. 
After that you have to import solution to Power Platform Cloud Environment from Local File system using either the macro-command
`zx-import-solution` or directly using the [PAC] low level ones (`pac solution pack` / `pac solution import`)

### Video

Below I’ve recorded a brief video that cover the entire cloning lifecycle from beginning to the end

[![Clone Powerapps Flow in Solution video](http://img.youtube.com/vi/hkuuyvYP_9w/0.jpg)](https://youtu.be/hkuuyvYP_9w "Clone Powerapps Flow in Solution")


## Conclusion

I hope this feature makes Flow development easier as it did for me, in
the meantime, happy programming and ... enjoy [zx-powerapps-cli]! 👋


[zx-powerapps-cli]: https://www.npmjs.com/package/@bsorrentino/zx-powerapps-cli
[Copy/Duplicate a Flow in a Solution]: https://powerusers.microsoft.com/t5/Building-Flows/Copy-Duplicate-a-Flow-in-a-Solution/td-p/487483
[add canvas apps to solution by default]: https://learn.microsoft.com/en-gb/power-apps/maker/canvas-apps/add-app-solution-default
[enchanced PAC in nodejs using ZX]: https://dev.to/bsorrentino/enhance-cli-with-zx-522i
[youtube video]: https://youtu.be/hkuuyvYP_9w
[PAC]: https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction
[Microsoft Power Platform CLI (aka PAC)]: https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction