import boilerplate, { get } from './boilerplate'
import { exists, maxLength } from './requirements'
import project from './project'

const mapCtx = (func) => (_, args, ctx) =>
  func(_, { ...args, id: ctx.userId, input: { ...args.input, email: ctx.userEmail } }, ctx)
const verifyExists = async (_, args, ctx) => (await get('user')(_, { id: ctx.userId }, ctx)).exists
const requirements = {
  username: [exists, maxLength(10)],
  bio: [exists, maxLength(300)],
}

const boiler = boilerplate('user', mapCtx, () => Promise.resolve(), verifyExists, requirements)

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
  User: {
    project: (_, args, ctx) => project.Query.project(_, { id: _.project }, ctx),
  },
}

delete resolvers.Mutation.deleteUser

export default resolvers
