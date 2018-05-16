import boilerplate from './boilerplate'
import user from './user'

const mapCtx = (func) => (_, args, ctx) => {
  return func(_, { ...args, input: { ...args.input, author: ctx.userId } }, ctx)
}
const verify = async (_, { id }, ctx) =>
  (await user.Query.user(_, ctx.userId, ctx)).projects.includes(id)
const verifyExists = async (_, { input: { title } }, ctx) => {
  return (await titleProject(_, { title }, ctx)).length === 0
}

const createProject = async (_, args, ctx) => {
  await boiler.Mutation.createProject(_, args, ctx)
  return user.Mutation.updateUser(
    _,
    {
      projects: [...(await user.Query.user(_, { id: ctx.userId }, ctx)).projects, args.id],
    },
    ctx,
  )
}

const deleteProject = async (_, args, ctx) => {
  await boiler.Mutation.deleteProject(_, args, ctx)
  return user.Mutation.updateUser(
    _,
    {
      projects: (await user.Query.user(_, { id: args.author }, ctx)).projects.filter(
        (id) => id !== args.id,
      ),
    },
    ctx,
  )
}

const titleProject = async (_, { title }, { db }) =>
  (await db
    .collection('project')
    .where('title', '==', title)
    .get()).docs.map((doc) => doc.data())

const boiler = boilerplate('project', verify, verifyExists, mapCtx)

export default {
  Query: {
    ...boiler.Query,
    titleProject,
  },
  Mutation: {
    ...boiler.Mutation,
    createProject: mapCtx(createProject),
    deleteProject: mapCtx(deleteProject),
  },
}
