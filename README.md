# Getting Started
See the Guide on how to contribute [here](https://github.com/Euklidian-Space/voter-node/CONTRIBUTING.md#how-to-contribute) for instructions on how to fork and set up your repository.

# Installing Dependencies
In the root directory of your newly cloned project `npm install`

In the client directory of your project `npm install`

Skip this next part if you know what you are doing

---

Noob tip 

*If you can, "clone with `SSH` instead of clone with `HTTPS`. This means that, when you type in git remote add origin, you should use a link that looks like this: `git@github.com:*YOUR_USER_NAME/YOUR_REPO_NAME.git.*` Observe how that differs from* `https://github.com/YOUR_USER_NAME/YOUR_REPO_NAME.git`* 
While the first creates a remote that uses `ssh` authentication, the latter uses `https`, so it'll always prompt you to enter your username and password to authenticate the connection. For more see this [link](https://gist.github.com/juemura/899241d73cf719de7f540fc68071bd7d)*

---


# Install mongodb

You also need to install and have running mongoDB - Directions can be found [here](https://docs.mongodb.com/manual/installation/)

# Update and run

When update has completed go to where you installed the project and run `npm install` again to install dependencies in the root and client directories. This will update the project with any new packages added to the file package.json in your project. 

When finished, in the project's root directory type `npm run server`. This will start the server on`localhost:8081`.


# About Voter-Node
This is an open source project to be used, changed, given to anyone and by anyone.  The idea of this project is to build a poll taking service.  This app is for anyone who may need the ability to create polls and gather results from said polls.  The application is a JSON API with endpoints available for a client/service to consume.  

Pull requests are welcome!

## Table of Contents

- [Main Goal](#main-goal)
- [Features](#features)
- [About the application](#about-the-application)
- [Where to get the files](#where-to-get-the-files)
- [Requirements](#requirements)
- [ToDo](#todo)


## Main Goal

The main goal of the app is to provide the user with a JSON API that they can use on their own applications/services.

## Features

* **Users** will be able to:  
  * Create Polls
  * Cast a vote on a poll 
  * Create projects which are groupings of polls 

* **The app** will:
    * Interface with a database to save a users:
        * Polls 
        * Projects


### *About the application*
* Node backend
* [MIT License](../blob/master/LICENSE)

### *Where to get the files*
* [This repository](https://github.com/Euklidian-Space/voter-node)

## *Requirements*
* Requirements

## *ToDo*
* Improvements
