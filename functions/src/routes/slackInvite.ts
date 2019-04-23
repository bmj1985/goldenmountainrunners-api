import { Request, Response } from "express"
import { Http2ServerResponse } from "http2"

const express = require("express")
const router = express.Router()
const request = require("request")

const config = require("../config")
const { badge } = require("../lib/badge")

const sanitize = require("sanitize")

router.get("/", function(req: Request, res: Response) {
  //   res.setLocale(config.locale)
  res.render("index", {
    community: config.community,
    tokenRequired: !!config.inviteToken,
    recaptchaSiteKey: config.recaptchaSiteKey
  })
})

console.log("hello world")

router.post("/invite/", function(req: any, res: any) {
  if (
    req.body.email &&
    (!config.inviteToken ||
      (!!config.inviteToken && req.body.token === config.inviteToken))
  ) {
    function doInvite() {
      request.post(
        {
          url: "https://" + config.slackUrl + "/api/users.admin.invite",
          form: {
            email: req.body.email,
            token: config.slacktoken,
            set_active: true
          }
        },
        function(err: Error, httpResponse: Http2ServerResponse, body: any) {
          // body looks like:
          //   {"ok":true}
          //       or
          //   {"ok":false,"error":"already_invited"}
          if (err) {
            return res.send("Error:" + err)
          }
          body = JSON.parse(body)
          if (body.ok) {
            res.render("result", {
              community: config.community,
              message:
                "Success! Check &ldquo;" +
                req.body.email +
                "&rdquo; for an invite from Slack."
            })
          } else {
            let error = body.error
            if (error === "already_invited" || error === "already_in_team") {
              res.render("result", {
                community: config.community,
                message:
                  "Success! You were already invited.<br>" +
                  'Visit <a href="https://' +
                  config.slackUrl +
                  '">' +
                  config.community +
                  "</a>"
              })
              return
            } else if (error === "invalid_email") {
              error = "The email you entered is an invalid email."
            } else if (error === "invalid_auth") {
              error =
                "Something has gone wrong. Please contact a system administrator."
            }

            res.render("result", {
              community: config.community,
              message: "Failed! " + error,
              isFailed: true
            })
          }
        }
      )
    }
    if (!!config.recaptchaSiteKey && !!config.recaptchaSecretKey) {
      request.post(
        {
          url: "https://www.google.com/recaptcha/api/siteverify",
          form: {
            response: req.body["g-recaptcha-response"],
            secret: config.recaptchaSecretKey
          }
        },
        function(err: Error, httpResponse: Http2ServerResponse, body: any) {
          if (typeof body === "string") {
            body = JSON.parse(body)
          }

          if (body.success) {
            doInvite()
          } else {
            const error = new Error("Invalid captcha.")
            res.render("result", {
              community: config.community,
              message: "Failed! " + error,
              isFailed: true
            })
          }
        }
      )
    } else {
      doInvite()
    }
  } else {
    const errMsg = []
    if (!req.body.email) {
      errMsg.push("your email is required")
    }

    if (!!config.inviteToken) {
      if (!req.body.token) {
        errMsg.push("valid token is required")
      }

      if (req.body.token && req.body.token !== config.inviteToken) {
        errMsg.push("the token you entered is wrong")
      }
    }

    res.render("result", {
      community: config.community,
      message: "Failed! " + errMsg.join(" and ") + ".",
      isFailed: true
    })
  }
})

router.get("/badge.svg", (req: any, res: any) => {
  request.get(
    {
      url: "https://" + config.slackUrl + "/api/users.list",
      qs: {
        token: config.slacktoken,
        presence: true
      }
    },
    function(err: Error, httpResponse: Http2ServerResponse, body: any) {
      try {
        body = JSON.parse(body)
      } catch (e) {
        return res.status(404).send("")
      }
      if (!body.members) {
        return res.status(404).send("")
      }

      const members = body.members.filter(function(m: any) {
        return !m.is_bot
      })
      const total = members.length
      const presence = members.filter(function(m: any) {
        return m.presence === "active"
      }).length

      const hexColor = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      sanitize.middleware.mixinFilters(req)

      res.type("svg")
      res.set("Cache-Control", "max-age=0, no-cache")
      res.set("Pragma", "no-cache")
      res.send(
        badge(
          presence,
          total,
          req.queryPattern("colorA", hexColor),
          req.queryPattern("colorB", hexColor)
        )
      )
    }
  )
})

module.exports = router
