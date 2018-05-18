export default `
type Project {
  id: ID!
  title: String!
  description: String!
  author: User!
  claps: Int!
}

extend type Query {
  titleProject(title: String!): Project
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
  createProject(input: createProjectInput!): Project!
  clap(id: ID!): Project!
  updateProject(id: ID!, input: updateProjectInput!): Project!
  deleteProject(id: ID!): Project!
}
`
