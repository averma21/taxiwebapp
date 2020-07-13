class Constants {
  static SERVER_URL = ""; //"http://localhost:8080";
  static API_PREFIX = "/api/v1";
  static APP_URL = this.SERVER_URL + this.API_PREFIX;
  static MAP_URL = this.APP_URL + "/maps";
  static CAB_URL = this.APP_URL + "/cabs";
  static EDGE_COLOR = "#28B9A2";
  static VERTEX_PRIMARY_COLOR = "#c82124";
  static VERTEX_FROM_COLOR = "#cd8a56";
  static VERTEX_TO_COLOR = "#000000";
}

export default Constants;
