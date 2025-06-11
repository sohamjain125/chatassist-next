export interface HistoryItem {
    SearchId: number;
    Address: string;
    CreatedAt: string;
    PropertyDetailId: number;
    PropertyNo: string;
    ChatSessionId?: string;
    [key: string]: any;
}
  
export interface UserInfo {
    firstname: string;
    lastname: string;
}