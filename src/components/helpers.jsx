class Helpers {
  obtainCSRFToken = function() {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      let splitCookie = cookies[i].split("=");
      if (splitCookie[0].trim() === "XSRF-TOKEN") {
        return splitCookie[1].trim();
      }
    }
  };
}

const helper = new Helpers();

export default helper;
