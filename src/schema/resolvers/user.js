import boilerplate from './boilerplate'

const boiler = boilerplate(
  'user',
  () => Promise.resolve(),
  (func) => (_, args, { user, email, ...other }) => func(_, { ...args, id: user, email }, other),
)

const resolvers = {
  Query: {
    ...boiler.Query,
  },
  Mutation: {
    ...boiler.Mutation,
    createUser: (_, args, ctx) => boiler.Mutation.createUser(_, args, { ...ctx, newUser: false }),
  },
}

delete resolvers.Mutation.deleteUser

export default resolvers
