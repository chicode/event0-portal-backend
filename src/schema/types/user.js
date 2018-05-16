export default `
type User {
  id: ID!
  email: String!
  username: String!
  bio: String
  projects: [ID]!
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
  projects: [ID]
}

type Mutation {
  createUser(input: createUserInput!): Result!
  updateUser(input: updateUserInput!): Result!
}
`
