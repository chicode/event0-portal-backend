import Database from './Database'

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function verifyWrap(...checks) {
  return (target, key, descriptor) => {
    let fn = descriptor.value

    descriptor.value = async function(...args) {
      for (const check of checks) {
        await this[check](...args)
      }

      return fn.call(this, ...args)
    }
    return descriptor
  }
}

function query(target, key, descriptor) {
  queries[key] = descriptor.value
  return descriptor
}

function mutation(target, key, descriptor) {
  mutations[key] = descriptor.value
  return descriptor
}

function callWithOverrides(call) {
  return (target, key, descriptor) => {
    descriptor.value = async function(_, args, ctx) {
      if (this.overrides[key]) return call.call(this, this.overrides[key], args)
      else return call.call(this, this.getSuper(key).bind(this), args)
    }
    return descriptor
  }
}

function mutationReply(target, key, descriptor) {
  let fn = descriptor.value
  descriptor.value = async function(_, { id, input }, ctx) {
    const newId = await fn.call(this, id, input)
    console.log(newId)
    return this.getSuper('get').call(this, id || newId)
  }
  return descriptor
}

function mapCtx(target, key, descriptor) {
  let fn = descriptor.value
  descriptor.value = function(...args) {
    return this.mapCtx(fn).call(this, ...args)
  }
  return descriptor
}

let queries = {}
let mutations = {}

export default class Boilerplate extends Database {
  constructor(name, db, options = {}) {
    super(name, db)
    this.verifyArgs = options.argRequirements
      ? Boilerplate.generateVerifyArgs(options.argRequirements)
      : () => Promise.resolve()
    this.verifyExistance = options.verifyExistance || (() => Promise.resolve())
    this.verifyOwnership = options.verifyOwnership || (() => Promise.resolve())
    this.defaults = options.defaults || {}
    this.overrides = options.overrides || {}
    this.excludes = options.excludes || {}
    this.mapCtx = function(func) {
      return function(_, args, ctx) {
        func.call(this, _, options.mapCtx ? options.mapCtx(args, ctx) : args, ctx)
      }
    }

    this.boilerplate = { Query: {}, Mutation: {} }
    let capitalizedName = capitalize(this.name)
    for (let [method, funcs] of [['Query', queries], ['Mutation', mutations]]) {
      if (!this.excludes[method] || typeof this.excludes[method] === 'object') {
        for (let [name, func] of Object.entries(funcs)) {
          if (!this.excludes[method] || this.excludes[method][name + capitalizedName]) {
            this.boilerplate[method][name ? name + capitalizedName : this.name] = func.bind(this)
          }
        }
      }
    }
  }

  static generateVerifyArgs(requirements) {
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

  @query
  @callWithOverrides(function(func, { id }) {
    return func(id)
  })
  get() {}

  @query
  @callWithOverrides(function(func, { id }) {
    return func(id)
  })
  getAll() {}

  @mutation
  @mutationReply
  @verifyWrap('verifyArgs', 'verifyExistance')
  @mapCtx
  @callWithOverrides(function(func, { id, input }) {
    return func(id, { ...input, ...this.defaults })
  })
  create() {}

  @mutation
  @mutationReply
  @verifyWrap('verifyArgs', 'verifyOwnership')
  @mapCtx
  @callWithOverrides(function(func, { id, input }) {
    return func(id, input)
  })
  update() {}

  @mutation
  @mutationReply
  @verifyWrap('verifyOwnership')
  @mapCtx
  @callWithOverrides(function(func, { id }) {
    return func(id)
  })
  delete() {}

  getSuper(key) {
    return super[key]
  }
}
