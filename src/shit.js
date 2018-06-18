// function foo() {
//   console.log(this)
// }

const foo = () => console.log(this)

class Shit {
  a() {
    foo.call(this)
  }
}

const shit = new Shit()

shit.a()
