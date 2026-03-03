
class OrderMatching {
    constructor() {
        this.buyOrders = [];
        this.sellOrders = [];
    }

    processRequest(order){
        if(order.type === 'buy'){
            return this.buy(order)
        }
        return this.sell(order)
    }

    buy(order){
        this.sellOrders.sort((a,b)=> a.price - b.price || a.timestamp - b.timestamp)
        const matchedOrders = []

        for(let i = 0; i < this.sellOrders.length && order.quantity > 0; i++){
            const sellOrder = this.sellOrders[i];
            if(sellOrder.price <= order.price){
                const matchedQuantity = Math.min(order.quantity, sellOrder.quantity);
                order.quantity -= matchedQuantity;
                sellOrder.quantity -= matchedQuantity;
                matchedOrders.push({ price: sellOrder.price, quantity: matchedQuantity });
                if(sellOrder.quantity === 0){
                    this.sellOrders.splice(i, 1);
                    i--;
                }
            }
        }
        if(order.quantity > 0){
            this.buyOrders.push(order);
        }
        return matchedOrders;
    }

    sell(order){
        this.buyOrders.sort((a,b)=> b.price - a.price || a.timestamp - b.timestamp)
        const matchedOrders = []

        for(let i = 0; i < this.buyOrders.length && order.quantity > 0; i++){
            const buyOrder = this.buyOrders[i];
            if(buyOrder.price >= order.price){
                const matchedQuantity = Math.min(order.quantity, buyOrder.quantity);
                order.quantity -= matchedQuantity;
                buyOrder.quantity -= matchedQuantity;
                matchedOrders.push({ price: buyOrder.price, quantity: matchedQuantity });
                if(buyOrder.quantity === 0){
                    this.buyOrders.splice(i, 1);
                    i--;
                }
            }
        }
        if(order.quantity > 0){
            this.sellOrders.push(order);
        }
        return matchedOrders;
    }
}

module.exports = OrderMatching;
