import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import "./VideoCont.css";

function VideoCont() {
  const terminateCall = useRef();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [postedData, setPostedData] = useState(true);
  const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  let userName;
  let UserIntendedToConnectTo;

  async function makeCall(){
    const peerConnection = new RTCPeerConnection(config);
    peerConnection.onicecandidate = () => {
      console.log(peerConnection);
    };
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  async function initiateCall(event){
    const peerConnection = new RTCPeerConnection(config);
    UserIntendedToConnectTo = event.target.innerText
    let x = event.target.getAttribute("data-candidate")
    let offer = JSON.parse(x).candidate
    let offerUsername = JSON.parse(x).username
    console.log(offerUsername, "-------", offer, "checking....")

    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log(answer, "tarrr")
     postOffersToServer(answer, offerUsername)
    // console.log(answer);

    peerConnection.addEventListener("connectionstatechange", () => {
      if (peerConnection.connectionstate === "connected") {
        console.log("Peers connected!");
      }
    });

    // peerConnection.addEventListener("onicecandidate", ()=>{
    //   if
    // })
  }

  const postData = async function () {
    try {
      userName = prompt("Username Please...?");
      const res = await axios.post("http://localhost:3100/sendCredentials",
      { candidate: await makeCall(), username: userName },
      {mode: "cors", headers: { "Content-Type": "application/json" }});
      setOnlineUsers(res.data.offerClients);
      setPostedData(false);
      getUpdateFromServerAtIntervals();
    } catch (err) {
      console.log(err);
    }
  };

  const getUpdateFromServerAtIntervals = async function () {
    let res = await axios.get("http://localhost:3100/intervalUpdates", {
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });
    if (res.data !== onlineUsers){
      setOnlineUsers(res.data.offerClients);
      getUpdateFromServerAtIntervals();
      console.log(res.data, "got new update brooo")
    }
    else{
      getUpdateFromServerAtIntervals();
    }
    
  };

  const postOffersToServer = async function(answer, currUserName){
    let res = await axios.post("http://localhost:3100/postOffers", 
    {answer: answer, username: currUserName},
    { mode: "cors", headers: {"Content-Type": "application/json"}
    })
    // .then((res)=>{console.log(res.data, "rEssy")})

    res.data.answerClients.forEach((item)=>{
      if(item.username === UserIntendedToConnectTo){
        console.log("Yipee a username matched")
      }
      else{
        console.log(item, "Didnt match any")
      }
    })
    // console.log(answer, currUserName, "wizzy")
  }


  useEffect(() => {
    postedData && postData();
    // !postedData && getUpdateFromServerAtIntervals();
  });

  return (
    <section>
      <div className="vidCont">
        <div className="startCall">Start Call!</div>
        <div ref={terminateCall} className="endCall">
          End Call
        </div>

        <div>
          {onlineUsers && onlineUsers.map((item, index) => {
              return (<div key={index} data-candidate={JSON.stringify(item)} onClick={initiateCall}>
                  {item.username}
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
export default VideoCont;
