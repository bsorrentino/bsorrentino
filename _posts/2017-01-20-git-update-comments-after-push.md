---
layout: post
title:  "GIT: Update commit's comment after push"
date:   2017-01-20 20:05:26 +0200
categories: git
---

### Why I needed to do it


Lately I’ve dealt with an [issue](https://github.com/bsorrentino/cordova-broadcaster/issues/10)  on my project [cordova broadcaster](https://github.com/bsorrentino/cordova-broadcaster) plugin


I’ve fixed it, committed and published to NPM  the new release of plugin.


I was happy for contribution and also because I had quickly answered to the request, but, after a while,  I received following comment on such issue:


> Changes look good.
>
> Fyi to reference an issue in a commit message you should use the  syntax fixes #10 instead, so that the commit will actually be referenced in the issue feed.


**So … I forgotten to comment, in the right way, the related commit and I have already pushed all** … damn! :-(


Then I’ve started to search for a solution and “googling” I got a lot of results related to fix last commit using amendment ( `—amend`).


After a bit, finally, I found it on [SuperUser](http://superuser.com/a/751909/687383) and, once applied, the [commit](https://github.com/bsorrentino/cordova-broadcaster/commit/2bf397565010ae7105e6bdb64873b64848a80296)’s comment is, magically updated in the right way.


> … Just one word: “Awesome”.


So .. I would share with you the procedure just in case you have to deal with this situation.  Such procedure is also known as rebase commits against a point in time

### Rebase commits against a point in time

Checkout the master branch and perform a git rebase as shown below

```
$ git rebase -i <commit hash you want to change>^
```

This start a process for rebasing commits against a point in time and will open your default editor (usually vi) with a list of commits and actions (see [here](https://help.github.com/articles/about-git-rebase/#commands-available-while-rebasing) ) for each one. By default, the action is pick that means: include such commit .


For any commit you wish to change the message, change from pick to reword. After that, save and close editor (in **vi** `:wq`).


For each commit, you'll get an editor to edit the commit message. Change it as you see fit, save and close editor  (in **vi**  `:wq`).


Once you're done editing all the commit messages, you'll return to the command prompt, and have a new tree with the updated messages.


You can now upload them to github by using:

```
git push origin --force.
```

**Et voilà … you got expected result**


### Conclusion


However git never ends to amaze me, I didn’t know such feature related to rebasing process but I think that there are a lot of git’s gems that I ignore.


I can’t image to work without git anymore


Happy Coding
