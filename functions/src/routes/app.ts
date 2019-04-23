const functions = require("firebase-functions")
const firebase = require("firebase")
const firebaseHelper = require("firebase-functions-helper")

const express = require("express")
const router = express.Router()
const request = require("request")

firebase.initializeApp({
  apiKey: functions.config().gmr.key,
  authDomain: functions.config().gmr.domain,
  projectId: functions.config().gmr.id
})

const db = firebase.firestore()

const eventsCollection = "events"

// Add new event
router.post("/events", (req, res) => {
  firebaseHelper.firestore.createNewDocument(db, eventsCollection, req.body)
  res.send("Create a new event")
})
// Update new event
router.patch("/events/:eventId", (req, res) => {
  firebaseHelper.firestore.updateDocument(
    db,
    eventsCollection,
    req.params.eventId,
    req.body
  )
  res.send("Update a new event")
})
// View a event
router.get("/events/:eventId", (req, res) => {
  firebaseHelper.firestore
    .getDocument(db, eventsCollection, req.params.eventId)
    .then(doc => res.status(200).send(doc))
})
// View all events
router.get("/events", (req, res) => {
  firebaseHelper.firestore
    .backup(db, eventsCollection)
    .then(data => res.status(200).send(data))
})
// Delete a event
router.delete("/events/:eventId", (req, res) => {
  firebaseHelper.firestore.deleteDocument(
    db,
    eventsCollection,
    req.params.eventId
  )
  res.send("Document deleted")
})

module.exports = router
