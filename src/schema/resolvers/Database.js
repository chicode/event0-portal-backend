export default class Database {
  constructor(name, db) {
    this.name = name
    this.db = db
  }

  async get(id) {
    const result = await this.db
      .collection(this.name)
      .doc(id)
      .get()
    return result.exists ? { id, ...result.data() } : null
  }

  async getAll(id) {
    const result = await this.db.collection(this.name).get()
    return result.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
  }

  async create(id, input) {
    console.log(id, 'create')
    if (id) {
      await this.db
        .collection(this.name)
        .doc(id)
        .set(input)
      return id
    } else {
      return (await this.db.collection(this.name).add(input)).id
    }
  }

  async update(id, input) {
    await this.db
      .collection(this.name)
      .doc(id)
      .update(input)
    return id
  }

  async delete(id) {
    await this.db
      .collection(this.name)
      .doc(id)
      .delete()
    return id
  }
}
