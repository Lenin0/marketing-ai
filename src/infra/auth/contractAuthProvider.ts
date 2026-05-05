export interface DecodedToken {
    uid: string;
    email: string | undefined
  }
  
  export interface IContractAuthProvider {
    verifyToken(token: string): Promise<DecodedToken>;
  }