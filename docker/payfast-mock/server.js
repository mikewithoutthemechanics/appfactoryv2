const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.post('/ipn', (req, res) => {
  console.log('PayFast IPN received:', req.body)
  // In a real scenario, verify and map to tenant here
  res.status(200).send('OK')
})

app.listen(port, () => {
  console.log(`PayFast mock IPN listener running on port ${port}`)
})
