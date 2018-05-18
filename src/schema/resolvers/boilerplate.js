function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

async function processSingle(id, promise) {
  const result = await promise
  return result.exists ? { id, ...result.data() } : null
}

async function processMultiple(promise) {
  return (await promise).docs.map((doc) => ({ ...doc.data(), id: doc.id }))
}

export const get = (name) => (_, { id }, { db }) => {
  return processSingle(
    id,
    db
      .collection(name)
      .doc(id)
      .get(),
  )
}

export const getAll = (name) => (_, args, { db }) => processMultiple(db.collection(name).get())

export const create = (name) => async (_, { id, input }, { db }) => {
  const result = await (id
    ? db
        .collection(name)
        .doc(id)
        .set(input)
    : db.collection(name).add(input))
  return { id: result.id }
}

export const update = (name) => async (_, { id, input }, { db }) => {
  await db
    .collection(name)
    .doc(id)
    .update(input)
  return { id }
}

export const del = (name) => async (_, { id }, { db }) => {
  await db
    .collection(name)
    .doc(id)
    .delete()
  return { id }
}

function verifyWrap(func, ...checks) {
  return async (_, args, ctx) => {
    if (ctx.newUser) {
      throw new Error('Not yet a user.')
    }
    for (const check of checks) {
      await check(_, args, ctx)
    }
    return func(_, args, ctx)
  }
}

function generateVerifyArgs(requirements) {
  return (_, args, ctx) => {
    for (let key in requirements) {
      for (let check of requirements[key]) {
        if (args.input[key]) {
          const message = check(args.input[key])
          if (message) {
            throw new Error(message)
          }
        }
      }
    }
    return Promise.resolve()
  }
}

export default function(name, mapCtx, verify, verifyExists, requirements) {
  const verifyArgs = generateVerifyArgs(requirements)
  const boilerplate = {
    Query: {
      [name]: get(name),
      [name + 's']: getAll(name),
    },
    Mutation: {
      ['create' + capitalize(name)]: verifyWrap(mapCtx(create(name)), verifyArgs, verifyExists),
      ['update' + capitalize(name)]: verifyWrap(mapCtx(update(name)), verifyArgs, verify),
      ['delete' + capitalize(name)]: verifyWrap(mapCtx(del(name)), verify),
    },
  }
  return boilerplate
}
