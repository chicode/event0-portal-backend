import * as admin from 'firebase-admin'

import serviceAccount from './firebase.secret'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://chicode-site.firebaseio.com',
})
export default admin.firestore()
