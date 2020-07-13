import React, { useRef, useState } from "react";
import Constants from "../Constants";
import "./mainmenu.css";
import $ from "jquery";
import helper from "./helpers";

function MainMenu(props) {
  const mainMenu = useRef();
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
      const msg = e.data;
      console.log("recved -");
      console.log(msg);
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

  const bookCab = function() {
    const csrfToken = helper.obtainCSRFToken();
    let formData = new FormData();
    formData.append("_csrf", csrfToken);
    formData.append("a", 2);
    $.ajax({
      method: "POST",
      url: Constants.CAB_URL,
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
    bookCab();
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
          <input type="text" className="form-control" id="fromID" />
        </div>
        <div className="form-group">
          <label htmlFor="toID">To</label>
          <input type="password" className="form-control" id="toID" />
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
