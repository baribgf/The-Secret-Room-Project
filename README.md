# The SecretRoom Project

This a `secret room` project where you can get a secret conversation with any persons you invite.
The project is build in `Express js` framework implementing the `Firebase API` for db management.

- You can try the current production version from here: [Goto SecretRoom](https://secretroom.cyclic.app)

## Usage
To start using this project ensure the following steps:

- Install required packages:

```
npm install
```

- Create a firebase realtime database, get the application credentials like stated here: [Firebase docs web](https://firebase.google.com/docs/web/setup) and then paste them as the following:

```
export FB_CREDENTIALS={ \
  apiKey: "API_KEY", \
  authDomain: "PROJECT_ID.firebaseapp.com", \
  databaseURL: "https://DATABASE_NAME.firebaseio.com", \
  projectId: "PROJECT_ID", \
  storageBucket: "PROJECT_ID.appspot.com", \
  messagingSenderId: "SENDER_ID", \
  appId: "APP_ID", \
  measurementId: "G-MEASUREMENT_ID", \
}
```

- Start the server:

```
npm start
```

### Note

This project is under development, so for any feedback please contact me or create an issue, and for contribution just create a pull request.

> Take Care . .
