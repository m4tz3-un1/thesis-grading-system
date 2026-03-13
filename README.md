# ThesisGradingSystem

## The application

The application is part of my bachelor thesis. The goal of the thesis is to create a system which professors can use to grade theses of students based on predefined rubrics.

To ensure that only professors can grade theses a login system is implemented. After the login the grading starts with the input of the general information of the student and the thesis. Also the type of the thesis has to be choosen out of the given possibilities. 

These infos are automatically filled into the grading form and the grading can be done with the predefined rubrics. The text of the rubrics can be edited as well as the points. The points are summed up and from it will automatically be generated the grade. The evaluation report will be generated as a PDF document. The PDF can be viewed in the browser and also be downloaded. 

Each user can access an account page where most of the account information can be edited. For editing the role of the user the admin panel is needed. At this admin panel the administrators of the site can edit the rubrics and also can add or remove users.

## How to set up and start the program

### Used technologies

- Mongoose (for MongoDB) version 8.8.2 
- Express version 4.19.2
- Angular version 17.2.0
- Node.js version 20.11.1
- LaTeX 

The list of technologies contains only the most relevant technologies. More packages are used to make some tasks easier.

### General steps

You need to clone the git repository to your local machine to be able to run the code. Alternatively you need to unpack the received ZIP folder to your system.

### Setup program locally

#### Setup of backend

1. Install Node.js on your system if not already installed. Node.js can be downloaded [here](https://nodejs.org/en/download/prebuilt-installer/current).
2. Install LaTeX on your system if not already installed. After installing LaTeX a restart of your system is recommended to ensure that the program works as expected. TeXLive can be found [here](https://tug.org/texlive/) where you can download LaTeX for your system.
3. In your terminal navigate to the backend folder and execute the following command:

        node server.js

#### Setup of frontend

1. Install Node.js on your system if not already installed. Node.js can be downloaded [here](https://nodejs.org/en/download/prebuilt-installer/current).
2. Install Angular CLI onn your system if not already installed. Further information about Angular can be found [here](https://angular.dev/installation).
3. In your terminal navigate to the frontend folder and execute the following command:

        ng serve --open

### Setup program using Docker

Install Docker on your computer if not allready installed. You can use for example [Docker Desktop](https://www.docker.com/products/docker-desktop/). This is a Docker GUI which can make the use of it later more easy if you are not familiar with the use of Docker.

#### Setup of backend

1. Make sure that Docker is running on your system.
2. Navigate in your terminal to the backend folder.
3. In the backend folder run the command for creating an image from the Dockerfile. You need to replace *name* with the name you want to give the image. You can add a version or something similar to the name seperated by a colon. This would look something like *name:v1*.

        docker build -t name .

> Because of the installation of texlive-full this process will take some time. Please be prepared to wait for up to 20 minutes.

4. Wait till the image is built. After this you can run the container either from Docker Desktop or direktly from the console. Make sure to set the port to 8000, as shown in the command below, to ensure the programm works as expected. Here you also have to replace *name* with the name of the image you created in step 3.

        docker run --env-file .env -p 8000:8000 name

> The .env file is not provided with the sourcecode and needs to be created by the user to ensure a working application.

#### Setup of frontend

1. Make sure that Docker is running on your system.
2. Navigate in your terminal to the frontend folder.
3. In the frontend folder run the command for creating an image from the Dockerfile. You need to replace *name* with the name you want to give the image. You can add a version or something similar to the name seperated by a colon. This would look something like *name:v1*.

        docker build -t name .

4. Wait till the image is built. After this you can run the container either from Docker Desktop or direktly from the console. Here you also have to replace *name* with the name of the image you created in step 3. Also in this case the *port* can be freely choosen. I have tested it with port 4200 and would recommend to set the port to 4200 to ensure the programm works as expected.

        docker run -p port:4200 name

## How to use the program

First you need to log in with your credentials. After the login you will be redirected to the input of the general data. There you add the general data for the student and the thesis and continue with the button below the input form. <br>
The next page shows the grading page. There are shown the rubrics with dropdown menus. You can choose the option for each rubric and give points respectively in the field below the rubric and edit the choosen option text if you want. Then there will be a PDF file generated from these inputs. <br>
The generated PDF file is shown in the next page. With the buttons below you can download the PDF file or edit it - if for example there are some typos or something similar in it. <br>
If you have admin privileges you can also access the admin panel. There you can add new users, edit the list of users (their role or delete them), and also thesis templates can be edited. <br>
Every user can edit their own account details (except the role). The account page can be accessed with the button in the navigation.

## Code documentation

The code is documented with different methods. I will give you an overview below and describe how to get to the documentation needed. Also some informations to additional documentation are added.

### Backend

In the backend there is documentation of the functions which are used in the routes and also of the routes itself. To ensure both are shown in an easy way the documentation is seperated.

#### Functions

The functions are documented with JSDoc and from the JSDoc comments in the code there is created a website which shows all the documentation of the functions. You navigate to docs > backend and there you open the index.html in a browser of your choice and you can see an overview of all the functions on the server.js file. For each function is documented a short summary of what the function does, the parameters it receives and what the function returns.

Inside the code of the functions are sometimes smaller comments to find which are not shown in the documentation. This comments mostly describe which part of the functions does what or something similar. This is only relevant if you need to make changes to the code itself. 

If you make changes to the code and edit the JSDoc comments you need to update the documentation. For this you need to navigate to the backend folder in your terminal. There you need to execute the following command:

        jsdoc server.js -d ../docs/backend

#### Routes

The documentation of the routes is done with Swagger and you can access this documentation with a url and see all the routes documented in detail. The url is dependant on where your backend runs. You need to append the base url with */api-docs/*. When your server runs on localhost:8000 the url will look like this:

        http://localhost:8000/api-docs/

All the routes are shown in this swagger site. Regardless of the shown "try it out" button the execution of the API routes will result in an error statuscode. This is because of the needed authentification in the frontend and ensures that outside of the frontend app no changes can be made to the backend. The documentation of the API nethertheless shows how the routes work with (often shortened) examples.

### Frontend

All components, services and helper files of the frontend are documented with TypeDoc. The documentation can be viewed when you navigate in your terminal to the docs > frontend folder and open the index.html in a browser of your choice.

Sometimes there are some additional informations as comments in the source code if someone else needs to edit the code later on. In the case of editing code and therefore also the documentation you need to update the documentation with the following command in the terminal inside the frontend folder:

        npx typedoc --entryPointStrategy expand ./src -out ../docs/frontend