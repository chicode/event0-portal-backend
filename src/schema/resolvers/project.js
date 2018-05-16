import boilerplate from './boilerplate'
import { exists, maxLength } from './requirements'
import user from './user'

const mapCtx = (func) => (_, args, ctx) => {
  return func(_, { ...args, input: { ...args.input, author: ctx.userId } }, ctx)
}

async function verify(_, { id }, ctx) {
  if (!(await user.Query.user(_, ctx.userId, ctx)).projects.includes(id)) {
    throw new Error('Not your project.')
  }
}

async function verifyExists(_, { input: { title } }, ctx) {
  if ((await titleProject(_, { title }, ctx)).length !== 0) {
    throw new Error('Project exists.')
  }
}

const requirements = {
  title: [exists, maxLength(10)],
  description: [exists, maxLength(300)],
}

const boiler = boilerplate('project', mapCtx, verify, verifyExists, requirements)

const createProject = async (_, args, ctx) => {
  const { id } = await boiler.Mutation.createProject(_, args, ctx)
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

const titleProject = async (_, { title }, { db }) =>
  (await db
    .collection('project')
    .where('title', '==', title)
    .get()).docs.map((doc) => doc.data())

export default {
  Query: {
    ...boiler.Query,
    titleProject,
  },
  Mutation: {
    ...boiler.Mutation,
    createProject: createProject,
    deleteProject: deleteProject,
  },
}
