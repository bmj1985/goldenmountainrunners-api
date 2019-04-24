const functions = require("firebase-functions")
const firebase = require("firebase")
const firebaseHelper = require("firebase-functions-helper")

const express = require("express")
const router = express.Router()
const request = require("request")
const cors = require("cors")

firebase.initializeApp({
  apiKey: functions.config().gmr.key,
  authDomain: functions.config().gmr.domain,
  projectId: functions.config().gmr.id
})

const db = firebase.firestore()

const eventsCollection = "events"

// const whitelist = [
//   "http://localhost:8080",
//   "https://www.goldenmountainrunners.com"
// ]
// const corsOptions = {
//   origin: function(origin, callback) {
//     console.log("ORIGIN (app):", origin)
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true)
//     } else {
//       callback(new Error("Not allowed by CORS"))
//     }
//   }
// }

router.use(cors())

router.post("/events", (req, res) => {
  firebaseHelper.firestore.createNewDocument(db, eventsCollection, req.body)
  res.send("Create a new event")
})
router.patch("/events/:eventId", (req, res) => {
  firebaseHelper.firestore.updateDocument(
    db,
    eventsCollection,
    req.params.eventId,
    req.body
  )
  res.send("Update a new event")
})
router.get("/events/:eventId", (req, res) => {
  firebaseHelper.firestore
    .getDocument(db, eventsCollection, req.params.eventId)
    .then(doc => res.status(200).send(doc))
})
router.get("/events", (req, res) => {
  firebaseHelper.firestore
    .backup(db, eventsCollection)
    .then(data => res.status(200).send(data))
})
router.delete("/events/:eventId", (req, res) => {
  firebaseHelper.firestore.deleteDocument(
    db,
    eventsCollection,
    req.params.eventId
  )
  res.send("Document deleted")
})

module.exports = router
