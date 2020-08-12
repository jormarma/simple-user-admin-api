# Simple User Admin API

This guid explains the points developed in this API.
Describes the extra functionalities outside of the main requiriemnts.
Also describes those functionalities that are not implemented,
but that have been of great added value to the end solution.

## Description of the solution

The solution is implemented in `Node.js` as a backend technology, and `Mongodb` as a data layer.
Also, a `mongo-express` application has been used to view the contents of the `Mongodb` database in a more visual way.
All of these pieces are deployed in its own docker container, as required by the test.

For testing and documentation purposes, `Postman` has been used.
The development of an Open API description of the API has been discarded due to lack of time.

Given that `Postman` has been used for testing the endpoints manually, the CLI utility `newman` has been used for testing automatically all the functionality, using as inputs the `Postman` collection and environment used.
The **unit testing** part has been discarded due to lack of time and also because the `Postman` tests are more _complete_ in this specific scenario.

Also, for checking the input data, `JSON Schema` has been used for validating the input data of the endpoints requiring some body content, which has been implemented using `JSON` format.

The implemented solution covers completely the main requirements of the test.

It implements the main 4 endpoints of the specification:

1. `POST http://localhost:3000/userapi/v1/login`: User login
2. `POST http://localhost:3000/userapi/v1/users`: User registration
3. `PUT http://localhost:3000/userapi/v1/users/:userid`: User update
4. `DELETE http://localhost:3000/userapi/v1/users/:userid`: User delete

In addition to this, two more endpoints have been developed, to increase the richness of the functionality:

6. `POST http://localhost:3000/userapi/v1/logout`: User Logout
7. `GET http://localhost:3000/userapi/v1/users`: List Users

Moreover, a user field not specified in the main requirements has been added.
Every user has a `role` field with the only possible values of `user` or `admin`.
An `admin` user has some privileges over the `user` ones.

- An `admin` user is able to list the remaining users.
- An `admin` user is able to create / update other users, and to promote those users to be `admin` users.

Also, some more complex scenarios have been implemented, trying to mimic a real-world scenario:

- An `admin` user is created at start-up, and more `admin` users can be created and removed, but _always must remain 1_.
- Only logged in users can update or delete themselves. Only `admin` users can create / update other `admin` users.
- A session mechanism have been implemented for the login / logout functionality,
  stored in the server in the database, and complemented with a corresponding session cookie in the client.
- The password is encrypted with the `bcrypt` algorithm with salt and repetitions, as in a production environment.
- Log functionality have been added to the application, both as a middleware and manual when required.

All of these functionalities are demonstrated with its corresponding Postman tests.

## Starting the application

There are two ways to start all the modules of the application, one for development and other for _production_.

```bash
git clone https://github.com/jormarma/simple-user-admin-api
cd simple-user-admin-api
docker-compose up --force-recreate
```

These commands start 3 docker containers that talk to each other and allow the use of the endpoints described in the previous section.

- `userapi` contains the web server that implements the services.
- `userapi-mongo` contianing the database.
- `mongo-express` with the mongodb web admin.

Starting the containers in this way, you can develop and change the code, and the web server will restart automatically responding to those changes. On the other hand, if you use the command:

```bash
docker-compose -f docker-compose-prod.yml up --force-recreate
```

The code is embedded in the container, and further changes will not have efect on the currently deployed application.

After all the endpoints started, you can execute the Postman tests using the following command:

```bash
npm test
```

All of them should pass successfully. The previous command makes use of the `test/test-collection.json` Postman collection and the `test/test-environment.json` Postman environment.

The `Postman` collection is divided in seven folders, each one testing several use cases. All of them assume a clean database with a single `auth` user:

- Register User
- Login
- Update User
- Delete User
- List Users
- Update user to admin role
- Create admin user

### Register user

- It tests that a user can register without previously being logged in.
- Checks that a user can not register with an existing email in the system.
- It checks that a non logged-in user can not register with admin role.
- It checks the validity of the fields of the user. For this, it checks the format and presence of the fields. This information is specified in the `schema/*-schema.json` files provided in the project, which are `JSON Schema` files that the API uses for input validation.

### Login

- Checks that a user can not log in without valid email.
- Checks that a user can not log in if it does not exist in the system.
- Checks that a user is properly logged in if the email and password exist in the system and are correct.
- Check that logging in being already logged in has no effect.

### Update User

- Checks that an update with data invalid or not properly formatted is rejected.
- Checks that an attempt to update without being the current logged in user is prevented.
- The `password` field is mandatory to check that the current user matches the user that is going to be updated.
- Checks that if a user enters valid data being logged in and trying to modify its own data, it succeeds.

### Delete User

- Checks that a user cannot be deleted if it is not logged in.
- But that it can be deleted if it is logged in. When deleted, it becomes automatically logged out.
- Checks also that an `admin` user cannot delete itself if it is tha only `admin` user in the system.

### List users

- Check that an `admin` user can list and see the information of other registered users.
- Checks that a non-`admin` user can not perform a listing of the users.

### Update user to admin role

- Checks that an `admin` user is able to register, and after upgrade a user with `user` role to an `admin` role.

### Create admin user

- Checks that a logged in `admin` user is able to register another `admin` user.
- Checks that the new `admin` user has the same privileges (list users) than the original `admin` user.

