import workshop from './schema/resolvers/workshop'
import fs from 'fs'

// function shit(target, key, descriptor) {
//   descriptor.value = function() {
//     target['bitch'].call(this)
//   }
//   return descriptor
// }

// class Parent {
//   foo() {}
// }

// class Fuck extends Parent {
//   methods = []
//   fuck = 'fuck'

//   bitch() {
//     // console.log(this.fuck)
//   }

//   @shit
//   cunt() {
//     // console.log(1)
//   }
// }

// const a = new Fuck()

// a.cunt()
// console.log(a.super)

const json = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
// // console.log(a)
workshop.create(null, json).then(() => console.log(1))
