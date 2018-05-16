import boilerplate from './boilerplate'
import user from './user'

const boiler = boilerplate(
  'project',
  async (_, { id }, ctx) => (await user.user(ctx.user)).projects.includes(id),
  (func) => (_, args, { user, ...other }) =>
    func(_, { ...args, input: { ...args.input, author: user } }, other),
)

export default {
  Query: {
    ...boiler.Query,
  },
  Mutation: {
    ...boiler.Mutation,
    createProject: async (_, args, ctx) => {
      await boiler.createProject(_, args, ctx)
      await user.updateUser(
        _,
        {
          projects: [...(await user.user(_, { id: ctx.user })).projects, args.id],
        },
        ctx,
      )
    },
    deleteProject: async (_, args, ctx) => {
      await boiler.deleteProject(_, args, ctx)
      await user.updateUser(
        _,
        {
          projects: (await user.user(_, { id: args.author })).projects.filter(
            (id) => id !== args.id,
          ),
        },
        ctx,
      )
    },
  },
}
