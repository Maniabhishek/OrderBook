const { v4: uuid } = require('uuid')
const OrderMatching = require('./helper/orderMatching')
const Mutex = require('./utils/mutex')

class OrderBook {
    constructor(nodeId) {
        this.nodeId = nodeId
        this.engine = new OrderMatching()
        this.processed = new Set()
        this.mutex = new Mutex()
    }

    createOrder(type, price, quantity) {
        return {
            id: uuid(),
            nodeId: this.nodeId,
            type,
            price,
            quantity,
            timestamp: Date.now()
        }
    }

    async process(order) {
        if (this.processed.has(order.id)) return

        await this.mutex.lock()

        try {
            if (this.processed.has(order.id)) return

            this.processed.add(order.id)

            const matchedOrders = this.engine.processRequest({ ...order })

            if (matchedOrders.length > 0) {
                console.log(`[${this.nodeId}] Trades:`, matchedOrders)
            }
        } finally {
            this.mutex.unlock()
        }
    }
}

module.exports = OrderBook