require("dotenv").config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const PORT = process.env.PORT

app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use((req, res, next)=>{
    res.append("Access-Control-Allow-Origin", ["http://localhost:3000"]);
    res.append("Access-Control-Allow-Methods", "GET, POST, PUT, UPDATE");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next()
})


// app.get("/home", (req, res)=>{
//     res.status(200).send("Yup, this server is Okayy!!")
//     console.log("Successfully called this endpoint!", req)
// })

// let connectedOfferClients = []
let clients = {offerClients: [], answerClients:[]}
// let clients = []; clients.offerClients
let updateState;

function updateClientArry(newState){
    // clients.push(data)
    updateState = newState
}

app.post("/sendCredentials", async(req, res)=>{
    clients.offerClients.push(req.body)
    res.status(200).send(clients)
    // console.log(connectedOfferClients, "===", req.body)
    updateClientArry("new update")
})

app.get("/intervalUpdates", (req, res)=>{
    if(updateState === "new update"){
        res.status(200).send(clients)
        updateClientArry("old update")
    }
    else{
        const cycle = setInterval(()=>{
            // console.log("Trying again in 5 secs...")
            if(updateState === "new update"){
                res.status(200).send(clients)
                clearInterval(cycle)
            }
        }, 5000)
    }
})

app.post("/postOffers", (req, res)=>{
    clients.answerClients.push(req.body)
    res.status(200).send(clients)
    updateClientArry("new update")
    console.log(req.body, "okay i did ran haha")
})

app.listen(PORT, (err)=>{
    if (err){
        console.log("Server failed to start")
    }
    else{
        console.log(`Server successfully running on ${PORT}`)
    }
})