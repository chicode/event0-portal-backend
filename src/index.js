import '@babel/polyfill'

import path from 'path'
import fetch from 'node-fetch'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

import serviceAccount from './secret-firebase'
import googleSecret from './secret-google'
import testingSecret from './secret-testing'
import schema from './schema'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://event0-portal.firebaseio.com',
})
const db = admin.firestore()

const app = express()
app.use(morgan('tiny'))
app.use(cors())

app.post(
  '/graphql',
  bodyParser.json(),
  async (req, res, next) => {
    req.context = {}

    if (req.get('Authorization')) {
      const token = req.get('Authorization').split(' ')[1]

      let id

      if (token === testingSecret.token) {
        id = testingSecret.id
      } else {
        const response = await fetch(
          'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + token
        )
        if (response.status !== 200) {
          res.status(401).json({ error: 'Invalid token.' })
          return
        }
        const json = await response.json()
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

      const user = await db
        .collection('users')
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
  },
  graphqlExpress((req) => ({
    context: { ...req.context, db },
    schema,
  }))
)
if (process.env.NODE_ENV === 'development') {
  app.get(
    '/graphiql',
    graphiqlExpress(() => ({
      passHeader: `'Authorization': 'Bearer ${testingSecret.token}'`,
      endpointURL: '/graphql',
    }))
  )
}

module.exports.server = functions.https.onRequest(app)
if (process.env.NODE_ENV === 'development') {
  app.listen(3000, () => console.log('Listening on http://localhost:3000'))
}
