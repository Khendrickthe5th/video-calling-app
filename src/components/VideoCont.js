import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import "./VideoCont.css";

function VideoCont() {
  const terminateCall = useRef();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [postedData, setPostedData] = useState(true);
  const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  let userName;

  async function makeCall() {
    const peerConnection = new RTCPeerConnection(config);
    peerConnection.onicecandidate = () => {
      console.log(peerConnection);
    };
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  async function initiateCall(event) {
    const peerConnection = new RTCPeerConnection(config);
    let offer = event.target.getAttribute("data-candidate");
    peerConnection.setRemoteDescription(
      new RTCSessionDescription(JSON.parse(offer))
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log(answer, "tarrr")
     postOffersToServer(answer, userName)
    // console.log(answer);

    peerConnection.addEventListener("connectionstatechange", () => {
      if (peerConnection.connectionstate === "connected") {
        console.log("Peers connected!");
      }
    });
  }

  const postData = async function () {
    try {
      userName = prompt("Username Please...?");
      const res = await axios.post("http://localhost:3100/sendCredentials", {
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        data: { candidate: await makeCall(), username: userName },
      });
      setOnlineUsers(res.data);
      console.log(res.data);
      setPostedData(false);
    } catch (err) {
      console.log(err);
    }
  };

  const getUpdateFromServerAtIntervals = async function () {
    let res = await axios.get("http://localhost:3100/intervalUpdates", {
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });

    if (res.data) {
      setOnlineUsers(res.data);
      console.log(res.data);
      console.log("About making another request to server....");
      getUpdateFromServerAtIntervals();
    }
  };

  const postOffersToServer = async function(answer, currUserName){
    const res = await axios.post("http://localhost:3100/postOffers", 
    {
        answer: answer,
        username: currUserName
    },
    {
    mode: "cors",
    headers: {"Content-Type": "application/json"}
    })
    console.log(answer, currUserName, "wizzy")
  }


  useEffect(() => {
    postedData && postData();
    !postedData && getUpdateFromServerAtIntervals();
  });

  return (
    <section>
      <div className="vidCont">
        <div className="startCall">Start Call!</div>
        <div ref={terminateCall} className="endCall">
          End Call
        </div>

        <div>
          {onlineUsers &&
            onlineUsers.map((item, index) => {
              return (
                <div
                  key={index}
                  data-candidate={JSON.stringify(item.candidate)}
                  onClick={initiateCall}
                >
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
