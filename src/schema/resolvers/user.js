import boilerplate, { get } from './boilerplate'

const mapCtx = (func) => (_, args, ctx) =>
  func(_, { ...args, id: ctx.userId, input: { ...args.input, email: ctx.userEmail } }, ctx)
const verifyExists = async (_, args, ctx) => {
  return (await get('user')(_, { id: ctx.userId }, ctx)).exists
}

const boiler = boilerplate('user', () => Promise.resolve(true), verifyExists, mapCtx)

const resolvers = {
  Query: {
    ...boiler.Query,
  },
  Mutation: {
    ...boiler.Mutation,
    createUser: (_, args, ctx) =>
      boiler.Mutation.createUser(
        _,
        { ...args, input: { ...args.input, projects: [] } },
        { ...ctx, newUser: false },
      ),
  },
}

delete resolvers.Mutation.deleteUser

export default resolvers
