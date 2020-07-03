import React, { useEffect, useRef } from "react";
import "./map.css";

function Map() {
  const canvas = useRef();

  useEffect(() => {
    //get DPI
    //let dpi = window.devicePixelRatio;
    const currentCanvas = canvas.current;
    const ctx = currentCanvas.getContext("2d");
    function fix_dpi() {
      //get CSS height
      //the + prefix casts it to an integer
      //the slice method gets rid of "px"
      currentCanvas.setAttribute("width", document.body.clientWidth); //document.width is obsolete
      currentCanvas.setAttribute("height", document.body.clientHeight); //document.height is obsolete
      // let style_height = +getComputedStyle(currentCanvas)
      //   .getPropertyValue("height")
      //   .slice(0, -2);
      // //get CSS width
      // let style_width = +getComputedStyle(currentCanvas)
      //   .getPropertyValue("width")
      //   .slice(0, -2);
      // console.log("sh" + style_height);
      // console.log("sw" + style_width);
      //scale the canvas
      // currentCanvas.setAttribute("height", style_height * dpi);
      // currentCanvas.setAttribute("width", style_width * dpi);
    }
    function draw() {
      fix_dpi();
      ctx.fillStyle = "#FF0000";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(300, 200);
      ctx.stroke();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }, []);

  return (
    <canvas ref={canvas}>
      Your browser does not support the canvas element.
    </canvas>
  );
}

export default Map;
