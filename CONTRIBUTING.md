# Contributions Welcome

Thanks for your interest in contributing to **Voter-Node**! Contributing to open source projects like this one can be a rewarding way to learn, teach, and build experience. Not only that, contributing is a great way to get involved with _social coding_. We are excited to see what amazing contributions you will make, as well as how your contributions will benefit others.

If you are new to contributing to open source projects, the process can be intimidating. Not to worry! To help ensure both you and the community get the most out of your contributions, we've put together the following guidelines.

## Table of Contents

1. [Types of Contributions](#types-of-contributions)
1. [Ground Rules & Expectations](#ground-rules--expectations)
1. [How to Contribute](#how-to-contribute)

---

## Types of Contributions

The common misconception about contributing to an open source project is that you need to contribute code. In fact, there are numerous ways you can directly contribute. To give you some ideas of how you can contribute, here are some examples of the types of contributions we are looking for:

### Developers can:

* Take a look at the [open issues][issues] and find one you can tackle.

* Locate and fix bugs.

* Implement innovative and awesome new features.

* Help to improve tooling and testing.

### Organizers and Planners can:

* Link to duplicate issues, and suggest new issue labels, to help keep things organized.

* Go through the [open issues][issues] and suggest closing old ones.

* Ask clarifying questions on recently opened issues to move the discussion forward.

* Help to organize meetups about the project.

### Writers can:

* Help to fix or improve the project's documentation.

### Designers can:

* Design wire frames, mock-ups, graphical assets, and logos.

* Put together a style guide to help the project have a consistent visual design.

### Supporters can:

* Answer questions for people on open issues, or about the project in general.

* Help to moderate discussion boards or conversation channels.


## How to Contribute

If you'd like to contribute, a good place to start is by searching through the [issues][issues] and [pull requests][pull-requests] to see if someone else had a similar idea or question.

If you don't see your idea listed, and you think it fits into the goals of the project, you should:

* **Minor Contribution _(e.g., typo fix)_:** Open a pull request
* **Major Contribution _(e.g., new feature)_:** Start by opening an issue first. That way, other people can weigh in on the discussion and planning before you do any work.

To start making a contribution:

1. `fork` the project repository by clicking the **fork** button on GitHub.![fork](https://help.github.com/assets/images/help/repository/fork_button.jpg) 

1. `clone` your forked repository (_noob tip: the actual command you type in is everything after the $_):

   ```shell
   $ git clone https://github.com/<YOUR-USERNAME>/voter-node
   ```

1. Add a new remote that points to the original project so you can sync project changes with your local copy:

   ```shell
   $ git remote add upstream https://github.com/Euklidian-Space/voter-node
   ```

1. Pull upstream changes into your local repositories `development` branch:

   ```shell
   $ git checkout development
   $ git pull upstream development && git push origin development
   ```

1. Create a new branch from the `development` branch:
![branch](https://help.github.com/assets/images/help/branch/branch-selection-dropdown.png)

   **IMPORTANT:** Make sure you are on the `development` branch first.

   ```shell
   $ git checkout -b <YOUR-NEW-BRANCH>
   ```

1. Make your contribution to the project code.

1. Write or adapt tests as needed.

1. Add or change documentation as needed.

1. After commiting changes, push your branch to your fork on Github, the remote `origin`:

   **IMPORTANT:** Your commit message should be in present tense and should describe what the commit, when applied, does to the code - not what you did to the code.

   ```shell
   $ git push -u origin <YOUR-NEW-BRANCH>
   ```

1. From your forked GitHub repository, open a pull request in the branch containing your contributions. Target the project's `development` branch for the pull request.

1. At this point, your contribution has been submitted for review. Please be patient while your contribution is being reviewed as this can take some time. Meanwhile, if there are questions or comments on your contribution, please respond and/or update with future commits.

1. Once the pull request is approved and merged, you can pull the changes from `upstream` to your local repository and delete your extra branch(es).

1. Don't forget to check out more [about] this project  

Happy contributing!

[issues]: https://github.com/Euklidian-Space/voter-node/issues
[pull-requests]: https://github.com/Euklidian-Space/voter-node/pulls
[about]: https://github.com/Euklidian-Space/voter-node/README.md
