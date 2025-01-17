var tape = require('tape')
var level = require('level-mem')
var concat = require('concat-stream')
var multileveldown = require('../')

tape('two concurrent iterators', function (t) {
  var db = level()
  var server = multileveldown.server(db)
  var client = multileveldown.client()

  server.pipe(client.connect()).pipe(server)

  var batch = []
  for (var i = 0; i < 100; i++) batch.push({ type: 'put', key: 'key-' + i, value: 'value-' + i })

  client.batch(batch, function (err) {
    t.error(err)

    var rs1 = client.createReadStream()
    var rs2 = client.createReadStream()

    rs1.pipe(concat(function (list1) {
      t.same(list1.length, 100)
      rs2.pipe(concat(function (list2) {
        t.same(list2.length, 100)
        t.end()
      }))
    }))
  })
})
