import boilerplate, { get } from './boilerplate'
import { exists, maxLength } from './requirements'
import project from './project'

const mapCtx = (func) => (_, args, ctx) =>
  func(_, { ...args, id: ctx.userId, input: { ...args.input, email: ctx.userEmail } }, ctx)

async function verifyExists(_, args, ctx) {
  if (await get('user')(_, { id: ctx.userId }, ctx)) {
    throw new Error('Project exists.')
  }
}
const requirements = {
  username: [exists, maxLength(30)],
  bio: [exists, maxLength(10000)],
}

const boiler = boilerplate('user', mapCtx, () => Promise.resolve(), verifyExists, requirements)

// const createUser = async (_, args, ctx) => {
//   await boiler.Mutation.createUser(
//     _,
//     { ...args, input: { ...args.input } },
//     { ...ctx, newUser: false },
//   )
//   return boiler.Query.user(_, { id: ctx.userId }, ctx)
// }

const resolvers = {
  Query: {
    ...boiler.Query,
  },
  Mutation: {
    ...boiler.Mutation,
    // createUser,
  },
  User: {
    project: (_, args, ctx) =>
      _.project ? project.Query.project(_, { id: _.project }, ctx) : null,
    funVote: (_, args, ctx) =>
      _.funVote ? project.Query.project(_, { id: _.funVote }, ctx) : null,
    creativityVote: (_, args, ctx) =>
      _.creativityVote ? project.Query.project(_, { id: _.creativityVote }, ctx) : null,
    techVote: (_, args, ctx) =>
      _.techVote ? project.Query.project(_, { id: _.techVote }, ctx) : null,
    polishVote: (_, args, ctx) =>
      _.polishVote ? project.Query.project(_, { id: _.polishVote }, ctx) : null,
    designVote: (_, args, ctx) =>
      _.designVote ? project.Query.project(_, { id: _.designVote }, ctx) : null,
  },
}

delete resolvers.Mutation.deleteUser

export default resolvers
