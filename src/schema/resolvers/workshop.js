import Boilerplate from './Boilerplate'
import db from '../../db'

class Workshop extends Boilerplate {}

const excludes = { Mutation: true }

const workshop = new Workshop('workshop', db, {
  excludes,
})

export default workshop
