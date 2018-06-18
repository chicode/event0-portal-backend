export default `
enum Level {
  Beginner
  Intermediate
  Advanced
}

enum Language {
  Python
}

type Workshop {
  id: ID!
  title: String!
  description: String!
  level: Level!
  duration: Int!
  language: Language!
  slides: [Slide]!
}

type Slide {
  title: String!
  description: String!
  instructions: [Instruction]!
}

type Instruction {
  description: String!
  correctCode: [String!]!
}

type Query {
  getWorkshop(id: ID!): Workshop
  getAllWorkshop: [Workshop]!
}

type Mutation {
  _: Boolean
}
`
