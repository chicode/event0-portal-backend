import boilerplate, { update } from './boilerplate'
import { exists, maxLength } from './requirements'
import user from './user'

const mapCtx = (func) => (_, args, ctx) => {
  return func(_, { ...args, input: { ...args.input, author: ctx.userId } }, ctx)
}

async function verify(_, { id }, ctx) {
  if (!(await user.Query.user(_, { id: ctx.userId }, ctx)).projects.includes(id)) {
    throw new Error('Not your project.')
  }
}

async function verifyExists(_, { input: { title } }, ctx) {
  if (await titleProject(_, { title }, ctx)) {
    throw new Error('Project exists.')
  }
}

const requirements = {
  title: [exists, maxLength(10)],
  description: [exists, maxLength(300)],
}

const boiler = boilerplate('project', mapCtx, verify, verifyExists, requirements)

const createProject = async (_, args, ctx) => {
  const { id } = await boiler.Mutation.createProject(
    _,
    {
      ...args,
      input: {
        ...args.input,
        claps: 0,
      },
    },
    ctx,
  )
  await user.Mutation.updateUser(
    _,
    {
      id: ctx.userId,
      input: {
        project: id,
      },
    },
    ctx,
  )
  return boiler.Query.project(_, { id }, ctx)
}

const clap = async (_, { id }, ctx) => {
  await update('project')(
    _,
    { id, input: { claps: (await boiler.Query.project(_, { id }, ctx)).claps + 1 } },
    ctx,
  )
  return boiler.Query.project(_, { id }, ctx)
}

const vote = async (_, { id, category }, ctx) => {
  const pastVoteId = (await user.Query.user(_, { id: ctx.userId }, ctx))[category + 'Vote']
  if (pastVoteId !== id) {
    await user.Mutation.updateUser(_, { input: { [category + 'Vote']: id } }, ctx)
  }
  return boiler.Query.project(_, { id }, ctx)
}

const titleProject = async (_, { title }, { db }) =>
  (await db
    .collection('project')
    .where('title', '==', title)
    .get()).docs.map((doc) => doc.data())[0]

const getVotes = (category) => async (_, args, ctx) => {
  const users = await user.Query.users(_, {}, ctx)
  let i = 0
  for (let user of users) {
    if (user[category + 'Vote'] === _.id) {
      i++
    }
  }
  return i
}

const resolvers = {
  Query: {
    ...boiler.Query,
    titleProject,
  },
  Mutation: {
    ...boiler.Mutation,
    createProject,
    clap,
    vote,
  },
  Project: {
    author: (_, args, ctx) => user.Query.user(_, { id: _.author }, ctx),
    designVotes: getVotes('design'),
    funVotes: getVotes('fun'),
    techVotes: getVotes('tech'),
    creativityVotes: getVotes('creativity'),
    polishVotes: getVotes('polish'),
  },
}

delete resolvers.Mutation.deleteProject

export default resolvers
