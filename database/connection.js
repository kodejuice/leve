import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { parseCookies } from "nookies";

const DB_Models = require("./model");

//This script maintains a connection to the database, since Next.js re-runs every script during development,
// heres a safe place to put it
//
//we check if theres already a connection to the database already, if there is return it,
//else create a new one,

//we also store the database models in the connection object, to make sure the models aren't re-compiled everytime.

const mongodb_uri = process.env.MONGODB_URI;

////////////////
// DB Connect //
////////////////

/**
 * Connect to database
 *
 * @return     {Promise}          The database Article model
 */
export async function db_model() {
  // if we connected already then just return the model
  // we stored in the mongoose.connections[] array
  if (mongoose.connections[0].readyState) return mongoose.connections.DB_Models;

  // else create new connection
  await mongoose.connect(mongodb_uri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
    autoIndex: false,
  });

  mongoose.connections.DB_Models = {
    Article: DB_Models.Article(),
  };

  return mongoose.connections.DB_Models;
}

/*
const connectDB = function(handler) {
    return async function(req, res) {
        return handler(req, res);
    }
}*/

/**
 * Curry http request
 *
 * Pass database connection data to http request
 */
const connectDB = (handler) => async (req, res) => {
  // firstly check for authentication token in cookie,
  // if valid, set req.isAuthenticated = true
  const token = parseCookies({ req }).__token;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    req.isAuthenticated = true;
  } catch (err) {
    res.isAuthenticated = false;
  }
  // ...

  return handler(req, res, await db_model());

  // // mongoose connection already acquired
  // if (mongoose.connections[0].readyState)
  //   return handler(req, res, mongoose.connections.DB_Models);

  // // else create new connection
  // await mongoose.connect(uri, {
  //   useNewUrlParser: true,
  //   useFindAndModify: false,
  //   useCreateIndex: true,
  //   useUnifiedTopology: true,
  //   autoIndex: false,
  // });

  // mongoose.connections.DB_Models = {
  //   Article: DB_Models.Article(),
  // };

  // return handler(req, res, mongoose.connections.DB_Models);
};

export default connectDB;
