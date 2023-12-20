export interface User {
  username: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  token?: string;
}

export interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  bio: string;
  username: string;
  image: Image;
  email: string;
  address: string;
  phoneNumber: string;
  dateOfBirth: string;
  createdDate: string;
  roles: string[];
}

export interface Image {
  imageUrl: string;
  publicId: string;
}
