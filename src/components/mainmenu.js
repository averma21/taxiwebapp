import React, { useRef, useState } from "react";
import Constants from "../Constants";
import "./mainmenu.css";
import $ from "jquery";
import helper from "./helpers";

function MainMenu(props) {
  const mainMenu = useRef();
  const fromVertex = useRef();
  const toVertex = useRef();
  const [mmStyle, setMmStyle] = useState({});
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    console.log(mainMenu);
    const pos = {
      top: mainMenu.current.offsetTop - pos2 + "px",
      left: mainMenu.current.offsetLeft - pos1 + "px"
    };
    console.log(pos);
    // set the element's new position:
    setMmStyle({
      top: mainMenu.current.offsetTop - pos2 + "px",
      left: mainMenu.current.offsetLeft - pos1 + "px"
    });
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }

  function subscribe(regNo) {
    const eventSource = new EventSource(Constants.CAB_URL + "/" + regNo);
    eventSource.onmessage = e => {
      const msg = JSON.parse(e.data);
      console.log("recved -");
      console.log(msg);
      if (msg.tripended == true) {
        console.log("Trip ended. Closing connection");
        eventSource.close();
        setTimeout(function() {
          props.updateCabs([]);
        }, 3000);
      } else {
        const cabs = [];
        cabs.push(msg);
        props.updateCabs(cabs);
      }
    };
    eventSource.onopen = e => console.log("open");
    eventSource.onerror = e => {
      if (e.readyState == EventSource.CLOSED) {
        console.log("close");
      } else {
        console.log(e);
      }
    };
    eventSource.addEventListener(
      "second",
      function(e) {
        console.log("second", e.data);
      },
      false
    );
  }

  const bookCab = function(v1, v2) {
    const csrfToken = helper.obtainCSRFToken();
    let formData = new FormData();
    formData.append("_csrf", csrfToken);
    formData.append("v1", v1);
    formData.append("v2", v2);
    $.ajax({
      method: "POST",
      url: Constants.CAB_URL + "/assign",
      data: formData,
      contentType: false,
      processData: false,
      success: function(res) {
        console.log(res);
        subscribe(res.registrationNo);
      }
    });
    // if (isMountedRef.current) {
    //   setMap(map); // Map doesn't change immediately. Need to register another useEffect which listens on changes in map.
    // }
  };

  function startNavigation(e) {
    e.preventDefault();
    let v1, v2;
    for (let i = 0; i < props.vertices.length; i++) {
      let vertex = props.vertices[i];
      if (vertex.name == fromVertex.current.value) {
        v1 = vertex.id;
      } else if (vertex.name == toVertex.current.value) {
        v2 = vertex.id;
      }
    }
    // console.log(v1);
    // console.log(v2);
    bookCab(v1, v2);
  }

  return (
    <div className="main-menu bg-light" ref={mainMenu} style={mmStyle}>
      <div
        className="p-3 bg-secondary text-white font-weight-bold"
        onMouseDown={dragMouseDown}
      >
        Menu
      </div>
      <form>
        <div className="form-group">
          <label htmlFor="fromID">From</label>
          <input
            type="text"
            className="form-control"
            ref={fromVertex}
            id="fromID"
          />
        </div>
        <div className="form-group">
          <label htmlFor="toID">To</label>
          <input
            type="text"
            className="form-control"
            ref={toVertex}
            id="toID"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={startNavigation}
        >
          Find Path
        </button>
      </form>
    </div>
  );
}

export default MainMenu;
