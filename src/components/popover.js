import React, { useState } from "react";
import Constants from "../Constants";
import "./popover.css";

function Popover(props) {
  const fromStyle = {
    backgroundColor: Constants.VERTEX_FROM_COLOR
  };

  const toStyle = {
    backgroundColor: Constants.VERTEX_TO_COLOR
  };

  function getVertexInfo(vertex) {
    return (
      <React.Fragment>
        <span className="heading">name</span>: {vertex.name}
        <br></br>
        <span className="heading">lat</span>: {vertex.latitude}
        <br></br>
        <span className="heading">lon</span>: {vertex.longitude}
      </React.Fragment>
    );
  }

  function getEdgeInfo(edge) {
    if (edge) {
      if (edge.bidirectional) {
        return (
          <React.Fragment>
            <div>
              <span className="heading">Bidirectional</span>: true
            </div>
            <div>
              <span className="heading">
                V1 <span className="dot" style={fromStyle}></span>
              </span>
              :{getVertexInfo(edge.v1)}
            </div>
            <div>
              <span className="heading">
                V2 <span className="dot" style={fromStyle}></span>
              </span>
              :{getVertexInfo(edge.v2)}
            </div>
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment>
            <div>
              <span className="heading">Bidirectional</span>: false
            </div>
            <div>
              <span className="heading">
                From <span className="dot" style={fromStyle}></span>
              </span>
              : {getVertexInfo(edge.v1)}
            </div>
            <div>
              <span className="heading">
                To <span className="dot" style={toStyle}></span>
              </span>
              : {getVertexInfo(edge.v2)}
            </div>
          </React.Fragment>
        );
      }
    }
  }

  return (
    <div className="popover-custom" style={props.position.style}>
      {getEdgeInfo(props.position.edge)}
    </div>
  );
}

export default Popover;
