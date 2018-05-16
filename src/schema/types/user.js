export default `
type User {
  id: ID!
  email: String!
  username: String!
  bio: String
  project: Project
}

type Query {
  user(id: ID!): User
  users: [User]!
}

input createUserInput {
  username: String!
}

input updateUserInput {
  bio: String
  username: String
}

type Mutation {
  createUser(input: createUserInput!): Result!
  updateUser(input: updateUserInput!): Result!
}
`
