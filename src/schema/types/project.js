export default `
enum Category {
  fun
  tech
  creativity
  polish
  design
}

type Project {
  id: ID!
  title: String!
  description: String!
  author: User!
  claps: Int!
  funVotes: Int!
  techVotes: Int!
  designVotes: Int!
  polishVotes: Int!
  creativityVotes: Int!
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
  vote(id: ID!, category: Category!): Project!
  unvote(id: ID!, category: Category!): Project!
  updateProject(id: ID!, input: updateProjectInput!): Project!
  deleteProject(id: ID!): Project!
}
`
