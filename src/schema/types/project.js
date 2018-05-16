export default `
type Project {
  id: ID!
  title: String!
  description: String!
  author: ID!
}

extend type Query {
  project(id: ID!): Project
  projects: [Project]!
}

input createProjectInput {
  title: String!
  description: String!
}

input updateProjectInput {
  title: String
  description: String
}

extend type Mutation {
  createProject(input: createProjectInput!): Result!
  updateProject(id: ID!, input: updateProjectInput!): Result!
  deleteProject(id: ID!): Result!
}
`
