# Power Apps Code Review Tool


## Introduction
Generating source code files from a canvas app is today
possible thanks to the [Power Apps Language Tooling library](https://github.com/microsoft/PowerApps-Language-Tooling) which is an
open source-code library. The power of this library goes beyond source code packing and unpacking. As an example, the **Power Apps Code Review tool** uses the **Power Apps Language Library** to process a canvas app and extract insightful information used during an app review.

## Power Apps Code Review Tool
With the Power Apps review tool, you can conduct app reviews more
efficiently thanks to a customizable checklist of best practices, a 360 view
of your app through app checker results, app settings and a free search
code/formula viewer.

## The Checklist
The checklist represents a series of patterns to check in your application.
You can pass or fail each pattern, add comment for the app maker to consider or view additional details related to the pattern.
When you start a review, you will notice that certain items are already in pass or fail state.
This is because we can automatically detect certain patterns we process
an app when you first create a review.

## App Checker Results
The app checker screen shows the results from the  app checker result
run for the app when it was last published. These results are available in
the Power Apps studio as your build your app but they are included in this
tool for convenience. A quick glance at the app checker result will often
show serious issues with the app such as inefficient loading or delegation
issues.
![img_p1_2](../../../assets/power-apps-code-review-tool/img_p1_2.png)

## App Analysis
The app analysis section allows us to quickly check if certain important
app setting flags are on. The flags have an impact on performance. The
screen info section gives us a quick count of the number of controls used
for each screen to ensure that it is below the recommended max of 300
control per screen. The media files sections list all medias embedded with
the app as well as their size. Finally, the network trace section helps
identify slow network requests within the app.
![img_p1_1](../../../assets/power-apps-code-review-tool/img_p1_1.png)

## Code Viewer
The code viewer section lists all screens, controls and properties with a
search and filter function allowing you to quickly find formulas within your
app. You can search by control name, property or simply by any text that
can be present in power apps formula.

![img_p1_1](../../../assets/power-apps-code-review-tool/img_p1_1.png)

You can link formulas to a particular pattern by selecting the “+” button. This is useful when providing feedback to the app developer as they can where exactly in code certain best practices were not followed.
![img_p3_2](../../../assets/power-apps-code-review-tool/img_p3_2.png)

Expanding the data source icon will present a list of all data sources and
collection used in the app. Selecting a source in the list will show all of the
reference across all the control’s properties in all screens.
![img_p4_1](../../../assets/power-apps-code-review-tool/img_p4_1.png)

## Creating a Review
When launching the Power Apps Review app, you will be presented with  a
list of existing reviews and the option of creating a new review
![img_p1_1](../../../assets/power-apps-code-review-tool/img_p1_1.png)

Simply add the app name, msapp file and other optional fields. Including a Power Apps Monitor trace event files will give addition insight into slow
queries within the app under review.
![img_p5_1](../../../assets/power-apps-code-review-tool/img_p5_1.png)

## Deploying the Code Review tool
Download the solution file [here](https://github.com/microsoft/powerapps-tools/tree/master/Tools/Apps/Microsoft.PowerApps.CodeReview). Import the solution and follow the steps to configure Connection References.

## References

* [Original Article](https://powerapps.microsoft.com/en-us/blog/power-apps-code-review-tool/)
* [Announced Source code files for Canvas apps.](https://powerapps.microsoft.com/en-us/blog/source-code-files-for-canvas-apps)
* New Power Apps Code Review Tool
> [Video](https://youtu.be/ZkXL_IqK4UE)
* Power Apps Code Review Tool Deep Dive
> [Video](https://youtu.be/PY75d8cvfbs)
