import React, { useEffect, useRef, useState } from "react";
import "./map.css";
import Constants from "../Constants";
import Popover from "./popover";
import MainMenu from "./mainmenu";

function Map() {
  const canvas = useRef();
  const isMountedRef = useRef(null);

  const [map, setMap] = useState({});
  const [popoverPos, setPopoverPos] = useState({
    style: { left: -1, top: -1, display: "none" }
  });
  const [vertexConverionMap, setVertexConversionMap] = useState({});

  let addedResizeHandler = false;
  const MIN_LAT = -90;
  const MAX_LAT = 90;
  const MIN_LON = -180;
  const MAX_LON = 180;
  const VERTEX_RADIUS = 5;
  const fetchMap = async () => {
    const fetchMap = await fetch(`${Constants.MAP_URL}`);

    const map = await fetchMap.json();
    if (isMountedRef.current) {
      setMap(map); // Map doesn't change immediately. Need to register another useEffect which listens on changes in map.
    }
  };

  // Called whenever there is change in map
  useEffect(() => {
    drawEdges();
    drawVertices();
    //requestAnimationFrame(draw); // todo : should this be used?
  }, [vertexConverionMap]);

  // Called whenever there is change in map
  useEffect(() => {
    requestAnimationFrame(draw);
    if (!addedResizeHandler) {
      window.addEventListener("resize", function() {
        console.log("resized");
        requestAnimationFrame(draw);
      });
      addedResizeHandler = true;
    }
  }, [map]);

  function fix_dpi() {
    const currentCanvas = canvas.current;
    // console.log(
    //   "fix dpi called new width =" +
    //     document.body.clientWidth +
    //     ", height = " +
    //     document.body.clientHeight
    // );
    currentCanvas.setAttribute("width", document.body.clientWidth - 5); //document.width is obsolete
    currentCanvas.setAttribute("height", document.body.clientHeight - 5); //document.height is obsolete
  }

  function draw() {
    // console.log("draw called");
    const vertices = map.vertices;
    if (!vertices) {
      return;
    }
    fix_dpi();
    convertCoordinates();
  }

  function convertCoordinates() {
    const vertices = map.vertices;
    const vMap = {};
    for (var i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      const currentCanvas = canvas.current;
      const boundary = 6 * VERTEX_RADIUS;
      let style_height =
        +getComputedStyle(currentCanvas)
          .getPropertyValue("height")
          .slice(0, -2) - boundary;
      //get CSS width
      let style_width =
        +getComputedStyle(currentCanvas)
          .getPropertyValue("width")
          .slice(0, -2) - boundary;
      const x =
        2 * VERTEX_RADIUS +
        ((vertex.longitude - MIN_LON) * style_width) / (MAX_LON - MIN_LON);
      const y =
        style_height -
        ((vertex.latitude - MIN_LAT) * style_height) / (MAX_LAT - MIN_LAT);
      vMap[vertex.id] = {
        x: x,
        y: y
      };
      //console.log("Added for " + vertex.id);
    }
    setVertexConversionMap(vMap);
  }

  function drawEdges() {
    const currentCanvas = canvas.current;
    const ctx = currentCanvas.getContext("2d");
    const edges = map.edges;
    if (!edges) {
      return;
    }
    for (var i = 0; i < edges.length; i++) {
      //console.log("getting for " + edges[i].v1.id);
      const v1 = vertexConverionMap[edges[i].v1.id];
      const v2 = vertexConverionMap[edges[i].v2.id];
      ctx.beginPath();
      ctx.moveTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.lineWidth = 5;
      ctx.strokeStyle = Constants.EDGE_COLOR;
      ctx.stroke();
    }
  }

  function drawVertex(ctx, x, y, radius, strokeStyle, fillStyle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.stroke();
  }

  function drawVertices() {
    const vertices = map.vertices;
    if (!vertices) {
      return;
    }
    const currentCanvas = canvas.current;
    const ctx = currentCanvas.getContext("2d");
    for (var i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      const x = vertexConverionMap[vertex.id].x;
      const y = vertexConverionMap[vertex.id].y;
      drawVertex(
        ctx,
        x,
        y,
        VERTEX_RADIUS,
        Constants.VERTEX_PRIMARY_COLOR,
        Constants.VERTEX_PRIMARY_COLOR
      );
    }
  }

  // calculate the point on the line that's
  // nearest to the mouse position
  function distOfPoint(v1, v2, px, py) {
    const x1 = v1.x,
      y1 = v1.y,
      x2 = v2.x,
      y2 = v2.y;
    const A = y1 - y2,
      B = x2 - x1;
    const C = -A * x1 - B * y1;
    return Math.abs(A * px + B * py + C) / Math.sqrt(A * A + B * B);
  }

  function isOutside(v1, v2, px, py) {
    let x1 = v1.x < v2.x ? v1.x : v2.x;
    let x2 = v1.x > v2.x ? v1.x : v2.x;
    let y1 = v1.y < v2.y ? v1.y : v2.y;
    let y2 = v1.y > v2.y ? v1.y : v2.y;
    return px < x1 || px > x2 || py < y1 || py > y2;
  }

  function _onMouseMove(evt) {
    var rect = canvas.current.getBoundingClientRect();
    const pos = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
    var edges = map.edges;
    if (!edges) {
      return;
    }
    const ctx = canvas.current.getContext("2d");
    let found1, found2, foundEdge;
    for (var i = 0; i < edges.length; i++) {
      const v1 = vertexConverionMap[edges[i].v1.id];
      const v2 = vertexConverionMap[edges[i].v2.id];
      var distance = distOfPoint(v1, v2, pos.x, pos.y);
      if (distance < 5 && !isOutside(v1, v2, pos.x, pos.y)) {
        foundEdge = edges[i];
        found1 = v1;
        found2 = v2;
      } else {
        drawVertex(
          ctx,
          v1.x,
          v1.y,
          VERTEX_RADIUS,
          Constants.VERTEX_PRIMARY_COLOR,
          Constants.VERTEX_PRIMARY_COLOR
        );
        drawVertex(
          ctx,
          v2.x,
          v2.y,
          VERTEX_RADIUS,
          Constants.VERTEX_PRIMARY_COLOR,
          Constants.VERTEX_PRIMARY_COLOR
        );
      }
    }
    if (found1 && found2) {
      let toColor = foundEdge.bidirectional
        ? Constants.VERTEX_FROM_COLOR
        : Constants.VERTEX_TO_COLOR;
      //console.log("Calling for " + found1.x + "," + found1.y);
      drawVertex(
        ctx,
        found1.x,
        found1.y,
        VERTEX_RADIUS,
        Constants.VERTEX_FROM_COLOR,
        Constants.VERTEX_FROM_COLOR
      );
      //console.log("Calling for " + found2.x + "," + found2.y);
      drawVertex(ctx, found2.x, found2.y, VERTEX_RADIUS, toColor, toColor);
      setPopoverPos({
        style: {
          left: evt.clientX + 10,
          top: evt.clientY + 10,
          display: "block"
        },
        edge: foundEdge
      });
    } else {
      setPopoverPos({
        style: { left: evt.clientX, top: evt.clientY, display: "none" }
      });
    }
  }

  useEffect(() => {
    console.log("useEffect called");
    isMountedRef.current = true;
    fetchMap();
    return () => (isMountedRef.current = false);
  }, []);

  return (
    <React.Fragment>
      <canvas ref={canvas} onMouseMove={_onMouseMove}>
        Your browser does not support the canvas element.
      </canvas>
      <Popover position={popoverPos}></Popover>
      <MainMenu></MainMenu>
    </React.Fragment>
  );
}

export default Map;
