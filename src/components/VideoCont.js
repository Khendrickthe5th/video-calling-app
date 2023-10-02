import axios from "axios"
import React, {useEffect, useRef, useState} from "react"
import "./VideoCont.css";

function VideoCont(){
const initiateCall = useRef()
const terminateCall = useRef()
const [onlineUsers, setOnlineUsers] = useState([])
const [postedData, setPostedData] = useState(true)
let userName;

async function makeCall(){
    const config = {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]}
    const peerConnection = new RTCPeerConnection(config)
    peerConnection.onicecandidate = ()=>{console.log(peerConnection)}
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    return offer
    }
    
    const updateOnlineUserStream = new EventSource("http://localhost:3100/subscribeStreamEvnt")
    updateOnlineUserStream.addEventListener("open", ()=>{
        console.log("stream is open")
    })
    updateOnlineUserStream.addEventListener("error", ()=>{
        console.log("Opps a error occured")
    })
    updateOnlineUserStream.addEventListener("newlyJoinedUsers", (event)=>{
        setOnlineUsers(JSON.parse(event.data))
        console.log(JSON.parse(event.data), "parsed data")
        // console.log("received first stream")
    })

    const postData = async function(){
        try{
            const res = await axios.post("http://localhost:3100/sendCredentials", {
                mode: "cors",
                header: {"Content-Type": "application/json"},
                data:   {candidate: await makeCall(), username: userName}
            })
            setOnlineUsers(res.data)
            console.log(res.data)
            setPostedData(false)
        }
        catch(err){
                console.log(err)
            }
        }

    const getData = async function(){
        axios.get("http://localhost:3100/getICECandidates", {
        mode: "cors",
        header: {"Content-Type": "application/json"},
        })
    }
      
    useEffect(()=>{
    userName = prompt("Username Please...?")
    postedData && postData()
    })


    return(
        <section>
            <div className="vidCont">

                <div ref={initiateCall} className="startCall">Start Call!</div>
                <div ref={terminateCall} className="endCall">End Call</div>

                <div>
                    {onlineUsers && onlineUsers.map((item, index)=>{
                       return(<div key={index}>{item.username}</div>)
                    })}
                </div>
            </div>
        </section>
    )
}
export default VideoCont;