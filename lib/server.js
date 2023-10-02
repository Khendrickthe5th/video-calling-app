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

let connectedOfferClients = []
let clients = []; 
let connectedAnswerClients = []

const sendEvents = ()=>{
    try{
        clients.forEach((client)=>{
            client.write(`event: newlyJoinedUsers\n`)
            client.write(`data: ${JSON.stringify(connectedOfferClients)}\n`)
            client.write(`id: ${new Date().toLocaleDateString()}\n\n`)
            console.log("successfully sent some events to client", clients.length)
        })
    }
    catch(error){
        console.log("Opps an error occurred when sending server events")
    }
}

app.post("/sendCredentials", (req, res)=>{
    connectedOfferClients.push(req.body.data)
    res.status(200).send(connectedOfferClients)
    console.log(connectedOfferClients)
    sendEvents()
})

app.get("/subscribeStreamEvnt", (req, res)=>{
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Connection": "keeep-alive",
        "Cache-Control": "no-cache"
    })
    clients.push(res)
    // res.write(`event: newlyJoinedUsers\n`)
    // res.write(`data: ${connectedOfferClients}\n`)
    // res.write(`id: ${new Date().toLocaleDateString()}`)
    // console.log(res)
    req.on("close", ()=> res.end("OK"))
})

app.get("/getICECandidates", (req, res)=>{

})

app.listen(PORT, (err)=>{
    if (err){
        console.log("Server failed to start")
    }
    else{
        console.log(`Server successfully running on ${PORT}`)
    }
})