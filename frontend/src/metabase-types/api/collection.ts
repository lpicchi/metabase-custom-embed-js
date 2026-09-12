// Collection ID can be either a numeric or entity id
export type RegularCollectionId = number | string;

export type CollectionId =
  | RegularCollectionId
  | "root"
  | "personal"
  | "users"
  | "tenant"
  | "trash";