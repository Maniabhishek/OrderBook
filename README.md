# OrderBook
Orderbook created using Grenache for node.js

- to run this project , follow below steps
    - npm i (this will install all the dependencies)
    - grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
    - grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
    - node src/main.js 500
- i have also added order simulation between multiple peers