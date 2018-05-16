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

export const get = (name) => (_, { id }, { db }) =>
  processSingle(
    id,
    db
      .collection(name)
      .doc(id)
      .get(),
  )

export const getAll = (name) => (_, args, { db }) => processMultiple(db.collection(name).get())

export const create = (name) => (_, { id, input }, { db }) => {
  return id
    ? db
        .collection(name)
        .doc(id)
        .set(input)
    : db.collection(name).add(input)
}

export const update = (name) => (_, { id, input }, { db }) =>
  db
    .collection(name)
    .doc(id)
    .update(input)

export const del = (name) => (_, { id }, { db }) =>
  db
    .collection(name)
    .doc(id)
    .delete()

function verifyWrap(check, message, func) {
  return async (_, args, ctx) => {
    if (!ctx.newUser && (await check(_, args, ctx))) {
      return func(_, args, ctx)
    } else if (ctx.newUser) {
      throw new Error('Not yet a user.')
    } else {
      throw new Error(message)
    }
  }
}

export default function(name, verify, verifyExists, mapCtx) {
  const boilerplate = {
    Query: {
      [name]: get(name),
      [name + 's']: getAll(name),
    },
    Mutation: {
      ['create' + capitalize(name)]: verifyWrap(
        verifyExists,
        'Already exists.',
        mapCtx(create(name)),
      ),
      ['update' + capitalize(name)]: verifyWrap(verify, 'Not authorized.', mapCtx(update(name))),
      ['delete' + capitalize(name)]: verifyWrap(verify, 'Not authorized.', mapCtx(del(name))),
    },
  }
  return boilerplate
}
