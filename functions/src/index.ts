const functions = require("firebase-functions")
const admin = require("firebase-admin")
// const serviceAccount = fs(
//   "./goldenmountainrunnersco-firebase-adminsdk-ml7ce-10558a8c91.json"
// )

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://goldenmountainrunnersco.firebaseio.com"
})

const express = require("express")
const path = require("path")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const cors = require("cors")

const main = express()

main.set("views", "./views")
main.set("view-engine", "jade")

const slackInvite = require("./routes/slackInvite")
const app = require("./routes/app")

main.use("/api/v1", app)
main.use("/slackInvite/", slackInvite)
main.use(bodyParser.json())
main.use(bodyParser.urlencoded({ extended: false }))
main.use(logger("dev"))
main.use(cookieParser())
main.use(express.static(path.join(__dirname, "public")))
main.use(cors({ origin: true }))

main.get("/v1", (req, res) => {
  res.send("Welcome to version one of the Golden Mountain runners api")
})

// catch 404 and forward to error handler
main.use((req, res, next) => {
  const err = new Error("Not Found")
  // @ts-ignore
  err.status = 404
  next(err)
})

// error handler
main.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}
  res.status(err.status || 500)
  res.render("error")
})

export const webApi = functions.https.onRequest(main)
