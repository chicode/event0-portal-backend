import '@babel/polyfill'

import fetch from 'node-fetch'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

import googleSecret from './google.secret'
import testingSecret from './testing.secret'
import schema from './schema'

import db from './db'

/* eslint-disable no-unused-vars */
const verifyToken = async (req, res, next) => {
  req.context = {}

  if (req.get('Authorization')) {
    const token = req.get('Authorization').split(' ')[1]

    let id, email

    if (token === testingSecret.token) {
      id = testingSecret.id
      email = testingSecret.email
    } else {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + token,
      )
      if (response.status !== 200) {
        res.status(401).json({ error: 'Invalid token.' })
        return
      }
      const json = await response.json()

      email = json.email

      if (
        json.aud !== googleSecret.web.client_id ||
        Date.now() > json.exp * 1000 ||
        json.error_description
      ) {
        res.status(401).json({ error: 'Invalid token.' })
        return
      }
      id = json.sub
    }

    req.context.userId = id
    req.context.userEmail = email

    const user = await db
      .collection('user')
      .doc(id)
      .get()
    if (!user.exists) {
      req.context.newUser = true
    }
  } else {
    res.status(401).json({ error: 'Missing authorization header.' })
    return
  }

  next()
}

const app = express()
app.use(morgan('tiny'))
app.use(cors())

app.post(
  '/graphql',
  bodyParser.json(),
  // verifyToken
  graphqlExpress((req) => ({
    context: { ...req.context, db },
    schema,
  })),
)
if (process.env.NODE_ENV === 'development') {
  app.get(
    '/graphiql',
    graphiqlExpress(() => ({
      passHeader: `'Authorization': 'Bearer ${testingSecret.token}'`,
      endpointURL: '/graphql',
    })),
  )
}

export const server = functions.https.onRequest(app)
if (process.env.NODE_ENV === 'development') {
  app.listen(3000, () => console.log('Graphiql on http://localhost:3000/graphiql'))
}
