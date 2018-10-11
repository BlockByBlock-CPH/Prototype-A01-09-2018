import axios from 'axios';

export default class Service {
    constructor() {
      let service = axios.create({
        //headers: {csrf: 'token'}
      });
      service.interceptors.response.use(this.handleSuccess, this.handleError);
      this.service = service;
    }
  
    handleSuccess(response) {
      return response;
    }
  
    handleError(error){
      console.log("Error: ",error);
      return Promise.reject(error)
    }
    
    get(path, callback) {
      return this.service.get(path).then(
        (response) => callback(response.status, response.data)
      );
    }

    getAll(path1, path2, path3, callback) {
      return axios.all([
        axios.get(path1),
        axios.get(path2),
        axios.get(path3)
      ])
      .then(axios.spread(
        (resp1, resp2, resp3) => callback(
          [resp1.status,resp2.status,resp3.status],[resp1.data,resp2.data, resp3.data]
      )));
    }
}