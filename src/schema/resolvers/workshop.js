import Boilerplate from './Boilerplate'
import db from '../../db'

class Workshop extends Boilerplate {}

const excludes = { Mutation: true }

export default new Workshop('workshop', db, {
  excludes,
})
