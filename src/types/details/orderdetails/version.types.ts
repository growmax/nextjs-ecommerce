export interface Version {
  versionNumber: number;
  versionName?: string;
  sentBy: string;
  sentDate: string;
  orderId: string;
  orderIdentifier: string;
  orderVersion?: number;
}

export interface SelectedVersion {
  versionNumber: number;
  orderVersion?: number;
  orderIdentifier?: string;
}

export interface UserPreferences {
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
}
