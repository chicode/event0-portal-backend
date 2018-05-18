export default `
type User {
  id: ID!
  email: String!
  username: String!
  bio: String
  project: Project
  funVote: Project
  techVote: Project
  designVote: Project
  polishVote: Project
  creativityVote: Project
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
  createUser(input: createUserInput!): User!
  updateUser(input: updateUserInput!): User!
}
`
