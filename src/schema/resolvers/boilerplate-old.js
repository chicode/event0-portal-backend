function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

async function processSingle(id, promise) {
  const result = await promise
  return result.exists ? { id, ...result.data() } : null
}

async function processMultiple(promise) {
  return (await promise).docs
}

// ctx - whether or not to use id from auth headers
export function get(name, ctx = false) {
  return {
    [name]: (_, { id }, { db, user }) =>
      processSingle(
        ctx ? user : id,
        db
          .collection(name)
          .doc(ctx ? user : id)
          .get(),
      ),
  }
}

export function getAll(name) {
  return {
    [name + 's']: (_, args, { db }) => processMultiple(db.collection(name).get()),
  }
}

export function create(name, ctx = false) {
  return {
    ['create' + capitalize(name)]: (_, { id, ...other }, { db, user }) =>
      id
        ? db
            .collection(name)
            .doc(ctx ? user : id)
            .set(other)
        : db.collection(name).add(other),
  }
}

export function update(name, ctx = false) {
  return {
    ['update' + capitalize(name)]: (_, { id, ...other }, { db, user }) =>
      db
        .collection(name)
        .doc(ctx ? user : id)
        .update(other),
  }
}

export function del(name, ctx = false) {
  return {
    ['delete' + capitalize(name)]: (_, { id }, { db, user }) =>
      db
        .collection(name)
        .doc(ctx ? user : id)
        .delete(),
  }
}

export default (name, ctx) => ({
  Query: {
    ...get(name, ctx),
    ...getAll(name, ctx),
  },
  Mutation: {
    ...create(name, ctx),
    ...update(name, ctx),
    ...del(name, ctx),
  },
})
