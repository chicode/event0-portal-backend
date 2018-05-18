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
        funVotes: 0,
        creativityVotes: 0,
        designVotes: 0,
        polishVotes: 0,
        techVotes: 0,
      },
    },
    ctx,
  )
  await user.Mutation.updateUser(
    _,
    {
      id: ctx.userId,
      input: {
        projects: [...(await user.Query.user(_, { id: ctx.userId }, ctx)).projects, id],
      },
    },
    ctx,
  )
  return { id }
}

const deleteProject = async (_, args, ctx) => {
  await boiler.Mutation.deleteProject(_, args, ctx)
  await user.Mutation.updateUser(
    _,
    {
      input: {
        projects: (await user.Query.user(_, { id: ctx.userId }, ctx)).projects.filter(
          (id) => id !== args.id,
        ),
      },
    },
    ctx,
  )
  return { id: args.id }
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
  await update('project')(
    _,
    {
      id,
      input: {
        [category + 'Votes']: (await boiler.Query.project(_, { id }, ctx))[category + 'Votes'] + 1,
      },
    },
    ctx,
  )
  return boiler.Query.project(_, { id }, ctx)
}

const titleProject = async (_, { title }, { db }) =>
  (await db
    .collection('project')
    .where('title', '==', title)
    .get()).docs.map((doc) => doc.data())[0]

export default {
  Query: {
    ...boiler.Query,
    titleProject,
  },
  Mutation: {
    ...boiler.Mutation,
    createProject,
    deleteProject,
    clap,
    vote,
  },
  Project: {
    author: (_, args, ctx) => user.Query.user(_, { id: _.author }, ctx),
  },
}
