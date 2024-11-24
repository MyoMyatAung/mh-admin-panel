# Social Panel

## Requirements

For development, you will only need Node.js installed on your environement.

### Node

[Node](http://nodejs.org/) is really easy to install & now include [NPM](https://npmjs.org/).
You should be able to run the following command after the installation procedure
below.

    $ node --version
    22.9.0

    $ npm --version
    10.8.3

## Install

    $ git clone https://github.com/projectFolder
    $ cd PROJECT
    $ npm install

## Environment Configuration

To properly set up the environment for this project, you need to add a `.env` file at the root of your project directory. This file will contain essential configuration keys required for the application to run.

### Steps to Add the `.env` File

1. **Navigate to the root directory of your project.**
2. **Create a new file named `.env`.**
3. **Add the following keys to the `.env` file:**

   ```plaintext
   VITE_API_URL=
   ```

## Start & watch

    $ npm run dev

## Build for production

    $ npm run build

## Update sources

Some packages usages might change so you should run `npm prune` & `npm install` often.
A common way to update is by doing

    $ git pull
    $ npm prune
    $ npm install
