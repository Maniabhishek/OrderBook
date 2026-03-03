const Link = require('grenache-nodejs-link')
const { PeerRPCServer, PeerRPCClient } = require('grenache-nodejs-http')
const OrderBook = require('./orderbook')

const SERVICE = 'exchange:p2p'
const PORT = process.argv[2] || 5000
const nodeId = `node-${PORT}`

// create Link for DHT connection
const link = new Link({
  grape: 'http://127.0.0.1:30001'
})

link.start()


// create RPC Server to receives orders
const peerServer = new PeerRPCServer(link, {})
peerServer.init()
peerServer.transport('server').listen(PORT)


// create RPC Client to sends orders
const peerClient = new PeerRPCClient(link, {})
peerClient.init()

const orderBook = new OrderBook(nodeId)

// announce service to DHT
setInterval(() => {
  link.announce(SERVICE, PORT, {})
}, 1000)


// Handle incoming requests
peerServer.on('request', async (rid, key, payload, handler) => {
  if (key === SERVICE && payload.type === 'order') {
    console.log(`[${nodeId}] Received Order`, payload.order)

    await orderBook.process(payload.order)

    handler.reply(null, { ok: true })
  }
})

console.log(`Node running on ${PORT}`)

// Brodcast order to peers
function broadcast(order) {
    peerClient.request(
        SERVICE,
        { type: 'order', order },
        { timeout: 5000 },
        (err) => {
        if (err && err.message !== 'ERR_GRAPE_LOOKUP_EMPTY') {
            console.error('Broadcast error:', err.message)
            }
        }
    )
}


// simulate local oder every 7 seconds
setInterval(async () => {
    const type = Math.random() > 0.5 ? 'buy' : 'sell'
    const price = Math.floor(Math.random() * 50) + 1
    const qty = Math.floor(Math.random() * 5) + 1

    const order = orderBook.createOrder(type, price, qty)

    console.log(`[${nodeId}] New Local Order`, order)

    await orderBook.process(order)
    broadcast(order)
}, 7000)