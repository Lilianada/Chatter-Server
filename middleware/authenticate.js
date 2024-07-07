const { getAuth } = require('firebase-admin/auth');
const admin = require('firebase-admin');
const { initializeApp } = require('firebase-admin/app');
const serviceAccount = require("../chatter-app-f65ae-firebase-adminsdk-jtrqy-93d345b6aa.json");

if (admin.apps.length === 0) {
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
});
}

const db = admin.firestore();

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
    console.log(token)
  if (!token) {
    return res.status(401).send('No token provided');
  }
//   console.log(getAuth().verifyIdToken(token))

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).send('Failed to authenticate token');
  }
};

module.exports = {authenticate, admin, db};
