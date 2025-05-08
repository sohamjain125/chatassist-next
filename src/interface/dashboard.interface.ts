export interface HistoryItem {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    timestamp: string;
    [key: string]: any;
  }
  
  export interface UserInfo {
    firstname: string;
    lastname: string;
  }